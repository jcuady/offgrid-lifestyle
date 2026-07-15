-- Catalog protocol v2: list/sale pricing, multi-sport assignment, promo tags,
-- and authoritative retail prices at the database boundary.

alter table public.og_products
  add column if not exists sports text[] not null default '{}',
  add column if not exists tags text[] not null default '{}';

update public.og_products
set
  sports = case
    when cardinality(sports) > 0 then sports
    when category in ('Ultimate Frisbee', 'Frisbee', 'Solar Collection', 'Primal Collection')
      then array['Ultimate Frisbee']
    when category = 'Pickleball' then array['Pickleball']
    when category = 'Golf' then array['Golf']
    when category = 'Running' then array['Running']
    when category = 'Lifestyle / OG Vibe' then array['Lifestyle']
    else array[category]
  end,
  tags = case
    when cardinality(tags) > 0 then tags
    when nullif(trim(tag), '') is not null then array[trim(tag)]
    else '{}'
  end;

alter table public.og_products
  drop constraint if exists og_products_prices_valid_chk;

alter table public.og_products
  add constraint og_products_prices_valid_chk
  check (base_price > 0 and price > 0 and price <= base_price);

create index if not exists og_products_sports_gin_idx
  on public.og_products using gin (sports);

create index if not exists og_products_tags_gin_idx
  on public.og_products using gin (tags);

comment on column public.og_products.base_price is
  'Regular/list price shown struck through when greater than price.';
comment on column public.og_products.price is
  'Current selling price used by cart, checkout, orders, and payments.';
comment on column public.og_products.sports is
  'Admin-managed sports used to build storefront sport navigation and filters.';
comment on column public.og_products.tags is
  'Admin-managed storefront labels and promo filters; first value is the primary badge.';

create or replace function public.og_apply_live_retail_prices()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  source_line jsonb;
  product_row public.og_products%rowtype;
  normalized_lines jsonb := '[]'::jsonb;
  quantity_value integer;
  subtotal_value bigint := 0;
begin
  if new.order_type <> 'retail' then
    return new;
  end if;

  if new.line_items is null
     or jsonb_typeof(new.line_items) <> 'array'
     or jsonb_array_length(new.line_items) = 0 then
    raise exception 'Retail order requires at least one line item.';
  end if;

  for source_line in select value from jsonb_array_elements(new.line_items)
  loop
    quantity_value := coalesce((source_line->>'quantity')::integer, 0);
    if quantity_value < 1 or quantity_value > 10 then
      raise exception 'Retail line quantity must be between 1 and 10.';
    end if;

    select *
      into product_row
      from public.og_products
     where id = source_line->>'productId'
       and status = 'active';

    if not found then
      raise exception 'A selected product is unavailable.';
    end if;

    subtotal_value := subtotal_value + round(product_row.price * 100)::bigint * quantity_value;
    normalized_lines := normalized_lines || jsonb_build_array(
      source_line
      || jsonb_build_object(
        'name', product_row.name,
        'image', product_row.image,
        'priceSnapshot', jsonb_build_object(
          'amount', product_row.price,
          'currency', 'PHP'
        )
      )
    );
  end loop;

  new.line_items := normalized_lines;
  new.subtotal_centavos := subtotal_value;
  new.shipping_centavos := case when subtotal_value >= 200000 then 0 else 15000 end;
  new.tax_centavos := 0;
  new.total_centavos := new.subtotal_centavos + new.shipping_centavos;
  return new;
end;
$$;

revoke all on function public.og_apply_live_retail_prices() from public, anon, authenticated;

drop trigger if exists og_orders_apply_live_retail_prices on public.og_orders;
create trigger og_orders_apply_live_retail_prices
  before insert on public.og_orders
  for each row execute function public.og_apply_live_retail_prices();

comment on function public.og_apply_live_retail_prices is
  'Replaces client retail prices with active catalog prices and recalculates totals before insert.';
