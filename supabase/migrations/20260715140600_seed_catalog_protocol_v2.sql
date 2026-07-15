-- Safe catalog reset: preserve historical rows, archive the superseded item,
-- and upsert the products introduced by catalog protocol v2.

update public.og_products
set status = 'archived'
where id = 'og-pickleball-2-0';

insert into public.og_products (
  id, slug, name, category, sports, collection_ids, base_price, price, image, colors, sizes,
  size_range, description, short_description, material, fabric_type, cut, variants, sold, stock,
  tag, tags, home_best_seller_rank, status
)
values
  ('og-voyager','og-voyager','OG VOYAGER','Ultimate Frisbee',array['Ultimate Frisbee'],array['discfest'],1300,1100,'/images/community/community-ultimate-skyball.jpg','[{"name":"Field Black","value":"bg-offgrid-dark"},{"name":"OFFGRID Lime","value":"bg-offgrid-lime"}]'::jsonb,array['2XS','XS','S','M','L','XL','2XL','3XL'],'2XS–3XL','OG VOYAGER — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate and disc days.','Discfest ultimate frisbee tee · OG VOYAGER.','Premium Drifit','dri_fit','short_sleeve','[]'::jsonb,520,null,'Best Seller',array['Best Seller','Promo'],1,'active'),
  ('og-stats','og-stats','OG STATS','Ultimate Frisbee',array['Ultimate Frisbee'],array['discfest'],1100,1100,'/images/community/community-ultimate-catch.jpg','[{"name":"Field Black","value":"bg-offgrid-dark"},{"name":"OFFGRID Lime","value":"bg-offgrid-lime"}]'::jsonb,array['2XS','XS','S','M','L','XL','2XL','3XL'],'2XS–3XL','OG STATS — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate and disc days.','Discfest ultimate frisbee tee · OG STATS.','Premium Drifit','dri_fit','short_sleeve','[]'::jsonb,410,null,'Discfest',array['Discfest'],2,'active'),
  ('og-arcade','og-arcade','OG ARCADE','Ultimate Frisbee',array['Ultimate Frisbee'],array['discfest'],1100,1100,'/images/community/community-ultimate-field.jpg','[{"name":"Field Black","value":"bg-offgrid-dark"},{"name":"OFFGRID Lime","value":"bg-offgrid-lime"}]'::jsonb,array['2XS','XS','S','M','L','XL','2XL','3XL'],'2XS–3XL','OG ARCADE — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate and disc days.','Discfest ultimate frisbee tee · OG ARCADE.','Premium Drifit','dri_fit','short_sleeve','[]'::jsonb,380,null,'Discfest',array['Discfest'],3,'active'),
  ('og-comet','og-comet','OG COMET','Ultimate Frisbee',array['Ultimate Frisbee'],array['discfest'],1100,1100,'/images/community/community-ultimate-skyball.jpg','[{"name":"Field Black","value":"bg-offgrid-dark"},{"name":"OFFGRID Lime","value":"bg-offgrid-lime"}]'::jsonb,array['2XS','XS','S','M','L','XL','2XL','3XL'],'2XS–3XL','OG COMET — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate and disc days.','Discfest ultimate frisbee tee · OG COMET.','Premium Drifit','dri_fit','short_sleeve','[]'::jsonb,295,null,'Discfest',array['Discfest'],4,'active'),
  ('og-discfest-towel','og-discfest-towel','OG DISCFEST TOWEL','Ultimate Frisbee',array['Ultimate Frisbee'],array['discfest'],650,650,'/images/community/product-towel-bench.jpg','[{"name":"Field Cream","value":"bg-offgrid-cream"}]'::jsonb,array['S','M','L','XL'],'One size / S–XL pack','OFFGRID Discfest towel — sideline essential for ultimate frisbee game days.','Discfest ultimate frisbee towel.','Absorbent cotton terry','cotton','shorts','[]'::jsonb,260,null,'Discfest',array['Discfest'],0,'active'),
  ('og-pickleball','og-pickleball','OG PICKLEBALL','Pickleball',array['Pickleball'],array['pickleball'],900,900,'/images/product-pickleball-2.png','[{"name":"Green","value":"bg-offgrid-green"},{"name":"Blue","value":"bg-blue-600"}]'::jsonb,array['2XS','XS','S','M','L','XL','2XL','3XL'],'2XS–3XL','Core OFFGRID pickleball tee. Soft cotton for rallies and off-court days.','Core pickleball cotton tee.','Cotton','cotton','short_sleeve','[]'::jsonb,342,null,'Pickleball',array['Pickleball'],0,'active')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  sports = excluded.sports,
  collection_ids = excluded.collection_ids,
  base_price = excluded.base_price,
  price = excluded.price,
  image = excluded.image,
  colors = excluded.colors,
  sizes = excluded.sizes,
  size_range = excluded.size_range,
  description = excluded.description,
  short_description = excluded.short_description,
  material = excluded.material,
  fabric_type = excluded.fabric_type,
  cut = excluded.cut,
  sold = excluded.sold,
  tag = excluded.tag,
  tags = excluded.tags,
  home_best_seller_rank = excluded.home_best_seller_rank,
  status = excluded.status;

update public.og_products
set
  sports = case
    when category in ('Ultimate Frisbee','Solar Collection','Primal Collection') then array['Ultimate Frisbee']
    when category = 'Pickleball' then array['Pickleball']
    when category = 'Golf' then array['Golf']
    when category = 'Running' then array['Running']
    when category = 'Lifestyle / OG Vibe' then array['Lifestyle']
    else sports
  end,
  tags = case
    when id = 'og-voyager' then array['Best Seller','Promo']
    when nullif(trim(tag), '') is not null then array[trim(tag)]
    else tags
  end;

update public.og_products
set name = 'OG PICKLEBALL — LIFESTYLE'
where id = 'pickleball-lifestyle';

update public.og_products
set name = 'OG PICKLEBALL — CLUB'
where id = 'og-pickleball-club';
