-- Mejoras: avisos fijados, horario del campeonato, apuntarse a formaciones,
-- carpetas en la galería y fichas de la agencia.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Avisos fijados arriba en Inicio ----------
alter table public.entradas add column if not exists fijado boolean not null default false;

-- ---------- 2) Horario del día de cada campeonato ----------
-- [{"hora": "09:30", "texto": "Quedada en la puerta"}, ...]
alter table public.entradas add column if not exists programa jsonb not null default '[]';

-- ---------- 3) Quién se apunta a cada formación desde la app (sin DNI) ----------
create table if not exists public.apuntados_formacion (
  id uuid primary key default gen_random_uuid(),
  formacion_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text,
  instagram text,
  created_at timestamptz not null default now()
);
create index if not exists apuntados_formacion_idx on public.apuntados_formacion (formacion_id);
alter table public.apuntados_formacion enable row level security;

drop policy if exists "apuntarme a formacion" on public.apuntados_formacion;
create policy "apuntarme a formacion" on public.apuntados_formacion
  for insert to authenticated with check (user_id = (select auth.uid()) and (select public.es_miembro()));

drop policy if exists "ver apuntados formacion" on public.apuntados_formacion;
create policy "ver apuntados formacion" on public.apuntados_formacion
  for select to authenticated using (user_id = (select auth.uid()) or (select public.es_editor()));

drop policy if exists "borrar apuntados formacion" on public.apuntados_formacion;
create policy "borrar apuntados formacion" on public.apuntados_formacion
  for delete to authenticated using (user_id = (select auth.uid()) or (select public.es_editor()));

-- ---------- 4) Carpetas en la galería de Kanot Crew ----------
alter table public.crew_media add column if not exists carpeta text;

drop policy if exists "mover en la galeria" on public.crew_media;
create policy "mover en la galeria" on public.crew_media
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()))
  with check (user_id = (select auth.uid()) or (select public.es_editor()));

-- Editores también pueden borrar cualquier foto (antes solo admins).
drop policy if exists "borrar de la galeria" on public.crew_media;
create policy "borrar de la galeria" on public.crew_media
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()));

-- ---------- 5) Aviso de episodio nuevo del podcast (lo usa el recordatorio diario) ----------
-- La primera vez solo apunta el episodio actual (no avisa de uno viejo).
create or replace function public.podcast_nuevo(p_secreto text, p_episodio text)
returns table (endpoint text, p256dh text, auth text)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  anterior text;
begin
  if not public.clave_cron_valida(p_secreto) then
    raise exception 'Clave no válida';
  end if;
  select valor into anterior from public.config_privada where clave = 'podcast_ultimo';
  if anterior is not distinct from p_episodio then
    return;
  end if;
  insert into public.config_privada (clave, valor) values ('podcast_ultimo', p_episodio)
  on conflict (clave) do update set valor = excluded.valor;
  if anterior is null then
    return;
  end if;
  return query
    select s.endpoint, s.p256dh, s.auth
    from public.push_subs s
    join public.profiles p on p.id = s.user_id
    where p.role::text in ('usuario', 'miembro', 'editor', 'admin')
      and not ('podcast' = any (coalesce(p.notis_off, '{}')));
end;
$$;
revoke execute on function public.podcast_nuevo(text, text) from public;
grant execute on function public.podcast_nuevo(text, text) to anon, authenticated;

-- ---------- 6) Fichas de los bailarines de la agencia (solo editores y admins) ----------
create table if not exists public.agencia_bailarines (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  estilos text,
  ciudad text,
  instagram text,
  descripcion text,
  foto_path text,
  created_at timestamptz not null default now()
);
alter table public.agencia_bailarines enable row level security;

drop policy if exists "editores gestionan fichas agencia" on public.agencia_bailarines;
create policy "editores gestionan fichas agencia" on public.agencia_bailarines
  for all to authenticated using ((select public.es_editor())) with check ((select public.es_editor()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agencia', 'agencia', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "editores ven fotos agencia" on storage.objects;
create policy "editores ven fotos agencia" on storage.objects
  for select to authenticated using (bucket_id = 'agencia' and (select public.es_editor()));

drop policy if exists "editores suben fotos agencia" on storage.objects;
create policy "editores suben fotos agencia" on storage.objects
  for insert to authenticated with check (bucket_id = 'agencia' and (select public.es_editor()));

drop policy if exists "editores borran fotos agencia" on storage.objects;
create policy "editores borran fotos agencia" on storage.objects
  for delete to authenticated using (bucket_id = 'agencia' and (select public.es_editor()));
