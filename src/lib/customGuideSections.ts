import type { CustomContentSection, CustomSectionSlug } from "@/src/store/useSiteContentStore";

/** Fixed CTA destinations per guide panel — not editable in CMS. */
export const FIXED_GUIDE_CTA_HREF: Record<CustomSectionSlug, string> = {
  "how-to-order": "/custom/order",
  "product-catalog": "/shop",
  "team-deals": "/custom/order",
  "sizing-chart": "/custom/templates",
  "free-jersey-promo": "/custom/order",
  faqs: "/custom/order",
  "lead-times": "/custom/order",
};

export const LEGACY_FAQS_SUMMARY =
  "Lead times, payment setup, revisions, shipping, and reorders.";
export const LEGACY_FAQS_BODY =
  "Common FAQ topics include: minimum quantity, deposit requirements, revision limits, sample policy, shipping SLA, and post-delivery support.";
export const OFFGRID_FAQS_SUMMARY =
  "File submission rules, order minimums, and free OffGrid design support.";
export const OFFGRID_FAQS_BODY =
  "1) Tops and bottoms minimum: 10 pieces per design. You can mix shirt types within that 10-piece run (tank tops, short sleeves, long sleeves, and sun hoodies).\n2) Artwork submission: Place your design in OffGrid templates, then send the final file as Adobe Illustrator (.AI) in CMYK color mode for clean production output.\n3) Not using Illustrator? You can still send any file format and an OffGrid rep will guide you through preparation.\n4) Create with OffGrid: Design assistance is free. Share your concept, colors, logos, references, and team style so we can build a production-ready layout faster.\n5) Need inspiration first? Review sample team looks from our channels and include pegs in your brief so we can match your direction.";

/** Ensures exactly seven panels in canonical order; preserves admin text/images. */
export function resolveGuideSections(sections: CustomContentSection[]): CustomContentSection[] {
  const bySlug = new Map(sections.map((s) => [s.slug, s]));
  const seeds = getCanonicalGuideSectionSeeds();
  return seeds.map((seed) => {
    const found = bySlug.get(seed.slug);
    if (!found) return seed;
    return {
      ...seed,
      title: found.title,
      subtitle: found.subtitle,
      summary: found.summary,
      body: found.body,
      heroImage: found.heroImage,
      ctaLabel: found.ctaLabel,
      ctaHref: FIXED_GUIDE_CTA_HREF[seed.slug],
      isPublished: found.isPublished,
      updatedAt: found.updatedAt,
    };
  });
}

/** Canonical seven guide panels (ids + slugs fixed). */
export function getCanonicalGuideSectionSeeds(): CustomContentSection[] {
  const now = new Date().toISOString();
  const row = (
    partial: Omit<CustomContentSection, "updatedAt" | "ctaHref"> & { slug: CustomSectionSlug },
  ): CustomContentSection => ({
    ...partial,
    ctaHref: FIXED_GUIDE_CTA_HREF[partial.slug],
    updatedAt: now,
  });

  return [
    row({
      id: "sec-how-to-order",
      slug: "how-to-order",
      title: "How To Order",
      subtitle: "Simple Steps To Launch Your Team Kit",
      summary: "Upload design, confirm fit/material, approve quote, then production starts after deposit.",
      body:
        "1) Share your design brief or artwork.\n2) Select cut, material, and print method.\n3) Review quote and sample mockup.\n4) Confirm quantities and settle deposit.\n5) Production + quality check + delivery.",
      heroImage:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Start A Custom Order",
      isPublished: true,
    }),
    row({
      id: "sec-product-catalog",
      slug: "product-catalog",
      title: "Product Catalog",
      subtitle: "Cuts, Fabrics, And Finishes",
      summary: "Explore available custom jersey and lifestyle silhouettes.",
      body:
        "Available lines include game jerseys, training tops, warm-up layers, and casual teamwear. Choose from dri-fit, cotton, running mesh, and poly blend options with multiple print methods.",
      heroImage:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "View Shop",
      isPublished: true,
    }),
    row({
      id: "sec-team-deals",
      slug: "team-deals",
      title: "Team Deals",
      subtitle: "Volume Packages For Clubs And Communities",
      summary: "Get better pricing at higher quantities and bundled production runs.",
      body:
        "Starter package: 20-35 pcs.\nClub package: 36-80 pcs.\nLeague package: 81+ pcs.\nAsk for recurring season plans and rolling drop schedules.",
      heroImage:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Request Team Quote",
      isPublished: true,
    }),
    row({
      id: "sec-sizing-chart",
      slug: "sizing-chart",
      title: "Sizing Chart",
      subtitle: "Fit Guide For Jerseys And Shorts",
      summary: "Measure chest, length, and waist using our standard OffGrid fitting guide.",
      body:
        "Tops: measure chest side seam to side seam and body length from neck base.\nShorts: measure waist relaxed and stretched, then outseam length.\nFor team runs, collect full roster sizes in one sheet before checkout.",
      heroImage:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Browse Templates",
      isPublished: true,
    }),
    row({
      id: "sec-free-jersey-promo",
      slug: "free-jersey-promo",
      title: "Get A Free Jersey Promo",
      subtitle: "Limited Offers For Qualified Team Orders",
      summary: "Seasonal promo mechanics for selected custom volume thresholds.",
      body:
        "Promo periods run on selected months. Minimum order quantity and design approval requirements apply. Promo availability and terms can be configured from the admin dashboard.",
      heroImage:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Check Eligibility",
      isPublished: true,
    }),
    row({
      id: "sec-faqs",
      slug: "faqs",
      title: "FAQs",
      subtitle: "File Prep And Design Support",
      summary: OFFGRID_FAQS_SUMMARY,
      body: OFFGRID_FAQS_BODY,
      heroImage:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Start Inquiry",
      isPublished: true,
    }),
    row({
      id: "sec-lead-times",
      slug: "lead-times",
      title: "Lead Times",
      subtitle: "Production And Delivery Timeline",
      summary: "Standard production starts after deposit confirmation.",
      body:
        "Design validation: 1-2 business days.\nProduction: 5-10 business days depending on order size.\nShipping: 2-5 business days nationwide.",
      heroImage:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop",
      ctaLabel: "Place Custom Order",
      isPublished: true,
    }),
  ];
}
