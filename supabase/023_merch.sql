-- Merch: pedidos guardados en la app, precios y fotos que cambian los admins/editores.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- ---------- 1) Pedidos (además de llegar por WhatsApp) ----------
create table if not exists public.pedidos_merch (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text,
  items jsonb not null default '[]', -- [{"producto": "Camiseta", "detalle": "talla M (adulto)", "precio": 15}]
  total numeric(8, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists pedidos_merch_fecha_idx on public.pedidos_merch (created_at desc);

alter table public.pedidos_merch enable row level security;

drop policy if exists "hacer pedido" on public.pedidos_merch;
create policy "hacer pedido" on public.pedidos_merch
  for insert to authenticated with check (user_id = (select auth.uid()) and (select public.es_miembro()));

drop policy if exists "ver pedidos" on public.pedidos_merch;
create policy "ver pedidos" on public.pedidos_merch
  for select to authenticated using (user_id = (select auth.uid()) or (select public.es_editor()));

drop policy if exists "borrar pedidos" on public.pedidos_merch;
create policy "borrar pedidos" on public.pedidos_merch
  for delete to authenticated using ((select public.es_editor()));

-- ---------- 2) Precios (camiseta, pantalon, pack) ----------
create table if not exists public.merch_precios (
  producto text primary key check (producto in ('camiseta', 'pantalon', 'pack')),
  precio numeric(8, 2) not null check (precio >= 0),
  updated_at timestamptz not null default now()
);
alter table public.merch_precios enable row level security;

drop policy if exists "ver precios merch" on public.merch_precios;
create policy "ver precios merch" on public.merch_precios
  for select to authenticated using (true);

drop policy if exists "editores cambian precios merch" on public.merch_precios;
create policy "editores cambian precios merch" on public.merch_precios
  for all to authenticated using ((select public.es_editor())) with check ((select public.es_editor()));

insert into public.merch_precios (producto, precio) values ('camiseta', 15), ('pantalon', 25), ('pack', 35)
on conflict (producto) do nothing;

-- ---------- 3) Fotos del merch (públicas; las suben editores y admins) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('merch', 'merch', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "editores suben fotos merch" on storage.objects;
create policy "editores suben fotos merch" on storage.objects
  for insert to authenticated with check (bucket_id = 'merch' and (select public.es_editor()));

drop policy if exists "editores borran fotos merch" on storage.objects;
create policy "editores borran fotos merch" on storage.objects
  for delete to authenticated using (bucket_id = 'merch' and (select public.es_editor()));

drop policy if exists "ver fotos merch" on storage.objects;
create policy "ver fotos merch" on storage.objects
  for select to authenticated using (bucket_id = 'merch');
