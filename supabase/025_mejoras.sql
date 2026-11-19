-- Mejoras: propuestas del podcast, solicitudes de la agencia, estadísticas de notificaciones
-- y resultados de los campeonatos.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Podcast: proponer a quién entrevistar ----------
create table if not exists public.propuestas_podcast (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre_autor text,
  invitado text not null check (length(invitado) <= 80),
  motivo text check (length(motivo) <= 300),
  created_at timestamptz not null default now()
);
alter table public.propuestas_podcast enable row level security;

drop policy if exists "proponer invitado" on public.propuestas_podcast;
create policy "proponer invitado" on public.propuestas_podcast
  for insert to authenticated with check (user_id = (select auth.uid()) and (select public.es_miembro()));

drop policy if exists "editores ven propuestas" on public.propuestas_podcast;
create policy "editores ven propuestas" on public.propuestas_podcast
  for select to authenticated using ((select public.es_editor()));

drop policy if exists "editores borran propuestas" on public.propuestas_podcast;
create policy "editores borran propuestas" on public.propuestas_podcast
  for delete to authenticated using ((select public.es_editor()));

-- ---------- 2) Agencia: solicitudes que llegan por el formulario (web y app) ----------
create table if not exists public.solicitudes_agencia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  mensaje text,
  created_at timestamptz not null default now()
);
alter table public.solicitudes_agencia enable row level security;

drop policy if exists "editores ven solicitudes agencia" on public.solicitudes_agencia;
create policy "editores ven solicitudes agencia" on public.solicitudes_agencia
  for select to authenticated using ((select public.es_editor()));

drop policy if exists "editores borran solicitudes agencia" on public.solicitudes_agencia;
create policy "editores borran solicitudes agencia" on public.solicitudes_agencia
  for delete to authenticated using ((select public.es_editor()));

-- La usa el servidor al recibir el formulario (limita tamaños para evitar abusos).
create or replace function public.guardar_solicitud_agencia(p_nombre text, p_email text, p_telefono text, p_mensaje text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_email), '') = '' then
    return;
  end if;
  insert into public.solicitudes_agencia (nombre, email, telefono, mensaje)
  values (left(trim(p_nombre), 120), left(trim(p_email), 160), left(p_telefono, 40), left(p_mensaje, 3000));
end;
$$;
revoke execute on function public.guardar_solicitud_agencia(text, text, text, text) from public;
grant execute on function public.guardar_solicitud_agencia(text, text, text, text) to anon, authenticated;

-- ---------- 3) Estadísticas de notificaciones (solo admins) ----------
create or replace function public.estadisticas_notis()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  r jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo admins';
  end if;
  with base as (
    select p.id, p.nombre, p.email, p.role::text as rol, p.grupo, coalesce(p.notis_off, '{}') as off,
           exists (select 1 from public.push_subs s where s.user_id = p.id) as activas
    from public.profiles p
    where p.role::text <> 'pendiente'
  )
  select jsonb_build_object(
    'por_rol', (select coalesce(jsonb_agg(jsonb_build_object('rol', rol, 'total', t, 'activas', a)), '[]') from (
      select rol, count(*) t, count(*) filter (where activas) a from base group by rol) x),
    'por_grupo', (select coalesce(jsonb_agg(jsonb_build_object('grupo', g, 'total', t, 'activas', a)), '[]') from (
      select coalesce(grupo, 'Sin grupo') g, count(*) t, count(*) filter (where activas) a
      from base where rol = 'miembro' group by 1) x),
    'desactivadas', (select coalesce(jsonb_object_agg(tipo, n), '{}') from (
      select unnest(off) tipo, count(*) n from base where activas group by 1) x),
    'sin_notis', (select coalesce(jsonb_agg(jsonb_build_object('nombre', coalesce(nombre, email), 'grupo', grupo) order by grupo nulls last, nombre), '[]')
      from base where rol = 'miembro' and not activas)
  ) into r;
  return r;
end;
$$;
revoke execute on function public.estadisticas_notis() from public, anon;
grant execute on function public.estadisticas_notis() to authenticated;

-- ---------- 4) Resultados de cada campeonato (medallero e historial) ----------
-- [{"grupo": "Knallas", "puesto": 1, "categoria": "Infantil"}, ...]
alter table public.entradas add column if not exists resultados jsonb not null default '[]';
