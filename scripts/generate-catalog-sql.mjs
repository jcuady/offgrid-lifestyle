import fs from "node:fs";
import path from "node:path";
import { products, getProductSports, getProductTags } from "../src/data/products.ts";

function esc(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "number") return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

function escArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  const elements = arr.map((item) => `"${String(item).replace(/"/g, '\\"')}"`).join(",");
  return `'{${elements}}'::text[]`;
}

function escJson(val) {
  if (!val) return "'[]'::jsonb";
  return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- Migration: Add complete 21-product catalog across 9 collections with full galleries and terms
-- Timestamp: 2026-10-01
-- Clean up placeholder and superseded records
DELETE FROM public.og_products
WHERE id IN (
  'og-voyager',
  'og-stats',
  'og-arcade',
  'og-comet',
  'og-discfest-towel',
  'og-pickleball',
  'everyday-is-pickle-day',
  'get-your-dink',
  'pickleball-lifestyle',
  'og-dink-different',
  'salmon-smasher'
);

INSERT INTO public.og_products (
  id, slug, name, category, sports, collection_ids, base_price, price, image, gallery,
  colors, sizes, size_range, description, short_description, material, fabric_type,
  cut, variants, sold, stock, tag, tags, home_best_seller_rank, status
)
VALUES
`;

const rows = products.map((p) => {
  const sports = getProductSports(p);
  const tags = getProductTags(p);
  const primaryTag = tags[0] || null;

  return `  (
    ${esc(p.id)},
    ${esc(p.slug)},
    ${esc(p.name)},
    ${esc(p.category)},
    ${escArray(sports)},
    ${escArray(p.collectionIds || [])},
    ${p.basePrice},
    ${p.price},
    ${esc(p.image)},
    ${escArray(p.gallery || [])},
    ${escJson(p.colors || [])},
    ${escArray(p.sizes || [])},
    ${esc(p.sizeRange || null)},
    ${esc(p.description)},
    ${esc(p.shortDescription || null)},
    ${esc(p.material)},
    ${esc(p.fabricType)},
    ${esc(p.cut)},
    ${escJson(p.variants || [])},
    ${p.sold || 0},
    ${p.stock !== undefined ? p.stock : "null"},
    ${esc(primaryTag)},
    ${escArray(tags)},
    ${p.homeBestSellerRank || 0},
    ${esc(p.status || "active")}
  )`;
});

sql += rows.join(",\n");

sql += `
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sports = EXCLUDED.sports,
  collection_ids = EXCLUDED.collection_ids,
  base_price = EXCLUDED.base_price,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  colors = EXCLUDED.colors,
  sizes = EXCLUDED.sizes,
  size_range = EXCLUDED.size_range,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  material = EXCLUDED.material,
  fabric_type = EXCLUDED.fabric_type,
  cut = EXCLUDED.cut,
  variants = EXCLUDED.variants,
  sold = EXCLUDED.sold,
  stock = EXCLUDED.stock,
  tag = EXCLUDED.tag,
  tags = EXCLUDED.tags,
  home_best_seller_rank = EXCLUDED.home_best_seller_rank,
  status = EXCLUDED.status,
  updated_at = now();

-- Seed the 9 official collections and 6 sports in public.og_catalog_terms
INSERT INTO public.og_catalog_terms (kind, label, slug, sort_order, description, image_url, published)
VALUES
  ('collection', 'Pilipinas National Team', 'pilipinas', 10, 'Official Pilipinas National Team tournament jerseys engineered for international ultimate frisbee competition.', '/images/products/pilipinas-aouc-capiz.webp', true),
  ('collection', 'Primal Power Line', 'primal', 20, 'Heavy-duty performance activewear and drifit essentials built for intense gym training sessions.', '/images/products/primal-sleeveless-black-green.webp', true),
  ('collection', 'Solar Rise Line', 'solar', 30, 'Lightweight, breathable sun-ready drifit activewear engineered for heat and endurance.', '/images/products/solar-sleeveless-white-teal.webp', true),
  ('collection', 'Running Performance', 'running', 40, 'Aerodynamic singles and long sleeves built for marathoners and everyday runners.', '/images/products/running-performance-cover.webp', true),
  ('collection', 'Motoline Collection', 'motoline', 50, 'Off-road and moto-inspired performance lifestyle jerseys built for speed and grit.', '/images/products/motoline-cover.webp', true),
  ('collection', 'The OG Vibe Lifestyle', 'the-og-vibe', 60, 'Everyday streetwear and graphic tees crafted for comfort beyond the court.', '/images/products/og-vibe-photoshoot-banner.webp', true),
  ('collection', 'Pickleball Club', 'pickleball', 70, 'Complete court collection featuring lifestyle graphic tees and Salmon Smasher performance activewear.', '/images/products/pickleball-club-cover.webp', true),
  ('collection', 'Golf Series', 'golf', 80, 'Engineered fairway polos combining technical stretch with modern course aesthetics.', '/images/products/golf-links-cover.webp', true),
  ('collection', 'Headwear & Accessories', 'accessories', 90, 'Essential caps and ultra-absorbent microfiber towels engineered for all athletes.', '/images/products/momentum-cap-cover.webp', true),
  ('sport', 'Ultimate Frisbee', 'ultimate-frisbee', 10, 'National team and tournament kits — our top-selling retail line.', null, true),
  ('sport', 'Gym & Training', 'gym-training', 20, 'Primal Power and Solar Rise performance activewear.', null, true),
  ('sport', 'Running', 'running', 30, 'Stride-ready singles and long sleeves.', null, true),
  ('sport', 'Pickleball', 'pickleball', 40, 'Club graphics and Salmon Smasher performance activewear.', null, true),
  ('sport', 'Golf', 'golf', 50, 'Fairway polos built to move.', null, true),
  ('sport', 'Lifestyle', 'lifestyle', 60, 'Everyday street tees, motoline jerseys, and headwear.', null, true)
ON CONFLICT (kind, slug) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  image_url = coalesce(EXCLUDED.image_url, public.og_catalog_terms.image_url),
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  updated_at = now();

-- Unpublish superseded collections so old rails do not display empty
UPDATE public.og_catalog_terms
SET published = false
WHERE kind = 'collection' AND slug IN ('discfest', 'og-vibe');
`;

const migrationFile = path.resolve("supabase/migrations/20261001000000_add_full_product_catalog.sql");
fs.writeFileSync(migrationFile, sql, "utf8");
console.log(`Generated migration with ${products.length} products: ${migrationFile}`);

// Also copy to root/scripts for easy access
const standaloneSql = path.resolve("scripts/add_full_product_catalog.sql");
fs.writeFileSync(standaloneSql, sql, "utf8");
console.log(`Generated standalone SQL script: ${standaloneSql}`);
