-- Catalog term registry for admin-managed sports + storefront tags.
-- Products keep denormalized text[] (GIN-indexed) for query speed; this table
-- is the source of truth for unused labels and rename/delete cascades.

create table if not exists public.og_catalog_terms (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('tag', 'sport')),
  label text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint og_catalog_terms_label_len_chk check (char_length(label) between 1 and 40),
  constraint og_catalog_terms_kind_slug_uidx unique (kind, slug)
);

create index if not exists og_catalog_terms_kind_sort_idx
  on public.og_catalog_terms (kind, sort_order, label);

drop trigger if exists og_catalog_terms_updated_at on public.og_catalog_terms;
create trigger og_catalog_terms_updated_at
  before update on public.og_catalog_terms
  for each row execute function public.og_set_updated_at();

alter table public.og_catalog_terms enable row level security;

drop policy if exists og_catalog_terms_public_read on public.og_catalog_terms;
create policy og_catalog_terms_public_read
  on public.og_catalog_terms for select
  using (true);

drop policy if exists og_catalog_terms_admin_write on public.og_catalog_terms;
create policy og_catalog_terms_admin_write
  on public.og_catalog_terms for all
  using (public.og_portal_role() = 'admin')
  with check (public.og_portal_role() = 'admin');

comment on table public.og_catalog_terms is
  'Admin-managed tag and sport labels. Product rows store labels in tags[] / sports[] for GIN filters.';

insert into public.og_catalog_terms (kind, label, slug, sort_order)
select distinct on (kind, slug) kind, label, slug, sort_order
from (
  select
    'sport'::text as kind,
    trim(sport_label) as label,
    lower(regexp_replace(trim(sport_label), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    100 as sort_order
  from public.og_products, unnest(sports) as sport_label
  where nullif(trim(sport_label), '') is not null
  union all
  select 'sport', v.label, v.slug, v.sort_order
  from (values
    ('Ultimate Frisbee', 'ultimate-frisbee', 10),
    ('Pickleball', 'pickleball', 20),
    ('Golf', 'golf', 30),
    ('Running', 'running', 40),
    ('Lifestyle', 'lifestyle', 50)
  ) as v(label, slug, sort_order)
  union all
  select
    'tag'::text as kind,
    trim(tag_label) as label,
    lower(regexp_replace(trim(tag_label), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    100 as sort_order
  from public.og_products, unnest(tags) as tag_label
  where nullif(trim(tag_label), '') is not null
  union all
  select 'tag', v.label, v.slug, v.sort_order
  from (values
    ('Promo', 'promo', 10),
    ('Sale', 'sale', 20),
    ('Best Seller', 'best-seller', 30),
    ('New', 'new', 40),
    ('Limited Edition', 'limited-edition', 50)
  ) as v(label, slug, sort_order)
) seed
where nullif(seed.label, '') is not null
  and nullif(seed.slug, '') is not null
on conflict (kind, slug) do nothing;

create or replace function public.og_rename_catalog_term(
  p_kind text,
  p_from_label text,
  p_to_label text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_from text := trim(p_from_label);
  v_to text := trim(p_to_label);
  v_slug text;
begin
  if public.og_portal_role() is distinct from 'admin' then
    raise exception 'admin only';
  end if;
  if p_kind not in ('tag', 'sport') then
    raise exception 'kind must be tag or sport';
  end if;
  if v_from = '' or v_to = '' then
    raise exception 'labels required';
  end if;
  if char_length(v_to) > 40 then
    raise exception 'label too long';
  end if;

  v_slug := lower(regexp_replace(v_to, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    raise exception 'invalid label';
  end if;

  update public.og_catalog_terms
     set label = v_to,
         slug = v_slug,
         updated_at = now()
   where kind = p_kind
     and lower(label) = lower(v_from);

  if not found then
    insert into public.og_catalog_terms (kind, label, slug)
    values (p_kind, v_to, v_slug)
    on conflict (kind, slug) do update
      set label = excluded.label,
          updated_at = now();
  end if;

  if p_kind = 'tag' then
    update public.og_products p
       set tags = coalesce((
             select array_agg(case when lower(t) = lower(v_from) then v_to else t end)
             from unnest(p.tags) as t
           ), '{}'),
           tag = case
             when lower(coalesce(p.tag, '')) = lower(v_from) then v_to
             else p.tag
           end,
           updated_at = now()
     where exists (
       select 1 from unnest(p.tags) t where lower(t) = lower(v_from)
     ) or lower(coalesce(p.tag, '')) = lower(v_from);
  else
    update public.og_products p
       set sports = coalesce((
             select array_agg(case when lower(s) = lower(v_from) then v_to else s end)
             from unnest(p.sports) as s
           ), '{}'),
           updated_at = now()
     where exists (
       select 1 from unnest(p.sports) s where lower(s) = lower(v_from)
     );
  end if;
end;
$$;

create or replace function public.og_delete_catalog_term(
  p_kind text,
  p_label text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_label text := trim(p_label);
begin
  if public.og_portal_role() is distinct from 'admin' then
    raise exception 'admin only';
  end if;
  if p_kind not in ('tag', 'sport') then
    raise exception 'kind must be tag or sport';
  end if;
  if v_label = '' then
    raise exception 'label required';
  end if;

  delete from public.og_catalog_terms
   where kind = p_kind
     and lower(label) = lower(v_label);

  if p_kind = 'tag' then
    update public.og_products p
       set tags = coalesce((
             select array_agg(t)
             from unnest(p.tags) t
             where lower(t) <> lower(v_label)
           ), '{}'),
           tag = case when lower(coalesce(p.tag, '')) = lower(v_label) then null else p.tag end,
           updated_at = now()
     where exists (
       select 1 from unnest(p.tags) t where lower(t) = lower(v_label)
     ) or lower(coalesce(p.tag, '')) = lower(v_label);
  else
    update public.og_products p
       set sports = coalesce((
             select array_agg(s)
             from unnest(p.sports) s
             where lower(s) <> lower(v_label)
           ), '{}'),
           updated_at = now()
     where exists (
       select 1 from unnest(p.sports) s where lower(s) = lower(v_label)
     );
  end if;
end;
$$;

revoke all on function public.og_rename_catalog_term(text, text, text) from public;
revoke all on function public.og_delete_catalog_term(text, text) from public;
grant execute on function public.og_rename_catalog_term(text, text, text) to authenticated;
grant execute on function public.og_delete_catalog_term(text, text) to authenticated;
