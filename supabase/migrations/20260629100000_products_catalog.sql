-- Product catalog table
create table if not exists public.og_products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  collection_ids text[] default '{}',
  base_price numeric(10,2) not null,
  price numeric(10,2) not null,
  image text not null default '',
  gallery text[] default '{}',
  colors jsonb default '[]'::jsonb,
  sizes text[] default '{}',
  size_range text,
  description text not null default '',
  short_description text,
  material text not null default '',
  fabric_type text not null default 'dri_fit',
  cut text not null default 'short_sleeve',
  fit text,
  variants jsonb default '[]'::jsonb,
  sold int not null default 0,
  stock int,
  tag text,
  home_best_seller_rank smallint default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists og_products_status_idx on public.og_products (status);
create index if not exists og_products_category_idx on public.og_products (category);
create index if not exists og_products_best_seller_idx on public.og_products (home_best_seller_rank) where home_best_seller_rank > 0;

drop trigger if exists og_products_updated_at on public.og_products;
create trigger og_products_updated_at
  before update on public.og_products
  for each row execute function public.og_set_updated_at();

alter table public.og_products enable row level security;

create policy "og_products_public_read"
  on public.og_products for select
  using (status = 'active');

create policy "og_products_admin_read"
  on public.og_products for select
  to authenticated
  using (public.og_portal_role() = 'admin');

create policy "og_products_admin_write"
  on public.og_products for all
  to authenticated
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

comment on table public.og_products is 'Product catalog — public reads active; admin full CRUD.';
