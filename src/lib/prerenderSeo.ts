import { BRAND_LEGAL_NAME } from "@/src/lib/brandName";
import { SITE_OG_IMAGE_PATH, absoluteUrl } from "@/src/lib/siteSeo";

export interface PrerenderLink {
  href: string;
  label: string;
}

export interface PrerenderPage {
  path: string;
  title: string;
  description: string;
  imagePath?: string;
  type?: "website" | "product";
  /** Script id → JSON-LD; ids match the client `upsertJsonLd` ids so hydration replaces instead of duplicating. */
  jsonLd?: Record<string, Record<string, unknown>>;
  heading: string;
  paragraphs: string[];
  links: PrerenderLink[];
}

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CANONICAL = /<link rel="canonical" href="[^"]*"\s*\/?>/;
const ROOT = /<div id="root" class="relative"><\/div>/;
const metaPattern = (attr: "name" | "property", key: string) =>
  new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);

function replaceOnce(html: string, pattern: RegExp, replacement: string, label: string): string {
  if (!pattern.test(html)) throw new Error(`prerender: template is missing ${label}`);
  return html.replace(pattern, () => replacement);
}

/** H1 from a route title: drop the trailing brand suffix, keep the home title readable. */
export function headingFromTitle(title: string): string {
  const [lead, rest] = title.split(" | ");
  return lead === BRAND_LEGAL_NAME && rest ? `${lead} — ${rest}` : lead;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function renderBody(page: PrerenderPage): string {
  const image =
    page.type === "product" && page.imagePath
      ? `<img src="${escapeHtml(page.imagePath)}" alt="${escapeHtml(page.heading)}" style="max-width:100%;height:auto" />`
      : "";
  const paragraphs = page.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const links = page.links
    .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("");
  return `<main style="max-width:64rem;margin:0 auto;padding:6rem 1.5rem 4rem"><h1>${escapeHtml(page.heading)}</h1>${image}${paragraphs}<nav aria-label="Site pages"><ul>${links}</ul></nav></main>`;
}

/** Per-URL HTML: own title/description/canonical/OG + JSON-LD + crawlable body (React replaces #root on mount). */
export function renderPrerenderHtml(template: string, page: PrerenderPage): string {
  const url = escapeHtml(absoluteUrl(page.path));
  const image = escapeHtml(absoluteUrl(page.imagePath ?? SITE_OG_IMAGE_PATH));
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  let html = replaceOnce(template, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "<title>");
  html = replaceOnce(html, CANONICAL, `<link rel="canonical" href="${url}" />`, "canonical");

  const metas: ["name" | "property", string, string][] = [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:type", page.type ?? "website"],
    ["property", "og:url", url],
    ["property", "og:image", image],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", image],
  ];
  for (const [attr, key, content] of metas) {
    html = replaceOnce(html, metaPattern(attr, key), `<meta ${attr}="${key}" content="${content}" />`, key);
  }

  const ld = Object.entries(page.jsonLd ?? {})
    .map(
      ([id, data]) =>
        `<script type="application/ld+json" id="${id}">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n    ");
  if (ld) html = html.replace("</head>", `    ${ld}\n  </head>`);

  return replaceOnce(html, ROOT, `<div id="root" class="relative">${renderBody(page)}</div>`, "#root");
}

/** SPA fallback for non-prerendered routes: no canonical/og:url so it never claims to be the homepage. */
export function renderSpaShell(template: string): string {
  return replaceOnce(replaceOnce(template, CANONICAL, "", "canonical"), metaPattern("property", "og:url"), "", "og:url");
}
