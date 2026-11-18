-- Los editores pueden hacer de todo menos gestionar roles (eso sigue siendo solo de admins).
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Agencia: la ven editores y admins
drop policy if exists "miembros leen entradas" on public.entradas;
create policy "miembros leen entradas" on public.entradas
  for select to authenticated
  using (
    (select public.es_miembro())
    and (seccion not in ('horarios', 'competicion', 'formaciones') or (select public.es_crew()))
    and (seccion <> 'agencia' or (select public.es_editor()))
  );

-- Galería de la crew: editores y admins pueden borrar cualquier archivo
drop policy if exists "borrar de la galeria" on public.crew_media;
create policy "borrar de la galeria" on public.crew_media
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()));

drop policy if exists "borrar archivos de la galeria" on storage.objects;
create policy "borrar archivos de la galeria" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'crew'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.es_editor()))
  );

-- Portfolio: lo suben y borran editores y admins
drop policy if exists "admins suben portfolio" on storage.objects;
create policy "admins suben portfolio" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and (select public.es_editor()));

drop policy if exists "admins borran portfolio" on storage.objects;
create policy "admins borran portfolio" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and (select public.es_editor()));
