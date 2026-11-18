-- Calendario de ensayos 26/27, formación extra de noviembre y campeonatos 2027.
-- Pega esto en Supabase → SQL Editor → New query → Run.
-- Si lo ejecutas dos veces no duplica nada.

insert into public.entradas (seccion, titulo, fecha, hora, lugar, descripcion)
select v.seccion, v.titulo, v.fecha::date, v.hora, v.lugar, v.descripcion
from (values
  -- ---------- ENSAYOS (Horarios) ----------
  -- Septiembre 26
  ('horarios', 'Todos juntos', '2026-09-26', '17:00 – 20:00', null, null),

  -- Octubre 26
  ('horarios', 'Knelo',    '2026-10-11', '9:00 – 10:30',  null, null),
  ('horarios', 'Kanot Jr', '2026-10-11', '10:30 – 12:00', null, null),
  ('horarios', 'Knallas',  '2026-10-11', '12:00 – 13:30', null, null),
  ('horarios', 'Kinkis',   '2026-10-11', '13:30 – 15:00', null, null),

  ('horarios', 'Kanot Jr', '2026-10-24', '10:00 – 12:00', null, null),
  ('horarios', 'Knallas',  '2026-10-24', '12:00 – 14:00', null, null),
  ('horarios', 'Knelo',    '2026-10-24', '15:00 – 17:00', null, null),
  ('horarios', 'Kinkis',   '2026-10-24', '17:00 – 19:00', null, null),

  -- Noviembre 26
  ('horarios', 'Kanot Jr', '2026-11-08', '10:00 – 12:00', null, null),
  ('horarios', 'Knallas',  '2026-11-08', '12:00 – 14:00', null, null),
  ('horarios', 'Kinkis',   '2026-11-08', '15:00 – 17:00', null, null),
  ('horarios', 'Knelo',    '2026-11-08', '17:00 – 19:00', null, null),

  ('horarios', 'Knelo',    '2026-11-22', '10:00 – 12:00', null, null),
  ('horarios', 'Kanot Jr', '2026-11-22', '12:00 – 14:00', null, null),
  ('horarios', 'Knallas',  '2026-11-22', '15:00 – 17:00', null, null),
  ('horarios', 'Kinkis',   '2026-11-22', '17:00 – 19:00', null, null),

  -- Diciembre 26
  ('horarios', 'Knelo',    '2026-12-13', '10:00 – 12:00', null, null),
  ('horarios', 'Kinkis',   '2026-12-13', '12:00 – 14:00', null, null),
  ('horarios', 'Kanot Jr', '2026-12-13', '15:00 – 17:00', null, null),
  ('horarios', 'Knallas',  '2026-12-13', '17:00 – 19:00', null, null),

  -- ---------- FORMACIÓN EXTRA (la del 7 de noviembre ya está en la web) ----------
  ('formaciones', 'Formación extra · Kanot Jr, Knallas y Kinkis', '2026-11-15',
   'Turno 1: 16:00 – 17:30 · Turno 2: 18:00 – 19:30', 'SDC (Sevilla Dance Center)',
   'Las listas de cada turno se pasarán lo antes posible.'),

  -- ---------- CAMPEONATOS 2027 (Competición) ----------
  ('competicion', 'Costa Flow',    '2027-03-06', null, 'Punta Umbría',
   'Horarios sin publicar.'),
  ('competicion', 'Rockda House',  '2027-03-13', null, 'Córdoba',
   'Los horarios todavía no están publicados, pero será aproximadamente desde la mañana hasta la tarde/noche.'),
  ('competicion', 'Jack Unit',     '2027-04-04', 'Salida 7:00 · Regreso 22:00', 'Chiclana',
   'Salida de Bormujos: aproximadamente a las 7:00 h.' || chr(10) || 'Regreso: sobre las 22:00 h, cuando finalice el campeonato.'),
  ('competicion', 'Give Me Hype',  '2027-04-10', 'Salida 8:00 · Regreso 21:30', 'Jerez',
   'Salida de Bormujos: aproximadamente a las 8:00 h.' || chr(10) || 'Regreso: aproximadamente a las 21:30 h.'),
  ('competicion', 'Baila Córdoba', '2027-05-09', 'Salida 8:00 · Regreso 21:30', 'Córdoba',
   'Salida de Bormujos: aproximadamente a las 8:00 h.' || chr(10) || 'Regreso: aproximadamente a las 21:30 h.')
) as v(seccion, titulo, fecha, hora, lugar, descripcion)
where not exists (
  select 1 from public.entradas e
  where e.seccion = v.seccion and e.titulo = v.titulo and e.fecha = v.fecha::date
    and coalesce(e.hora, '') = coalesce(v.hora, '')
);
