-- Headwear & towel product types for custom order wizard (Step 1)
-- Admin CRUD via portal; public reads published rows only.

create table if not exists public.og_custom_headwear_options (
  id text primary key,
  label text not null default '',
  description text not null default '',
  option_group text not null check (option_group in ('headwear', 'towel')),
  price_modifier numeric(6, 3) not null default 1.0 check (price_modifier > 0),
  order_sheet_product_type text not null default 'headwear',
  sort_order smallint not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.og_portal_users (id) on delete set null
);

create index if not exists og_custom_headwear_options_group_sort_idx
  on public.og_custom_headwear_options (option_group, sort_order);

drop trigger if exists og_custom_headwear_options_updated_at on public.og_custom_headwear_options;
create trigger og_custom_headwear_options_updated_at
  before update on public.og_custom_headwear_options
  for each row execute function public.og_set_updated_at();

alter table public.og_custom_headwear_options enable row level security;

create policy "og_custom_headwear_options_public_read"
  on public.og_custom_headwear_options for select
  using (is_published = true);

create policy "og_custom_headwear_options_admin_read"
  on public.og_custom_headwear_options for select
  using (public.og_portal_role() = 'admin');

create policy "og_custom_headwear_options_admin_write"
  on public.og_custom_headwear_options for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

-- Seed defaults (idempotent)
insert into public.og_custom_headwear_options (
  id, label, description, option_group, price_modifier, order_sheet_product_type, sort_order, is_published
) values
  ('cap-trucker', 'Trucker Cap', 'Mesh-back cap with curved bill.', 'headwear', 1.0, 'cap_trucker', 10, true),
  ('cap-snapback', 'Snapback Cap', 'Structured fit with flat bill.', 'headwear', 1.08, 'cap_snapback', 20, true),
  ('cap-dad', 'Dad Cap', 'Unstructured low-profile classic.', 'headwear', 0.98, 'cap_dad', 30, true),
  ('bucket-hat', 'Bucket Hat', 'All-around brim for sun coverage.', 'headwear', 1.12, 'bucket_hat', 40, true),
  ('visor', 'Sports Visor', 'Lightweight open-top headwear.', 'headwear', 0.92, 'visor', 50, true),
  ('headband', 'Performance Headband', 'Quick-dry stretch headband.', 'headwear', 0.85, 'headband', 60, true),
  ('towel-face', 'Face Towel', 'Compact team towel for training kits.', 'towel', 0.75, 'face_towel', 70, true),
  ('towel-hand', 'Hand Towel', 'Larger towel for sidelines and gyms.', 'towel', 0.82, 'hand_towel', 80, true)
on conflict (id) do nothing;
