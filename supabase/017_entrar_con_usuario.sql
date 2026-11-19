-- Entrar con nombre de usuario (además del email).
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Nombre de usuario único ----------
alter table public.profiles add column if not exists usuario text;

do $$ begin
  alter table public.profiles add constraint usuario_valido check (usuario ~ '^[a-z0-9._]{3,20}$');
exception when duplicate_object then null; end $$;

create unique index if not exists profiles_usuario_unico on public.profiles (usuario);

-- Al registrarse se guarda el usuario elegido (si viene).
create or replace function public.crear_perfil()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  u text := nullif(lower(trim(new.raw_user_meta_data ->> 'usuario')), '');
begin
  if u is not null and (u !~ '^[a-z0-9._]{3,20}$' or exists (select 1 from public.profiles where usuario = u)) then
    u := null; -- si no vale o ya existe, se queda sin usuario y lo elige luego en su perfil
  end if;
  insert into public.profiles (id, email, nombre, role, usuario)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles) then 'pendiente'::public.app_role
         else 'admin'::public.app_role end,
    u
  );
  return new;
end;
$$;

-- ---------- 2) ¿Está libre? (para el formulario de registro) ----------
create or replace function public.usuario_libre(p_usuario text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (select 1 from public.profiles where usuario = lower(trim(p_usuario)))
$$;

revoke execute on function public.usuario_libre(text) from public;
grant execute on function public.usuario_libre(text) to anon, authenticated;

-- ---------- 3) Cambiar mi usuario desde el perfil ----------
create or replace function public.cambiar_mi_usuario(p_usuario text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  u text := lower(trim(p_usuario));
begin
  if auth.uid() is null then
    raise exception 'Tienes que iniciar sesión';
  end if;
  if u !~ '^[a-z0-9._]{3,20}$' then
    raise exception 'usuario no valido';
  end if;
  if exists (select 1 from public.profiles where usuario = u and id <> auth.uid()) then
    raise exception 'usuario ocupado';
  end if;
  update public.profiles set usuario = u where id = auth.uid();
end;
$$;

revoke execute on function public.cambiar_mi_usuario(text) from public, anon;
grant execute on function public.cambiar_mi_usuario(text) to authenticated;

-- ---------- 4) Entrar con usuario ----------
-- Solo devuelve el email si la contraseña es correcta (así nadie puede averiguar
-- el email de otra persona). Tras 8 fallos seguidos en 15 minutos, bloquea ese usuario un rato.
create table if not exists public.intentos_entrar (
  usuario text not null,
  momento timestamptz not null default now()
);
alter table public.intentos_entrar enable row level security; -- nadie lo lee desde la app
create index if not exists intentos_entrar_usuario on public.intentos_entrar (usuario, momento);

create or replace function public.email_para_entrar(p_usuario text, p_password text)
returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  u text := lower(trim(p_usuario));
  correo text;
  clave text;
begin
  if (select count(*) from public.intentos_entrar
      where usuario = u and momento > now() - interval '15 minutes') >= 8 then
    raise exception 'demasiados intentos';
  end if;

  select au.email, au.encrypted_password into correo, clave
  from public.profiles p join auth.users au on au.id = p.id
  where p.usuario = u;

  if correo is not null and clave is not null
     and extensions.crypt(p_password, clave) = clave then
    delete from public.intentos_entrar where usuario = u;
    return correo;
  end if;

  insert into public.intentos_entrar (usuario) values (u);
  delete from public.intentos_entrar where momento < now() - interval '1 day';
  return null;
end;
$$;

revoke execute on function public.email_para_entrar(text, text) from public;
grant execute on function public.email_para_entrar(text, text) to anon, authenticated;
