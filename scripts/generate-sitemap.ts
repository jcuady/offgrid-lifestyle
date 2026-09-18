/**
 * Regenerate public/sitemap.xml from static routes + active product slugs.
 * Run: npm run generate:sitemap (also runs before build)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "../src/lib/siteSeo";
import { STATIC_SITEMAP_ENTRIES, buildSitemapXml, mergeSitemapEntries } from "../src/lib/sitemap";

dotenv.config();

async function main() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  let slugs: string[] = [];

  if (url && key) {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("og_products")
      .select("slug")
      .eq("status", "active")
      .order("slug");

    if (error) {
      console.warn(`generate-sitemap: product fetch failed (${error.message}) — static routes only`);
    } else {
      slugs = (data ?? []).map((row) => row.slug).filter((slug): slug is string => Boolean(slug));
    }
  } else {
    console.warn("generate-sitemap: missing Supabase env — static routes only");
  }

  const entries = mergeSitemapEntries(STATIC_SITEMAP_ENTRIES, slugs);
  const xml = buildSitemapXml(SITE_URL, entries);
  const out = resolve("public/sitemap.xml");
  writeFileSync(out, xml, "utf8");
  console.log(`generate-sitemap: wrote ${entries.length} URLs (${slugs.length} products) → ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
