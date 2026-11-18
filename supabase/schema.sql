-- =====================================================================
-- App Kanot · esquema de Supabase
-- Pega TODO este archivo en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

-- ---------- Roles y perfiles ----------
do $$ begin
  create type public.app_role as enum ('pendiente', 'usuario', 'miembro', 'editor', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre text,
  role public.app_role not null default 'pendiente',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Funciones de ayuda (security definer para poder leer profiles sin bucles de RLS)
create or replace function public.mi_rol()
returns public.app_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.es_miembro()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.mi_rol() in ('usuario', 'miembro', 'editor', 'admin'), false) $$;

create or replace function public.es_editor()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.mi_rol() in ('editor', 'admin'), false) $$;

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.mi_rol() = 'admin', false) $$;

-- Crear perfil al registrarse. El PRIMER usuario registrado es admin.
create or replace function public.crear_perfil()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles) then 'pendiente'::public.app_role
         else 'admin'::public.app_role end
  );
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

drop policy if exists "ver mi perfil o admin ve todos" on public.profiles;
create policy "ver mi perfil o admin ve todos" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));

drop policy if exists "solo admin cambia perfiles" on public.profiles;
create policy "solo admin cambia perfiles" on public.profiles
  for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

drop policy if exists "solo admin borra perfiles" on public.profiles;
create policy "solo admin borra perfiles" on public.profiles
  for delete to authenticated
  using ((select public.es_admin()));

-- ---------- Contenido de los apartados ----------
create table if not exists public.entradas (
  id uuid primary key default gen_random_uuid(),
  seccion text not null,
  titulo text not null,
  descripcion text,
  fecha date,
  hora text,
  dia_semana smallint check (dia_semana between 1 and 7),
  lugar text,
  enlace text,
  orden integer not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El nombre del apartado lo decide la app (solo minúsculas, números y guiones).
alter table public.entradas drop constraint if exists entradas_seccion_check;
alter table public.entradas add constraint entradas_seccion_check check (seccion ~ '^[a-z0-9-]{1,40}$');

create index if not exists entradas_seccion_idx on public.entradas (seccion);
create index if not exists entradas_created_by_idx on public.entradas (created_by);

alter table public.entradas enable row level security;

drop policy if exists "miembros leen entradas" on public.entradas;
create policy "miembros leen entradas" on public.entradas
  for select to authenticated using ((select public.es_miembro()));

drop policy if exists "editores crean entradas" on public.entradas;
create policy "editores crean entradas" on public.entradas
  for insert to authenticated with check ((select public.es_editor()));

drop policy if exists "editores editan entradas" on public.entradas;
create policy "editores editan entradas" on public.entradas
  for update to authenticated
  using ((select public.es_editor())) with check ((select public.es_editor()));

drop policy if exists "editores borran entradas" on public.entradas;
create policy "editores borran entradas" on public.entradas
  for delete to authenticated using ((select public.es_editor()));

create or replace function public.tocar_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists entradas_updated_at on public.entradas;
create trigger entradas_updated_at before update on public.entradas
  for each row execute function public.tocar_updated_at();

-- ---------- Gestor de archivos (solo editores y admins) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('archivos', 'archivos', false, 52428800) -- 50 MB por archivo
on conflict (id) do nothing;

drop policy if exists "editores leen archivos" on storage.objects;
create policy "editores leen archivos" on storage.objects
  for select to authenticated
  using (bucket_id = 'archivos' and (select public.es_editor()));

drop policy if exists "editores suben archivos" on storage.objects;
create policy "editores suben archivos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'archivos' and (select public.es_editor()));

drop policy if exists "editores actualizan archivos" on storage.objects;
create policy "editores actualizan archivos" on storage.objects
  for update to authenticated
  using (bucket_id = 'archivos' and (select public.es_editor()));

drop policy if exists "editores borran archivos" on storage.objects;
create policy "editores borran archivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'archivos' and (select public.es_editor()));
