-- Tablón de avisos, notificaciones en el móvil y "quién falta" en las autorizaciones.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Avisos ----------
-- Se guardan en "entradas": seccion 'avisos' (para todos) o 'avisos-crew' (solo Kanot Crew).
drop policy if exists "miembros leen entradas" on public.entradas;
create policy "miembros leen entradas" on public.entradas
  for select to authenticated
  using (
    (select public.es_miembro())
    and (seccion not in ('horarios', 'competicion', 'formaciones', 'avisos-crew') or (select public.es_crew()))
    and (seccion <> 'agencia' or (select public.es_editor()))
  );

-- ---------- 2) Notificaciones: un registro por móvil que las activa ----------
create table if not exists public.push_subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subs (user_id);

alter table public.push_subs enable row level security;

drop policy if exists "ver mis suscripciones" on public.push_subs;
create policy "ver mis suscripciones" on public.push_subs
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "crear mi suscripcion" on public.push_subs;
create policy "crear mi suscripcion" on public.push_subs
  for insert to authenticated with check (user_id = (select auth.uid()) and (select public.es_miembro()));

drop policy if exists "borrar mi suscripcion" on public.push_subs;
create policy "borrar mi suscripcion" on public.push_subs
  for delete to authenticated using (user_id = (select auth.uid()));

-- Solo editores/admins obtienen a quién enviar ('todos' o 'crew').
create or replace function public.push_destinos(p_destino text)
returns table (endpoint text, p256dh text, auth text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.es_editor() then
    raise exception 'Solo editores y admins pueden enviar notificaciones';
  end if;
  return query
    select s.endpoint, s.p256dh, s.auth
    from public.push_subs s
    join public.profiles p on p.id = s.user_id
    where (p_destino = 'crew' and p.role::text in ('miembro', 'editor', 'admin'))
       or (p_destino <> 'crew' and p.role::text in ('usuario', 'miembro', 'editor', 'admin'));
end;
$$;

-- Limpia móviles que ya no existen (lo usa el envío).
create or replace function public.borrar_push_caducada(p_endpoint text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.es_editor() then
    delete from public.push_subs where endpoint = p_endpoint;
  end if;
end;
$$;

revoke execute on function public.push_destinos(text) from public, anon;
grant execute on function public.push_destinos(text) to authenticated;
revoke execute on function public.borrar_push_caducada(text) from public, anon;
grant execute on function public.borrar_push_caducada(text) to authenticated;

-- ---------- 3) Miembros de Kanot Crew (para ver quién falta por entregar) ----------
create or replace function public.crew_miembros()
returns table (id uuid, nombre text, email text, grupo text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.es_editor() then
    raise exception 'Solo editores y admins';
  end if;
  return query
    select p.id, p.nombre, p.email, p.grupo
    from public.profiles p
    where p.role::text = 'miembro'
    order by p.grupo nulls last, p.nombre;
end;
$$;

revoke execute on function public.crew_miembros() from public, anon;
grant execute on function public.crew_miembros() to authenticated;
