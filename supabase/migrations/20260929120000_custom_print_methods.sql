-- Print methods for the custom order wizard (Step 2). Each method limits which
-- fabrics customers can pick. Admin CRUD via portal; public reads published rows.
-- Fabric ids mirror MATERIAL_OPTIONS in src/data/customOptions.ts.

create table if not exists public.og_custom_print_methods (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9_-]{0,47}$'),
  label text not null check (char_length(btrim(label)) between 1 and 60),
  description text not null default '' check (char_length(description) <= 240),
  price_modifier numeric(6, 3) not null default 1.0 check (price_modifier > 0 and price_modifier <= 10),
  fabric_ids text[] not null default '{}'
    check (fabric_ids <@ array['dri_fit', 'running_mesh', 'drifit_polyester', 'cotton', 'poly_blend']::text[]),
  sort_order smallint not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.og_portal_users (id) on delete set null
);

create index if not exists og_custom_print_methods_sort_idx
  on public.og_custom_print_methods (sort_order);

drop trigger if exists og_custom_print_methods_updated_at on public.og_custom_print_methods;
create trigger og_custom_print_methods_updated_at
  before update on public.og_custom_print_methods
  for each row execute function public.og_set_updated_at();

alter table public.og_custom_print_methods enable row level security;

drop policy if exists "og_custom_print_methods_public_read" on public.og_custom_print_methods;
create policy "og_custom_print_methods_public_read"
  on public.og_custom_print_methods for select
  using (is_published = true);

drop policy if exists "og_custom_print_methods_admin_read" on public.og_custom_print_methods;
create policy "og_custom_print_methods_admin_read"
  on public.og_custom_print_methods for select
  using (public.og_portal_role() = 'admin');

drop policy if exists "og_custom_print_methods_admin_write" on public.og_custom_print_methods;
create policy "og_custom_print_methods_admin_write"
  on public.og_custom_print_methods for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

-- Towel orders are locked to sublimation, so it can be edited but never deleted.
create or replace function public.og_custom_print_methods_keep_sublimation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.id = 'sublimation' then
    raise exception 'Sublimation is required for towel orders and cannot be deleted.';
  end if;
  return old;
end;
$$;

drop trigger if exists og_custom_print_methods_keep_sublimation on public.og_custom_print_methods;
create trigger og_custom_print_methods_keep_sublimation
  before delete on public.og_custom_print_methods
  for each row execute function public.og_custom_print_methods_keep_sublimation();

insert into public.og_custom_print_methods (
  id, label, description, price_modifier, fabric_ids, sort_order, is_published
) values
  ('sublimation', 'Sublimation', 'Full-coverage, vibrant print that won''t crack or peel', 1.0,
    array['dri_fit', 'running_mesh', 'drifit_polyester'], 10, true),
  ('embroidery', 'Embroidery', 'Premium stitched finish for logos and monograms', 1.4,
    array['dri_fit', 'cotton'], 20, true),
  ('dtf_print', 'DTF Print', 'Direct-to-film transfer, full-color detail for complex artwork', 1.15,
    array['dri_fit', 'running_mesh', 'drifit_polyester', 'cotton'], 30, true),
  ('silk_screen', 'Silkscreen', 'Bold, long-lasting ink for simple designs and logos', 0.85,
    array['dri_fit', 'drifit_polyester', 'cotton'], 40, true)
on conflict (id) do nothing;
