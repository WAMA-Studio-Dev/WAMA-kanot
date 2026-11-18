-- Foto de perfil y edición del propio perfil.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- 1) Columna para la foto
alter table public.profiles add column if not exists avatar_url text;

-- 2) Carpeta pública "avatares" (las fotos se ven sin iniciar sesión, como en cualquier red social)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Cada persona solo puede tocar su propia carpeta: avatares/<su id>/...
drop policy if exists "ver mis avatares" on storage.objects;
create policy "ver mis avatares" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "subir mi avatar" on storage.objects;
create policy "subir mi avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "borrar mi avatar" on storage.objects;
create policy "borrar mi avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3) Cada persona puede cambiar SU nombre y SU foto (nunca su rol).
create or replace function public.actualizar_mi_perfil(p_nombre text, p_avatar_url text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Tienes que iniciar sesión';
  end if;
  -- La foto solo puede ser una de su propia carpeta de "avatares".
  if p_avatar_url is not null
     and p_avatar_url not like '%/storage/v1/object/public/avatares/' || auth.uid()::text || '/%' then
    raise exception 'Foto no válida';
  end if;
  update public.profiles
     set nombre = coalesce(nullif(trim(p_nombre), ''), nombre),
         avatar_url = p_avatar_url
   where id = auth.uid();
end;
$$;

revoke execute on function public.actualizar_mi_perfil(text, text) from public, anon;
grant execute on function public.actualizar_mi_perfil(text, text) to authenticated;
