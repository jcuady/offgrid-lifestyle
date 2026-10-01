/**
 * Automated script to sync all 29 products directly into live Supabase database.
 * Run with: npx tsx scripts/sync-products-to-supabase.mjs
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { products, getProductSports, getProductTags } from "../src/data/products.ts";

const envLocal = path.resolve(".env.local");
const envRegular = path.resolve(".env");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envRegular)) {
  dotenv.config({ path: envRegular });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("=====================================================================");
  console.log("⚠️  Supabase environment variables not found in .env or .env.local");
  console.log("=====================================================================");
  console.log("To sync products into production database, you have two easy options:\n");
  console.log("OPTION 1 (Instant via SQL Editor):");
  console.log("  1. Open your Supabase Dashboard: https://supabase.com/dashboard");
  console.log("  2. Go to SQL Editor -> New Query");
  console.log("  3. Copy and paste the contents of:");
  console.log("     scripts/add_full_product_catalog.sql");
  console.log("  4. Click 'Run' -> Done! All 29 products will be live and active in prod.\n");
  console.log("OPTION 2 (Automated Node Sync):");
  console.log("  1. Create .env with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  console.log("  2. Re-run: npx tsx scripts/sync-products-to-supabase.mjs");
  console.log("=====================================================================\n");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function sync() {
  console.log(`Starting sync of ${products.length} products to ${supabaseUrl}...`);

  const supersededIds = [
    "og-voyager",
    "og-stats",
    "og-arcade",
    "og-comet",
    "og-discfest-towel",
    "og-pickleball",
    "everyday-is-pickle-day",
    "get-your-dink",
    "pickleball-lifestyle",
    "og-dink-different",
  ];

  console.log(`Cleaning up ${supersededIds.length} placeholder / superseded products...`);
  const { error: delError } = await supabase
    .from("og_products")
    .delete()
    .in("id", supersededIds);

  if (delError) {
    console.warn("Delete blocked (orders may reference them), archiving instead:", delError.message);
    await supabase.from("og_products").update({ status: "archived" }).in("id", supersededIds);
  } else {
    console.log("✅ Successfully removed placeholder products from public.og_products.");
  }

  const rows = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    sports: getProductSports(p),
    collection_ids: p.collectionIds || [],
    base_price: p.basePrice,
    price: p.price,
    image: p.image,
    gallery: p.gallery || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    size_range: p.sizeRange || null,
    description: p.description,
    short_description: p.shortDescription || null,
    material: p.material,
    fabric_type: p.fabricType,
    cut: p.cut,
    variants: p.variants || [],
    sold: p.sold || 0,
    stock: p.stock !== undefined ? p.stock : null,
    tag: getProductTags(p)[0] || null,
    tags: getProductTags(p),
    home_best_seller_rank: p.homeBestSellerRank || 0,
    status: p.status || "active",
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from("og_products").upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully synced ${rows.length} products into public.og_products!`);
}

sync().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
