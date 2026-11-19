-- Inscripciones a campeonatos: cuánto cuesta a cada bailarín y si quiere hacer solo/pareja.
-- (Los pagos se siguen llevando en el Excel.)
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- Bailarines ----------
create table if not exists public.bailarines (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  grupos text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Qué bailarines son de cada cuenta (lo asigna un admin)
create table if not exists public.cuenta_bailarines (
  user_id uuid not null references auth.users (id) on delete cascade,
  bailarin_id uuid not null references public.bailarines (id) on delete cascade,
  primary key (user_id, bailarin_id)
);
create index if not exists cuenta_bailarines_bailarin_idx on public.cuenta_bailarines (bailarin_id);

create or replace function public.es_mi_bailarin(p_bailarin uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.cuenta_bailarines where user_id = auth.uid() and bailarin_id = p_bailarin)
$$;

alter table public.bailarines enable row level security;
alter table public.cuenta_bailarines enable row level security;

drop policy if exists "ver bailarines" on public.bailarines;
create policy "ver bailarines" on public.bailarines
  for select to authenticated using ((select public.es_editor()) or (select public.es_mi_bailarin(id)));
drop policy if exists "editores gestionan bailarines" on public.bailarines;
create policy "editores gestionan bailarines" on public.bailarines
  for all to authenticated using ((select public.es_editor())) with check ((select public.es_editor()));

drop policy if exists "ver asignaciones" on public.cuenta_bailarines;
create policy "ver asignaciones" on public.cuenta_bailarines
  for select to authenticated using (user_id = (select auth.uid()) or (select public.es_editor()));
drop policy if exists "admins asignan bailarines" on public.cuenta_bailarines;
create policy "admins asignan bailarines" on public.cuenta_bailarines
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- ---------- Opciones de solo/pareja de cada campeonato ----------
-- opciones_extra: [{"nombre": "Pareja", "precio": 15}, ...]  ·  limite_extra: hasta cuándo se puede elegir
alter table public.entradas add column if not exists opciones_extra jsonb not null default '[]';
alter table public.entradas add column if not exists limite_extra date;

-- ---------- Inscripciones ----------
create table if not exists public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas (id) on delete cascade,
  bailarin_id uuid not null references public.bailarines (id) on delete cascade,
  grupos text,
  categorias integer not null default 1,
  importe numeric(8, 2) not null default 0,
  extra_opcion text,            -- null = no hace solo/pareja
  extra_importe numeric(8, 2) not null default 0,
  pareja_con text,
  updated_at timestamptz not null default now(),
  unique (entrada_id, bailarin_id)
);
create index if not exists inscripciones_bailarin_idx on public.inscripciones (bailarin_id);

alter table public.inscripciones enable row level security;

drop policy if exists "ver inscripciones" on public.inscripciones;
create policy "ver inscripciones" on public.inscripciones
  for select to authenticated using ((select public.es_editor()) or (select public.es_mi_bailarin(bailarin_id)));
drop policy if exists "editores gestionan inscripciones" on public.inscripciones;
create policy "editores gestionan inscripciones" on public.inscripciones
  for all to authenticated using ((select public.es_editor())) with check ((select public.es_editor()));

-- El bailarín (su cuenta) elige solo/pareja: valida la opción, el precio y la fecha límite.
create or replace function public.elegir_extra(p_inscripcion uuid, p_opcion text, p_pareja_con text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  ins public.inscripciones;
  ent public.entradas;
  precio numeric;
begin
  select * into ins from public.inscripciones where id = p_inscripcion;
  if ins.id is null or not (public.es_mi_bailarin(ins.bailarin_id) or public.es_editor()) then
    raise exception 'No puedes cambiar esta inscripción';
  end if;
  select * into ent from public.entradas where id = ins.entrada_id;
  if ent.limite_extra is not null and current_date > ent.limite_extra and not public.es_editor() then
    raise exception 'Ya ha pasado la fecha límite para elegir';
  end if;
  if p_opcion is null or p_opcion = '' then
    update public.inscripciones set extra_opcion = null, extra_importe = 0, pareja_con = null, updated_at = now()
    where id = p_inscripcion;
    return;
  end if;
  select (o ->> 'precio')::numeric into precio
  from jsonb_array_elements(ent.opciones_extra) o
  where o ->> 'nombre' = p_opcion;
  if precio is null then
    raise exception 'Esa opción no existe en este campeonato';
  end if;
  update public.inscripciones
     set extra_opcion = p_opcion, extra_importe = precio,
         pareja_con = nullif(trim(p_pareja_con), ''), updated_at = now()
   where id = p_inscripcion;
end;
$$;

revoke execute on function public.elegir_extra(uuid, text, text) from public, anon;
grant execute on function public.elegir_extra(uuid, text, text) to authenticated;
