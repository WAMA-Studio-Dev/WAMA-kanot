-- Añade los apartados Agencia y Fotografía.
-- Pega esto en Supabase → SQL Editor → New query → Run.
alter table public.entradas drop constraint if exists entradas_seccion_check;
alter table public.entradas add constraint entradas_seccion_check check (seccion in
  ('horarios', 'formaciones', 'kodigo-klub', 'kanot-kamp', 'competicion', 'podcast', 'agencia', 'fotografia'));
