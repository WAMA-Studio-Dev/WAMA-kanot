-- Recordatorio automático la tarde antes de cada ensayo y campeonato.
-- Pega esto en Supabase → SQL Editor → New query → Run.
-- Después pega también supabase/privado/022_clave_recordatorios.sql (la clave secreta).

-- Clave secreta que usa el servidor para pedir los datos (nadie la puede leer desde la app).
create table if not exists public.config_privada (
  clave text primary key,
  valor text not null
);
alter table public.config_privada enable row level security; -- sin políticas: nadie la lee desde la app

-- Días que ya se han enviado (para no mandar dos veces el mismo recordatorio).
create table if not exists public.recordatorios_enviados (
  fecha date primary key,
  enviado_at timestamptz not null default now()
);
alter table public.recordatorios_enviados enable row level security;

create or replace function public.clave_cron_valida(p_secreto text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(length(p_secreto) >= 32, false)
     and exists (select 1 from public.config_privada where clave = 'cron' and valor = p_secreto)
$$;
revoke execute on function public.clave_cron_valida(text) from public, anon, authenticated;

-- Qué hay en p_fecha y a qué móviles avisar. Devuelve null si ese día ya se envió.
create or replace function public.datos_recordatorio(p_secreto text, p_fecha date)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  resultado jsonb;
begin
  if not public.clave_cron_valida(p_secreto) then
    raise exception 'Clave no válida';
  end if;

  insert into public.recordatorios_enviados (fecha) values (p_fecha) on conflict do nothing;
  if not found then
    return null; -- ya enviado
  end if;

  select jsonb_build_object(
    'entradas', coalesce((
      select jsonb_agg(jsonb_build_object('seccion', e.seccion, 'titulo', e.titulo, 'hora', e.hora, 'lugar', e.lugar) order by e.hora)
      from public.entradas e
      where e.fecha = p_fecha and e.seccion in ('horarios', 'competicion')
    ), '[]'::jsonb),
    'subs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
        'role', p.role::text, 'grupo', p.grupo, 'notis_off', coalesce(p.notis_off, '{}')
      ))
      from public.push_subs s
      join public.profiles p on p.id = s.user_id
      where p.role::text in ('miembro', 'editor', 'admin')
    ), '[]'::jsonb)
  ) into resultado;

  return resultado;
end;
$$;
revoke execute on function public.datos_recordatorio(text, date) from public;
grant execute on function public.datos_recordatorio(text, date) to anon, authenticated;

-- Borrar móviles que ya no existen (desde el recordatorio automático).
create or replace function public.borrar_push_cron(p_secreto text, p_endpoint text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.clave_cron_valida(p_secreto) then
    delete from public.push_subs where endpoint = p_endpoint;
  end if;
end;
$$;
revoke execute on function public.borrar_push_cron(text, text) from public;
grant execute on function public.borrar_push_cron(text, text) to anon, authenticated;
