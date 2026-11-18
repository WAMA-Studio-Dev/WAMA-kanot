-- Rol "Miembro de Kanot" + autorizaciones de campeonatos.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- 0) Nuevo rol: miembro (Kanot Crew). Solo miembros, editores y admins entran en Kanot Crew.
alter type public.app_role add value if not exists 'miembro' before 'editor';

-- Se compara como texto para poder usar el rol nuevo en este mismo script.
create or replace function public.es_miembro()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.mi_rol()::text in ('usuario', 'miembro', 'editor', 'admin'), false) $$;

create or replace function public.es_crew()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.mi_rol()::text in ('miembro', 'editor', 'admin'), false) $$;

-- Horarios, competición y formaciones (Kanot Crew) solo los ve la crew.
drop policy if exists "miembros leen entradas" on public.entradas;
create policy "miembros leen entradas" on public.entradas
  for select to authenticated
  using (
    (select public.es_miembro())
    and (seccion not in ('horarios', 'competicion', 'formaciones') or (select public.es_crew()))
  );

-- 1) Documento oficial de la organización (lo sube un editor/admin en cada campeonato)
alter table public.entradas add column if not exists documento_path text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos', 'documentos', false, 20971520) -- 20 MB
on conflict (id) do nothing;

drop policy if exists "miembros leen documentos" on storage.objects;
create policy "miembros leen documentos" on storage.objects
  for select to authenticated
  using (bucket_id = 'documentos' and (select public.es_crew()));

drop policy if exists "editores suben documentos" on storage.objects;
create policy "editores suben documentos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documentos' and (select public.es_editor()));

drop policy if exists "editores borran documentos" on storage.objects;
create policy "editores borran documentos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documentos' and (select public.es_editor()));

-- 2) Autorizaciones firmadas que suben las familias
create table if not exists public.autorizaciones (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subido_por text,
  bailarin text not null,
  grupo text,
  archivo_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists autorizaciones_entrada_idx on public.autorizaciones (entrada_id);
create index if not exists autorizaciones_user_idx on public.autorizaciones (user_id);

alter table public.autorizaciones enable row level security;

-- Cada familia ve las suyas; editores y admins ven todas.
drop policy if exists "ver autorizaciones" on public.autorizaciones;
create policy "ver autorizaciones" on public.autorizaciones
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()));

drop policy if exists "subir mi autorizacion" on public.autorizaciones;
create policy "subir mi autorizacion" on public.autorizaciones
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.es_crew()));

drop policy if exists "borrar autorizacion" on public.autorizaciones;
create policy "borrar autorizacion" on public.autorizaciones
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()));

-- Archivos: autorizaciones/<id del campeonato>/<id de la familia>/archivo
insert into storage.buckets (id, name, public, file_size_limit)
values ('autorizaciones', 'autorizaciones', false, 15728640) -- 15 MB
on conflict (id) do nothing;

drop policy if exists "ver archivos de autorizacion" on storage.objects;
create policy "ver archivos de autorizacion" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'autorizaciones'
    and ((storage.foldername(name))[2] = (select auth.uid())::text or (select public.es_editor()))
  );

drop policy if exists "subir archivo de autorizacion" on storage.objects;
create policy "subir archivo de autorizacion" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'autorizaciones'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and (select public.es_crew())
  );

drop policy if exists "borrar archivo de autorizacion" on storage.objects;
create policy "borrar archivo de autorizacion" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'autorizaciones'
    and ((storage.foldername(name))[2] = (select auth.uid())::text or (select public.es_editor()))
  );
