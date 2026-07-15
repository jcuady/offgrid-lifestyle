/** Canonical production URL (www is primary on Vercel). */
export const SITE_URL = "https://www.oglifestyleph.com";

export const SITE_NAME = "OFFGRID® Lifestyle";

export const SITE_TITLE =
  "OFFGRID® | Ultimate Frisbee, Pickleball & Custom Teamwear Philippines";

export const SITE_DESCRIPTION =
  "OFFGRID Filipino sportswear — ultimate frisbee retail, pickleball, golf, running, and custom team kits. Designed in Manila.";

export const SITE_KEYWORDS =
  "OFFGRID Lifestyle, oglifestyleph, Filipino sportswear, ultimate frisbee apparel, custom teamwear, pickleball apparel, golf wear, Philippines, team uniforms, Manila sportswear";

/** Social preview — dark wordmark on light background. */
export const SITE_OG_IMAGE_PATH = "/OG%20logo/OG%20logo/Complete/Black%20No%20BG.png";

/** Square mark for favicon, PWA, and schema.org logo. */
export const SITE_LOGO_ICON_PATH = "/favicon_io/android-chrome-192x192.png";

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export interface PageSeoInput {
  title: string;
  description: string;
  /** Path only, e.g. `/shop` */
  path?: string;
  imagePath?: string;
  noindex?: boolean;
  type?: "website" | "product";
}

export function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function upsertCanonical(href: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function upsertJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[] | null) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement("script");
  el.id = id;
  el.setAttribute("type", "application/ld+json");
  el.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(el);
}

export function applyPageSeo(input: PageSeoInput) {
  const path = input.path ?? "/";
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(input.imagePath ?? SITE_OG_IMAGE_PATH);

  document.title = input.title;
  upsertCanonical(canonical);

  const robots = input.noindex ? "noindex, nofollow" : "index, follow";
  upsertMeta("name", "description", input.description);
  upsertMeta("name", "robots", robots);
  upsertMeta("property", "og:title", input.title);
  upsertMeta("property", "og:description", input.description);
  upsertMeta("property", "og:url", canonical);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:type", input.type ?? "website");
  upsertMeta("name", "twitter:title", input.title);
  upsertMeta("name", "twitter:description", input.description);
  upsertMeta("name", "twitter:image", image);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OFFGRID Lifestyle",
    url: SITE_URL,
    logo: absoluteUrl(SITE_LOGO_ICON_PATH),
    description:
      "OFFGRID Filipino sportswear — ultimate frisbee retail, pickleball, golf, running, and custom team kits.",
    areaServed: "PH",
    sameAs: [
      "https://www.instagram.com/offgridlifestyle.ph/",
      "https://www.facebook.com/offgridlifestyleph/",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  price: number;
  currency?: string;
  inStock?: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? absoluteUrl(product.image) : absoluteUrl(SITE_OG_IMAGE_PATH),
    url: absoluteUrl(`/shop/${product.slug}`),
    brand: { "@type": "Brand", name: "OFFGRID Lifestyle" },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency ?? "PHP",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/shop/${product.slug}`),
    },
  };
}
