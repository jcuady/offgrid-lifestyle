import { SITE_URL } from "@/src/lib/siteSeo";

export type SitemapEntry = {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

/** Static public routes — keep in sync with public/sitemap baseline and routeSeo. */
export const STATIC_SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/shop", changefreq: "daily", priority: 0.9 },
  { path: "/collections", changefreq: "weekly", priority: 0.85 },
  { path: "/custom", changefreq: "weekly", priority: 0.85 },
  { path: "/custom/order", changefreq: "monthly", priority: 0.8 },
  { path: "/custom/templates", changefreq: "monthly", priority: 0.75 },
  { path: "/custom/how-to-order", changefreq: "monthly", priority: 0.7 },
  { path: "/custom/product-catalog", changefreq: "monthly", priority: 0.7 },
  { path: "/custom/team-deals", changefreq: "monthly", priority: 0.7 },
  { path: "/custom/sizing-chart", changefreq: "monthly", priority: 0.7 },
  { path: "/custom/faqs", changefreq: "monthly", priority: 0.65 },
  { path: "/custom/lead-times", changefreq: "monthly", priority: 0.65 },
  { path: "/community", changefreq: "weekly", priority: 0.8 },
  { path: "/testimonials", changefreq: "weekly", priority: 0.75 },
  { path: "/faq", changefreq: "monthly", priority: 0.7 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/legal/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/legal/terms", changefreq: "yearly", priority: 0.3 },
];

export function productSitemapEntry(slug: string): SitemapEntry {
  return { path: `/shop/${slug}`, changefreq: "weekly", priority: 0.75 };
}

export function buildSitemapXml(siteUrl: string, entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const loc = `${siteUrl.replace(/\/$/, "")}${entry.path.startsWith("/") ? entry.path : `/${entry.path}`}`;
      const priority =
        Number.isInteger(entry.priority) ? `${entry.priority}.0` : String(entry.priority);
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function mergeSitemapEntries(staticEntries: SitemapEntry[], productSlugs: string[]): SitemapEntry[] {
  const seen = new Set<string>();
  const merged: SitemapEntry[] = [];

  for (const entry of staticEntries) {
    if (seen.has(entry.path)) continue;
    seen.add(entry.path);
    merged.push(entry);
  }

  for (const slug of productSlugs) {
    const entry = productSitemapEntry(slug);
    if (seen.has(entry.path)) continue;
    seen.add(entry.path);
    merged.push(entry);
  }

  return merged;
}

/** Default sitemap for local builds without Supabase credentials. */
export function defaultSitemapXml(): string {
  return buildSitemapXml(SITE_URL, STATIC_SITEMAP_ENTRIES);
}
