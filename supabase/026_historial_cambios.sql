-- Historial de cambios: quién ha subido, cambiado o borrado algo en la app, y cuándo.
-- Lo apunta la propia base de datos (no se puede saltar desde la app). Solo lo ven los admins.
-- Pega esto en Supabase → SQL Editor → New query → Run.

create table if not exists public.historial_cambios (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid,
  quien text,
  accion text not null check (accion in ('crear', 'cambiar', 'borrar')),
  tabla text not null,
  seccion text,
  que text,
  detalle text
);
create index if not exists historial_cambios_fecha_idx on public.historial_cambios (created_at desc);

alter table public.historial_cambios enable row level security;

drop policy if exists "admins ven historial" on public.historial_cambios;
create policy "admins ven historial" on public.historial_cambios
  for select to authenticated using ((select public.es_admin()));

-- Función que apunta cada cambio.
create or replace function public.apuntar_cambio()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  fila jsonb := to_jsonb(coalesce(new, old));
  antes jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) end;
  accion text := case tg_op when 'INSERT' then 'crear' when 'UPDATE' then 'cambiar' else 'borrar' end;
  que text;
  detalle text;
  cambiados text[];
  quien text;
begin
  -- Qué es (lo más reconocible de la fila).
  que := coalesce(fila ->> 'titulo', fila ->> 'nombre', fila ->> 'bailarin', fila ->> 'invitado', fila ->> 'producto');
  if tg_table_name = 'cuenta_bailarines' then
    select b.nombre into que from public.bailarines b where b.id = (fila ->> 'bailarin_id')::uuid;
    select coalesce(p.nombre, p.email) into detalle from public.profiles p where p.id = (fila ->> 'user_id')::uuid;
    detalle := 'Cuenta: ' || coalesce(detalle, '—');
  elsif tg_table_name = 'inscripciones' then
    select b.nombre into que from public.bailarines b where b.id = (fila ->> 'bailarin_id')::uuid;
    select e.titulo into detalle from public.entradas e where e.id = (fila ->> 'entrada_id')::uuid;
  elsif tg_table_name = 'crew_media' then
    que := coalesce('Carpeta ' || (fila ->> 'carpeta'), 'Galería') || ' · ' || coalesce(fila ->> 'tipo', 'archivo');
  elsif tg_table_name = 'pedidos_merch' then
    que := coalesce(fila ->> 'nombre', 'Pedido') || ' · ' || coalesce(fila ->> 'total', '0') || ' €';
  elsif tg_table_name = 'merch_precios' then
    que := (fila ->> 'producto') || ' · ' || (fila ->> 'precio') || ' €';
  end if;

  -- En los cambios: qué campos se han tocado (sin los internos).
  if tg_op = 'UPDATE' then
    select array_agg(k order by k) into cambiados
    from jsonb_object_keys(to_jsonb(new)) k
    where to_jsonb(new) -> k is distinct from antes -> k
      and k not in ('updated_at', 'created_at', 'id');
    if cambiados is null then
      return new; -- nada relevante
    end if;
    -- En perfiles solo interesa rol, grupo y tipo (no la foto ni las preferencias).
    if tg_table_name = 'profiles' and not (cambiados && array['role', 'grupo', 'tipo']) then
      return new;
    end if;
    if tg_table_name = 'profiles' and 'role' = any (cambiados) then
      detalle := 'Rol: ' || (antes ->> 'role') || ' → ' || (fila ->> 'role');
    elsif tg_table_name = 'profiles' and 'grupo' = any (cambiados) then
      detalle := 'Grupo: ' || coalesce(antes ->> 'grupo', 'ninguno') || ' → ' || coalesce(fila ->> 'grupo', 'ninguno');
    elsif tg_table_name = 'inscripciones' and 'pagado' = any (cambiados) then
      detalle := coalesce(detalle || ' · ', '') || case when (fila ->> 'pagado')::boolean then 'marcado como pagado' else 'quitado el pagado' end;
    else
      detalle := coalesce(detalle || ' · ', '') || 'Cambiado: ' || array_to_string(cambiados, ', ');
    end if;
  end if;

  select coalesce(p.nombre, p.email) into quien from public.profiles p where p.id = auth.uid();

  insert into public.historial_cambios (user_id, quien, accion, tabla, seccion, que, detalle)
  values (auth.uid(), coalesce(quien, case when auth.uid() is null then 'Sistema / Supabase' end), accion, tg_table_name, fila ->> 'seccion', left(que, 200), left(detalle, 300));

  -- De vez en cuando se borra lo de hace más de un año.
  if random() < 0.01 then
    delete from public.historial_cambios where created_at < now() - interval '1 year';
  end if;

  return coalesce(new, old);
end;
$$;

-- Tablas que se vigilan.
do $$
declare
  t text;
begin
  foreach t in array array[
    'entradas', 'documentos_competicion', 'autorizaciones', 'crew_media', 'inscripciones', 'bailarines',
    'cuenta_bailarines', 'pedidos_merch', 'merch_precios', 'agencia_bailarines', 'apuntados_formacion',
    'solicitudes_familia', 'profiles'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists apuntar_cambio on public.%I', t);
      execute format(
        'create trigger apuntar_cambio after insert or update or delete on public.%I for each row execute function public.apuntar_cambio()',
        t
      );
    end if;
  end loop;
end $$;
