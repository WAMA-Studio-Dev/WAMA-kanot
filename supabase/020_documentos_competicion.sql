-- Documentos de cada campeonato, separados por tipo (Autorización, Bases, Horarios, Música, Otros).
-- Pega esto en Supabase → SQL Editor → New query → Run.

create table if not exists public.documentos_competicion (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas (id) on delete cascade,
  tipo text not null default 'Otros',
  nombre text not null,
  archivo_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists documentos_competicion_entrada_idx on public.documentos_competicion (entrada_id);

alter table public.documentos_competicion enable row level security;

drop policy if exists "crew ve documentos" on public.documentos_competicion;
create policy "crew ve documentos" on public.documentos_competicion
  for select to authenticated using ((select public.es_crew()));

drop policy if exists "editores gestionan documentos" on public.documentos_competicion;
create policy "editores gestionan documentos" on public.documentos_competicion
  for all to authenticated using ((select public.es_editor())) with check ((select public.es_editor()));

-- El "documento de la organización" que ya hubiera subido pasa a la lista como Autorización.
insert into public.documentos_competicion (entrada_id, tipo, nombre, archivo_path)
select id, 'Autorización', 'Autorización oficial', documento_path
from public.entradas
where documento_path is not null
  and not exists (select 1 from public.documentos_competicion d where d.archivo_path = entradas.documento_path);

update public.entradas set documento_path = null where documento_path is not null;
