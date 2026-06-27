/**
 * Supabase sync contract for custom-page CMS.
 * MVP still persists in localStorage (useSiteContentStore); apply migration
 * `20260627160000_site_custom_content.sql` then wire these table names in a
 * future content repository.
 */

import type { CustomHeadwearOption } from "@/src/data/customHeadwearOptions";

export const SITE_CUSTOM_TABLES = {
  pages: "og_site_custom_pages",
  guideSections: "og_custom_guide_sections",
  templateSlots: "og_custom_template_slots",
  headwearOptions: "og_custom_headwear_options",
  featuredSpotlight: "og_site_featured_spotlight",
} as const;

export interface FeaturedSpotlightRow {
  id: string;
  content: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

export type SiteCustomPageScope = "hub" | "order_hero" | "wizard" | "templates_page";

export interface SiteCustomPageRow {
  scope: SiteCustomPageScope;
  content: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

export interface GuideSectionRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  hero_image: string;
  cta_label: string;
  cta_href: string;
  is_published: boolean;
  sort_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface HeadwearOptionRow {
  id: string;
  label: string;
  description: string;
  option_group: "headwear" | "towel";
  price_modifier: number;
  order_sheet_product_type: string;
  sort_order: number;
  is_published: boolean;
  updated_at: string;
  updated_by: string | null;
}

export function toHeadwearOptionRow(
  option: CustomHeadwearOption,
): Omit<HeadwearOptionRow, "updated_at" | "updated_by"> {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    option_group: option.group,
    price_modifier: option.priceModifier,
    order_sheet_product_type: option.orderSheetProductType,
    sort_order: option.sortOrder,
    is_published: option.isPublished,
  };
}

/** Maps Zustand CustomContentSection → Supabase row shape. */
export function toGuideSectionRow(
  section: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    summary: string;
    body: string;
    heroImage: string;
    ctaLabel: string;
    ctaHref: string;
    isPublished: boolean;
  },
  sortOrder: number,
): Omit<GuideSectionRow, "updated_at" | "updated_by"> {
  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    subtitle: section.subtitle,
    summary: section.summary,
    body: section.body,
    hero_image: section.heroImage,
    cta_label: section.ctaLabel,
    cta_href: section.ctaHref,
    is_published: section.isPublished,
    sort_order: sortOrder,
  };
}
