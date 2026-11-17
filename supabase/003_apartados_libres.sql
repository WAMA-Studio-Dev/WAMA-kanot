-- Permite crear apartados nuevos desde la app sin volver a tocar la base de datos
-- (Kanot Kamp: "Qué es" y "Profesores", y los que vengan en el futuro).
-- Pega esto en Supabase → SQL Editor → New query → Run.
alter table public.entradas drop constraint if exists entradas_seccion_check;
alter table public.entradas add constraint entradas_seccion_check check (seccion ~ '^[a-z0-9-]{1,40}$');
