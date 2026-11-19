-- Familias: la madre/padre elige a su hijo/a de la lista (solo miembros de Kanot Crew).
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Los miembros pueden ver la lista de bailarines (solo nombre y grupos; los importes siguen siendo privados).
drop policy if exists "ver bailarines" on public.bailarines;
create policy "ver bailarines" on public.bailarines
  for select to authenticated
  using ((select public.es_crew()) or (select public.es_mi_bailarin(id)));

-- La solicitud guarda el bailarín elegido de la lista.
alter table public.solicitudes_familia add column if not exists bailarin_id uuid references public.bailarines (id) on delete cascade;

-- Solo los miembros de Kanot Crew pueden pedir vincular a un hijo/a.
drop policy if exists "pedir vincular hijo" on public.solicitudes_familia;
create policy "pedir vincular hijo" on public.solicitudes_familia
  for insert to authenticated
  with check (user_id = (select auth.uid()) and estado = 'pendiente' and (select public.es_crew()));
