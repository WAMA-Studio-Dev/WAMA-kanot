-- Notificaciones automáticas (con preferencias de cada persona) y uso de almacenamiento para admins.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Qué notificaciones NO quiere recibir cada persona ----------
-- Tipos: avisos, horarios, competicion, formaciones, kodigo-klub, kanot-kamp
alter table public.profiles add column if not exists notis_off text[] not null default '{}';

create or replace function public.actualizar_mis_notis(p_off text[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Tienes que iniciar sesión';
  end if;
  update public.profiles set notis_off = coalesce(p_off, '{}') where id = auth.uid();
end;
$$;

revoke execute on function public.actualizar_mis_notis(text[]) from public, anon;
grant execute on function public.actualizar_mis_notis(text[]) to authenticated;

-- ---------- 2) A quién enviar, respetando sus preferencias ----------
drop function if exists public.push_destinos(text);
create or replace function public.push_destinos(p_destino text, p_tipo text default null)
returns table (endpoint text, p256dh text, auth text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.es_editor() then
    raise exception 'Solo editores y admins pueden enviar notificaciones';
  end if;
  return query
    select s.endpoint, s.p256dh, s.auth
    from public.push_subs s
    join public.profiles p on p.id = s.user_id
    where ((p_destino = 'crew' and p.role::text in ('miembro', 'editor', 'admin'))
        or (p_destino <> 'crew' and p.role::text in ('usuario', 'miembro', 'editor', 'admin')))
      and (p_tipo is null or not (p_tipo = any (p.notis_off)));
end;
$$;

revoke execute on function public.push_destinos(text, text) from public, anon;
grant execute on function public.push_destinos(text, text) to authenticated;

-- ---------- 3) Almacenamiento usado (solo admins) ----------
create or replace function public.uso_almacenamiento()
returns table (bucket text, archivos bigint, bytes bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo admins';
  end if;
  return query
    select o.bucket_id::text, count(*)::bigint, coalesce(sum((o.metadata ->> 'size')::bigint), 0)::bigint
    from storage.objects o
    group by o.bucket_id
    union all
    select '__base_de_datos__', 0::bigint, pg_database_size(current_database())::bigint;
end;
$$;

revoke execute on function public.uso_almacenamiento() from public, anon;
grant execute on function public.uso_almacenamiento() to authenticated;
