-- Extend catalog terms for collections CMS (sports/tags already exist).
alter table public.og_catalog_terms drop constraint if exists og_catalog_terms_kind_check;
alter table public.og_catalog_terms
  add constraint og_catalog_terms_kind_check
  check (kind in ('tag', 'sport', 'collection'));

alter table public.og_catalog_terms
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists published boolean not null default true;

comment on column public.og_catalog_terms.description is 'Optional marketing blurb for sport/collection rails.';
comment on column public.og_catalog_terms.image_url is 'Optional rail / hub image URL.';
comment on column public.og_catalog_terms.published is 'When false, hide from storefront rails (admin still sees it).';

insert into public.og_catalog_terms (kind, label, slug, sort_order, description, image_url, published)
values
  ('collection', 'Discfest', 'discfest', 10, 'Event exclusive ultimate frisbee retail — Voyager, Stats, Arcade, Comet.', null, true),
  ('collection', 'Solar', 'solar', 20, 'Sun-ready sleeveless, short sleeve, and long sleeve.', null, true),
  ('collection', 'Primal', 'primal', 30, 'Performance drifit across cuts.', null, true),
  ('collection', 'OG Vibe', 'og-vibe', 40, 'Everyday lifestyle tees.', null, true)
on conflict (kind, slug) do update set
  label = excluded.label,
  description = coalesce(public.og_catalog_terms.description, excluded.description),
  sort_order = excluded.sort_order,
  published = true,
  updated_at = now();
