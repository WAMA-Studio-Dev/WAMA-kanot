-- Inscripciones: marcar quién ha pagado (lo marcan editores y admins).
-- Pega esto en Supabase → SQL Editor → New query → Run.

alter table public.inscripciones add column if not exists pagado boolean not null default false;

-- Jack Unit: ya ha pagado todo el mundo.
update public.inscripciones i
   set pagado = true
  from public.entradas e
 where e.id = i.entrada_id and e.seccion = 'competicion' and e.titulo = 'Jack Unit';
