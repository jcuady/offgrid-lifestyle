-- OffGrid site content: custom hub CMS (ordering guide, wizard copy, templates metadata)
-- Sync target for useSiteContentStore when wiring production Supabase.

-- ---------------------------------------------------------------------------
-- Page-scoped JSON blobs (hub, order hero, wizard, templates page copy)
-- ---------------------------------------------------------------------------
create table if not exists public.og_site_custom_pages (
  scope text primary key check (
    scope in ('hub', 'order_hero', 'wizard', 'templates_page')
  ),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.og_portal_users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Seven fixed ordering-guide accordion panels
-- ---------------------------------------------------------------------------
create table if not exists public.og_custom_guide_sections (
  id text primary key,
  slug text not null unique check (
    slug in (
      'how-to-order',
      'product-catalog',
      'team-deals',
      'sizing-chart',
      'free-jersey-promo',
      'faqs',
      'lead-times'
    )
  ),
  title text not null default '',
  subtitle text not null default '',
  summary text not null default '',
  body text not null default '',
  hero_image text not null default '',
  cta_label text not null default '',
  cta_href text not null default '/custom/order',
  is_published boolean not null default true,
  sort_order smallint not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.og_portal_users (id) on delete set null
);

create index if not exists og_custom_guide_sections_sort_idx
  on public.og_custom_guide_sections (sort_order);

-- ---------------------------------------------------------------------------
-- Template slot metadata (file bytes live in Supabase Storage in production)
-- ---------------------------------------------------------------------------
create table if not exists public.og_custom_template_slots (
  id text primary key,
  category text not null check (category in ('jerseys', 'headwear', 'towels', 'shorts')),
  name text not null default '',
  description text not null default '',
  file_name text not null default '',
  file_url text not null default '',
  storage_kind text not null default 'static' check (storage_kind in ('static', 'storage')),
  format text not null default '',
  preview_image_url text,
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.og_portal_users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists og_site_custom_pages_updated_at on public.og_site_custom_pages;
create trigger og_site_custom_pages_updated_at
  before update on public.og_site_custom_pages
  for each row execute function public.og_set_updated_at();

drop trigger if exists og_custom_guide_sections_updated_at on public.og_custom_guide_sections;
create trigger og_custom_guide_sections_updated_at
  before update on public.og_custom_guide_sections
  for each row execute function public.og_set_updated_at();

drop trigger if exists og_custom_template_slots_updated_at on public.og_custom_template_slots;
create trigger og_custom_template_slots_updated_at
  before update on public.og_custom_template_slots
  for each row execute function public.og_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — public read for published guide + templates; admin write
-- ---------------------------------------------------------------------------
alter table public.og_site_custom_pages enable row level security;
alter table public.og_custom_guide_sections enable row level security;
alter table public.og_custom_template_slots enable row level security;

create policy "og_site_custom_pages_public_read"
  on public.og_site_custom_pages for select
  using (true);

create policy "og_site_custom_pages_admin_write"
  on public.og_site_custom_pages for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

create policy "og_custom_guide_sections_public_read"
  on public.og_custom_guide_sections for select
  using (is_published = true);

create policy "og_custom_guide_sections_admin_read"
  on public.og_custom_guide_sections for select
  using (public.og_portal_role() = 'admin');

create policy "og_custom_guide_sections_admin_write"
  on public.og_custom_guide_sections for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

create policy "og_custom_template_slots_public_read"
  on public.og_custom_template_slots for select
  using (is_published = true);

create policy "og_custom_template_slots_admin_read"
  on public.og_custom_template_slots for select
  using (public.og_portal_role() = 'admin');

create policy "og_custom_template_slots_admin_write"
  on public.og_custom_template_slots for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');
