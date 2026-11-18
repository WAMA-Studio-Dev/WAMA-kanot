-- Superadmin, roles protegidos, Agencia solo admins, galería de Kanot Crew y portfolio de Fotografía.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Superadmin ----------
alter table public.profiles add column if not exists super_admin boolean not null default false;

create or replace function public.es_superadmin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select super_admin from public.profiles where id = auth.uid()), false) $$;

-- El primer admin que se registró (tú) pasa a ser superadmin.
update public.profiles set super_admin = true
where id = (select id from public.profiles where role = 'admin' order by created_at limit 1);

-- ---------- 2) Proteger roles ----------
-- Los admins cambian roles, pero NO el de otro admin. Solo el superadmin puede tocar admins
-- y nadie (salvo desde Supabase) puede dar o quitar el superadmin.
create or replace function public.proteger_roles()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Cambios hechos desde el panel de Supabase (sin usuario de la app): permitidos.
  if auth.uid() is null then
    return new;
  end if;
  if new.super_admin is distinct from old.super_admin then
    raise exception 'El superadmin solo se cambia desde Supabase';
  end if;
  if new.role is distinct from old.role then
    if old.super_admin then
      raise exception 'No se puede cambiar el rol del superadmin';
    end if;
    if old.role::text = 'admin' and not public.es_superadmin() then
      raise exception 'No puedes cambiar el rol de otro admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_roles on public.profiles;
create trigger proteger_roles before update on public.profiles
  for each row execute function public.proteger_roles();

-- ---------- 3) Agencia solo para admins ----------
drop policy if exists "miembros leen entradas" on public.entradas;
create policy "miembros leen entradas" on public.entradas
  for select to authenticated
  using (
    (select public.es_miembro())
    and (seccion not in ('horarios', 'competicion', 'formaciones') or (select public.es_crew()))
    and (seccion <> 'agencia' or (select public.es_admin()))
  );

-- ---------- 4) Galería de Kanot Crew (fotos y vídeos que sube cualquier miembro) ----------
create table if not exists public.crew_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subido_por text,
  archivo_path text not null,
  tipo text not null default 'foto' check (tipo in ('foto', 'video')),
  created_at timestamptz not null default now()
);
create index if not exists crew_media_user_idx on public.crew_media (user_id);

alter table public.crew_media enable row level security;

drop policy if exists "crew ve la galeria" on public.crew_media;
create policy "crew ve la galeria" on public.crew_media
  for select to authenticated using ((select public.es_crew()));

drop policy if exists "crew sube a la galeria" on public.crew_media;
create policy "crew sube a la galeria" on public.crew_media
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.es_crew()));

drop policy if exists "borrar de la galeria" on public.crew_media;
create policy "borrar de la galeria" on public.crew_media
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.es_admin()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('crew', 'crew', false, 52428800) -- 50 MB por archivo
on conflict (id) do nothing;

drop policy if exists "crew ve archivos de la galeria" on storage.objects;
create policy "crew ve archivos de la galeria" on storage.objects
  for select to authenticated using (bucket_id = 'crew' and (select public.es_crew()));

drop policy if exists "crew sube archivos a la galeria" on storage.objects;
create policy "crew sube archivos a la galeria" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'crew' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.es_crew())
  );

drop policy if exists "borrar archivos de la galeria" on storage.objects;
create policy "borrar archivos de la galeria" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'crew'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.es_admin()))
  );

-- ---------- 5) Portfolio de Fotografía (lo suben los admins, lo ve todo el mundo) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "ver portfolio" on storage.objects;
create policy "ver portfolio" on storage.objects
  for select to authenticated using (bucket_id = 'portfolio');

drop policy if exists "admins suben portfolio" on storage.objects;
create policy "admins suben portfolio" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and (select public.es_admin()));

drop policy if exists "admins borran portfolio" on storage.objects;
create policy "admins borran portfolio" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and (select public.es_admin()));

-- ---------- 6) Kanot Kamp: intensivo de verano 2027 ----------
insert into public.entradas (seccion, titulo, descripcion, orden)
select 'kanot-kamp-info', '¿Qué es Kanot Kamp?',
  'Un intensivo de verano de 3 días con 12 profesores externos: 4 profesores al día y 2 horas con cada uno.' || chr(10) ||
  'Además habrá battles y actividades.', 0
where not exists (select 1 from public.entradas where seccion = 'kanot-kamp-info' and titulo = '¿Qué es Kanot Kamp?');

insert into public.entradas (seccion, titulo, fecha, hora, descripcion)
select 'kanot-kamp', 'Kanot Kamp · Intensivo de verano 2027', '2027-06-28', '28, 29 y 30 de junio',
  '3 días · 12 profesores externos (4 al día, 2 horas con cada uno) · battles y actividades.' || chr(10) ||
  'Profesores, precio e inscripciones: próximamente.'
where not exists (select 1 from public.entradas where seccion = 'kanot-kamp' and fecha = '2027-06-28');
