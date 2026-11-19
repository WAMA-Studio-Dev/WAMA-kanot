-- Grupo de cada miembro de Kanot Crew (Kanot Jr, Knallas, Knelo, Kinkis).
-- Pega esto en Supabase → SQL Editor → New query → Run.

alter table public.profiles add column if not exists grupo text;

alter table public.profiles drop constraint if exists profiles_grupo_check;
alter table public.profiles add constraint profiles_grupo_check
  check (grupo is null or grupo in ('Kanot Jr', 'Knallas', 'Knelo', 'Kinkis'));

-- Cada miembro puede elegir SU grupo (los admins pueden cambiar el de cualquiera desde Usuarios).
create or replace function public.actualizar_mi_grupo(p_grupo text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Tienes que iniciar sesión';
  end if;
  update public.profiles set grupo = nullif(trim(p_grupo), '') where id = auth.uid();
end;
$$;

revoke execute on function public.actualizar_mi_grupo(text) from public, anon;
grant execute on function public.actualizar_mi_grupo(text) to authenticated;
