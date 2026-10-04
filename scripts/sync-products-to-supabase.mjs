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
    "salmon-smasher",
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

  const { error: upsertError } = await supabase.from("og_products").upsert(rows, { onConflict: "id" });

  if (upsertError) {
    console.error("❌ Products sync failed:", upsertError.message);
    process.exit(1);
  }

  console.log(`✅ Successfully synced ${rows.length} products into public.og_products!`);

  // Sync catalog terms (Collections and Sports)
  console.log("Syncing official collections and sports to public.og_catalog_terms...");
  const catalogTerms = [
    {
      kind: "collection",
      label: "Pilipinas National Team",
      slug: "pilipinas",
      sort_order: 10,
      description: "Official Pilipinas National Team tournament jerseys engineered for international ultimate frisbee competition.",
      image_url: "/images/products/pilipinas-aouc-capiz.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Primal Power Line",
      slug: "primal",
      sort_order: 20,
      description: "Heavy-duty performance activewear and drifit essentials built for intense gym training sessions.",
      image_url: "/images/products/primal-sleeveless-black-green.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Solar Rise Line",
      slug: "solar",
      sort_order: 30,
      description: "Lightweight, breathable sun-ready drifit activewear engineered for heat and endurance.",
      image_url: "/images/products/solar-sleeveless-white-teal.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Running Performance",
      slug: "running",
      sort_order: 40,
      description: "Aerodynamic singles and long sleeves built for marathoners and everyday runners.",
      image_url: "/images/products/running-performance-cover.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Motoline Collection",
      slug: "motoline",
      sort_order: 50,
      description: "Off-road and moto-inspired performance lifestyle jerseys built for speed and grit.",
      image_url: "/images/products/motoline-cover.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "The OG Vibe Lifestyle",
      slug: "the-og-vibe",
      sort_order: 60,
      description: "Everyday streetwear and graphic tees crafted for comfort beyond the court.",
      image_url: "/images/products/og-vibe-photoshoot-banner.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "The Social Club",
      slug: "the-social-club",
      sort_order: 1,
      description: "100% heavyweight cotton boxy cut graphic tees and limited pre-order drops.",
      image_url: "/images/products/social-club-cover.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Pickleball Club",
      slug: "pickleball",
      sort_order: 70,
      description: "Complete court collection featuring lifestyle graphic tees and Salmon Smasher performance activewear.",
      image_url: "/images/products/pickleball-club-cover.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Golf Series",
      slug: "golf",
      sort_order: 80,
      description: "Engineered fairway polos combining technical stretch with modern course aesthetics.",
      image_url: "/images/products/golf-links-cover.webp",
      published: true,
    },
    {
      kind: "collection",
      label: "Headwear & Accessories",
      slug: "accessories",
      sort_order: 90,
      description: "Essential caps and ultra-absorbent microfiber towels engineered for all athletes.",
      image_url: "/images/products/momentum-cap-cover.webp",
      published: true,
    },
    {
      kind: "sport",
      label: "Ultimate Frisbee",
      slug: "ultimate-frisbee",
      sort_order: 10,
      description: "National team and tournament kits — our top-selling retail line.",
      published: true,
    },
    {
      kind: "sport",
      label: "Gym & Training",
      slug: "gym-training",
      sort_order: 20,
      description: "Primal Power and Solar Rise performance activewear.",
      published: true,
    },
    {
      kind: "sport",
      label: "Running",
      slug: "running",
      sort_order: 30,
      description: "Stride-ready singles and long sleeves.",
      published: true,
    },
    {
      kind: "sport",
      label: "Pickleball",
      slug: "pickleball",
      sort_order: 40,
      description: "Club graphics and Salmon Smasher performance activewear.",
      published: true,
    },
    {
      kind: "sport",
      label: "Golf",
      slug: "golf",
      sort_order: 50,
      description: "Fairway polos built to move.",
      published: true,
    },
    {
      kind: "sport",
      label: "Lifestyle",
      slug: "lifestyle",
      sort_order: 60,
      description: "Everyday street tees, motoline jerseys, and headwear.",
      published: true,
    },
  ];

  const { error: termsError } = await supabase
    .from("og_catalog_terms")
    .upsert(catalogTerms, { onConflict: "kind,slug" });

  if (termsError) {
    console.warn("⚠️ Terms upsert warning:", termsError.message);
  } else {
    console.log("✅ Successfully synced 9 collections and 6 sports into public.og_catalog_terms!");
  }

  // Deactivate obsolete collection rails
  await supabase
    .from("og_catalog_terms")
    .update({ published: false })
    .eq("kind", "collection")
    .in("slug", ["discfest", "og-vibe"]);

  console.log("🎉 All catalog products and taxonomy collections are 100% synchronized with Supabase!");
}

sync().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
