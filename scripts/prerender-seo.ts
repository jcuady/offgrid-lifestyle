/**
 * Post-build: one static HTML file per sitemap URL (own head + crawlable body) plus the SPA
 * fallback shell and llms.txt. Vercel serves these before the SPA rewrite (cleanUrls).
 * Run: npm run build (postbuild)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolveRouteSeo } from "../src/lib/routeSeo";
import { STATIC_SITEMAP_ENTRIES } from "../src/lib/sitemap";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
} from "../src/lib/siteSeo";
import {
  breadcrumbJsonLd,
  headingFromTitle,
  renderPrerenderHtml,
  renderSpaShell,
  type PrerenderLink,
  type PrerenderPage,
} from "../src/lib/prerenderSeo";

dotenv.config();

interface SeoProduct {
  slug: string;
  name: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  price: number;
  inStock: boolean;
}

async function loadProducts(): Promise<SeoProduct[]> {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    const { data, error } = await createClient(url, key)
      .from("og_products")
      .select("slug,name,description,meta_title,meta_description,image,price,stock")
      .eq("status", "active")
      .order("slug");
    if (!error && data?.length) {
      return data.map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description ?? "",
        metaTitle: row.meta_title ?? undefined,
        metaDescription: row.meta_description ?? undefined,
        image: row.image ?? undefined,
        price: Number(row.price),
        inStock: row.stock == null || row.stock > 0,
      }));
    }
    console.warn(`prerender-seo: product fetch failed (${error?.message ?? "no rows"}) — using local products.ts`);
  }
  const { products } = await import("../src/data/products.ts");
  return products
    .filter((p) => p.status === "active")
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      image: p.image,
      price: p.price,
      inStock: p.stock === undefined || p.stock > 0,
    }));
}

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

function write(dist: string, path: string, html: string) {
  const file = resolve(dist, path === "/" ? "index.html" : `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, "utf8");
}

async function main() {
  const dist = resolve("dist");
  const template = readFileSync(resolve(dist, "index.html"), "utf8");
  const products = await loadProducts();

  const sitePages = STATIC_SITEMAP_ENTRIES.map(({ path }) => {
    const seo = resolveRouteSeo(path);
    if (!seo || seo.noindex) throw new Error(`prerender-seo: sitemap path ${path} has no indexable route SEO`);
    return { path, seo, heading: headingFromTitle(seo.title) };
  });
  const siteLinks: PrerenderLink[] = sitePages
    .filter((p) => p.path !== "/")
    .map((p) => ({ href: p.path, label: p.heading }));
  const productLinks: PrerenderLink[] = products.map((p) => ({
    href: `/shop/${p.slug}`,
    label: `${p.name} — ${peso(p.price)}`,
  }));
  const globalLd = { "jsonld-organization": organizationJsonLd(), "jsonld-website": websiteJsonLd() };
  const listsProducts = new Set(["/", "/shop", "/collections"]);

  writeFileSync(resolve(dist, "spa.html"), renderSpaShell(template), "utf8");

  for (const { path, seo, heading } of sitePages) {
    const page: PrerenderPage = {
      path,
      title: seo.title,
      description: seo.description,
      imagePath: seo.imagePath,
      jsonLd: path === "/" ? globalLd : { ...globalLd, "jsonld-breadcrumb": breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: heading, path }]) },
      heading,
      paragraphs: [seo.description],
      links: listsProducts.has(path) ? [...productLinks, ...siteLinks] : siteLinks,
    };
    write(dist, path, renderPrerenderHtml(template, page));
  }

  for (const p of products) {
    const path = `/shop/${p.slug}`;
    const description =
      p.metaDescription?.trim() || p.description.slice(0, 155).trim() || `Shop ${p.name} from ${SITE_NAME}.`;
    const page: PrerenderPage = {
      path,
      title: p.metaTitle?.trim() || `${p.name} | ${SITE_NAME}`,
      description,
      imagePath: p.image,
      type: "product",
      jsonLd: {
        ...globalLd,
        "jsonld-product": productJsonLd(p),
        "jsonld-breadcrumb": breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: p.name, path },
        ]),
      },
      heading: p.name,
      paragraphs: [peso(p.price), p.description].filter(Boolean),
      links: [{ href: "/shop", label: "Back to shop" }, ...siteLinks],
    };
    write(dist, path, renderPrerenderHtml(template, page));
  }

  const llms = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Official site: ${SITE_URL}. Studio in Marikina, Metro Manila, Philippines. Prices in Philippine pesos (PHP).`,
    "",
    "## Pages",
    "",
    ...sitePages.map((p) => `- [${p.heading}](${absoluteUrl(p.path)}): ${p.seo.description}`),
    "",
    "## Products",
    "",
    ...products.map((p) => `- [${p.name}](${absoluteUrl(`/shop/${p.slug}`)}): ${peso(p.price)}${p.inStock ? "" : " (sold out)"}`),
    "",
  ].join("\n");
  writeFileSync(resolve(dist, "llms.txt"), llms, "utf8");

  console.log(`prerender-seo: wrote ${sitePages.length} pages + ${products.length} products + spa.html + llms.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
