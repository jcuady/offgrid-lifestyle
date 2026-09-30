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

let sql = `-- Migration: Add complete 29-product catalog across all collections
-- Timestamp: 2026-10-01
-- Idempotent upsert ensuring production checkout and hydration match catalog

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
`;

const migrationFile = path.resolve("supabase/migrations/20261001000000_add_full_product_catalog.sql");
fs.writeFileSync(migrationFile, sql, "utf8");
console.log(`Generated migration with ${products.length} products: ${migrationFile}`);

// Also copy to root/scripts for easy access
const standaloneSql = path.resolve("scripts/add_full_product_catalog.sql");
fs.writeFileSync(standaloneSql, sql, "utf8");
console.log(`Generated standalone SQL script: ${standaloneSql}`);
