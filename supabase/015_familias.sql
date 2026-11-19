-- Cuentas de familia: una madre, padre o tutor/a solicita vincular a su hijo/a y un admin lo aprueba.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Tipo de cuenta: el propio bailarín o su familia
alter table public.profiles add column if not exists tipo text not null default 'bailarin';
alter table public.profiles drop constraint if exists profiles_tipo_check;
alter table public.profiles add constraint profiles_tipo_check check (tipo in ('bailarin', 'familia'));

-- Solicitudes
create table if not exists public.solicitudes_familia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  hijo_nombre text not null check (length(trim(hijo_nombre)) between 2 and 80),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now()
);
create index if not exists solicitudes_familia_user_idx on public.solicitudes_familia (user_id);

alter table public.solicitudes_familia enable row level security;

drop policy if exists "ver solicitudes" on public.solicitudes_familia;
create policy "ver solicitudes" on public.solicitudes_familia
  for select to authenticated using (user_id = (select auth.uid()) or (select public.es_admin()));

drop policy if exists "pedir vincular hijo" on public.solicitudes_familia;
create policy "pedir vincular hijo" on public.solicitudes_familia
  for insert to authenticated
  with check (user_id = (select auth.uid()) and estado = 'pendiente' and (select public.es_miembro()));

-- La familia puede cancelar su solicitud pendiente; el admin puede borrar cualquiera.
drop policy if exists "borrar solicitud" on public.solicitudes_familia;
create policy "borrar solicitud" on public.solicitudes_familia
  for delete to authenticated
  using ((user_id = (select auth.uid()) and estado = 'pendiente') or (select public.es_admin()));

-- El admin aprueba: vincula la cuenta con el bailarín elegido y la marca como familia.
create or replace function public.aprobar_solicitud_familia(p_solicitud uuid, p_bailarin uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  sol public.solicitudes_familia;
begin
  if not public.es_admin() then
    raise exception 'Solo admins';
  end if;
  select * into sol from public.solicitudes_familia where id = p_solicitud;
  if sol.id is null then
    raise exception 'La solicitud no existe';
  end if;
  insert into public.cuenta_bailarines (user_id, bailarin_id) values (sol.user_id, p_bailarin)
  on conflict do nothing;
  update public.profiles set tipo = 'familia' where id = sol.user_id;
  update public.solicitudes_familia set estado = 'aprobada' where id = p_solicitud;
end;
$$;

create or replace function public.rechazar_solicitud_familia(p_solicitud uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo admins';
  end if;
  update public.solicitudes_familia set estado = 'rechazada' where id = p_solicitud;
end;
$$;

revoke execute on function public.aprobar_solicitud_familia(uuid, uuid) from public, anon;
grant execute on function public.aprobar_solicitud_familia(uuid, uuid) to authenticated;
revoke execute on function public.rechazar_solicitud_familia(uuid) from public, anon;
grant execute on function public.rechazar_solicitud_familia(uuid) to authenticated;
