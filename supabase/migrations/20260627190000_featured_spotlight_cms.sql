-- Featured spotlight CMS (homepage + /shop band)
-- MVP persists in localStorage; wire this table when adding a content repository.

create table if not exists public.og_site_featured_spotlight (
  id text primary key default 'default',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

drop trigger if exists og_site_featured_spotlight_updated_at on public.og_site_featured_spotlight;
create trigger og_site_featured_spotlight_updated_at
  before update on public.og_site_featured_spotlight
  for each row execute function public.set_updated_at();

alter table public.og_site_featured_spotlight enable row level security;

create policy "og_site_featured_spotlight_public_read"
  on public.og_site_featured_spotlight for select
  using (true);

create policy "og_site_featured_spotlight_admin_write"
  on public.og_site_featured_spotlight for all
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

insert into public.og_site_featured_spotlight (id, content)
values (
  'default',
  '{
    "eyebrow": "Featured",
    "titleLine1": "Crowd",
    "titleLine2Italic": "favorites.",
    "subtitle": "Hand-picked drops the community keeps coming back to.",
    "ctaLabel": "Shop all featured",
    "ctaHref": "/shop",
    "layout": "bento",
    "source": "best_sellers",
    "slots": [
      { "productId": "", "imageOverride": "" },
      { "productId": "", "imageOverride": "" },
      { "productId": "", "imageOverride": "" }
    ],
    "showOnHome": true,
    "showOnShop": true
  }'::jsonb
)
on conflict (id) do nothing;
