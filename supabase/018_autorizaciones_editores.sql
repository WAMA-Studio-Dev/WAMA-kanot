-- Autorizaciones: editores y admins pueden subirlas por otra persona y cambiar nombres.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Subir: cada miembro la suya; editores y admins, la de cualquiera.
drop policy if exists "subir mi autorizacion" on public.autorizaciones;
create policy "subir mi autorizacion" on public.autorizaciones
  for insert to authenticated
  with check (
    (user_id = (select auth.uid()) and (select public.es_crew()))
    or (select public.es_editor())
  );

-- Cambiar nombre o grupo: quien la subió, o editores y admins.
drop policy if exists "cambiar autorizacion" on public.autorizaciones;
create policy "cambiar autorizacion" on public.autorizaciones
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.es_editor()))
  with check (user_id = (select auth.uid()) or (select public.es_editor()));

-- Archivo: editores y admins pueden subirlo en la carpeta de otra cuenta.
drop policy if exists "subir archivo de autorizacion" on storage.objects;
create policy "subir archivo de autorizacion" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'autorizaciones'
    and (
      ((storage.foldername(name))[2] = (select auth.uid())::text and (select public.es_crew()))
      or (select public.es_editor())
    )
  );
