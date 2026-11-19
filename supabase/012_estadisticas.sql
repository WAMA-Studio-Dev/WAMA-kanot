-- Estadísticas de uso de la app (solo las ven los admins).
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Un registro por persona, día y apartado visitado (no guarda nada más).
create table if not exists public.actividad (
  user_id uuid not null references auth.users (id) on delete cascade,
  dia date not null default current_date,
  apartado text not null,
  instalada boolean not null default false,
  desde_noti boolean not null default false,
  primary key (user_id, dia, apartado)
);
create index if not exists actividad_dia_idx on public.actividad (dia);

alter table public.actividad enable row level security;
-- Nadie lee la tabla directamente: se escribe con registrar_actividad y se resume con estadisticas().

create or replace function public.registrar_actividad(p_apartado text, p_instalada boolean, p_noti boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or p_apartado !~ '^[a-z0-9-]{1,40}$' then
    return;
  end if;
  insert into public.actividad (user_id, dia, apartado, instalada, desde_noti)
  values (auth.uid(), current_date, p_apartado, coalesce(p_instalada, false), coalesce(p_noti, false))
  on conflict (user_id, dia, apartado) do update
    set instalada = public.actividad.instalada or excluded.instalada,
        desde_noti = public.actividad.desde_noti or excluded.desde_noti;
end;
$$;

revoke execute on function public.registrar_actividad(text, boolean, boolean) from public, anon;
grant execute on function public.registrar_actividad(text, boolean, boolean) to authenticated;

-- Resumen para el panel de estadísticas.
create or replace function public.estadisticas()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  resultado jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo admins';
  end if;
  select jsonb_build_object(
    'roles', (select coalesce(jsonb_object_agg(r, n), '{}') from (
                select role::text as r, count(*) as n from public.profiles group by role) x),
    'grupos', (select coalesce(jsonb_object_agg(g, n), '{}') from (
                select coalesce(grupo, 'Sin grupo') as g, count(*) as n from public.profiles
                where role::text = 'miembro' group by 1) x),
    'activos_hoy', (select count(distinct user_id) from public.actividad where dia = current_date),
    'activos_7', (select count(distinct user_id) from public.actividad where dia > current_date - 7),
    'activos_30', (select count(distinct user_id) from public.actividad where dia > current_date - 30),
    'instalada_30', (select count(distinct user_id) from public.actividad where instalada and dia > current_date - 30),
    'notis_activas', (select count(distinct user_id) from public.push_subs),
    'desde_noti_30', (select count(*) from public.actividad where desde_noti and dia > current_date - 30),
    'apartados_30', (select coalesce(jsonb_object_agg(apartado, n), '{}') from (
                select apartado, count(distinct user_id) as n from public.actividad
                where dia > current_date - 30 group by apartado) x),
    'por_dia', (select coalesce(jsonb_agg(jsonb_build_object('dia', d, 'n', n) order by d), '[]') from (
                select dia as d, count(distinct user_id) as n from public.actividad
                where dia > current_date - 14 group by dia) x),
    'autorizaciones', (select count(*) from public.autorizaciones),
    'galeria', (select count(*) from public.crew_media),
    'avisos', (select count(*) from public.entradas where seccion in ('avisos', 'avisos-crew'))
  ) into resultado;
  return resultado;
end;
$$;

revoke execute on function public.estadisticas() from public, anon;
grant execute on function public.estadisticas() to authenticated;
