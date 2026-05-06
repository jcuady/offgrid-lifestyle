import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/src/data/products";
import { products as initialProducts } from "@/src/data/products";
import type { SiteEvent } from "@/src/data/events";
import { initialEvents } from "@/src/data/events";

export type CustomSectionSlug =
  | "how-to-order"
  | "product-catalog"
  | "team-deals"
  | "sizing-chart"
  | "free-jersey-promo"
  | "faqs"
  | "lead-times";

export interface CustomContentSection {
  id: string;
  slug: CustomSectionSlug;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  heroImage: string;
  ctaLabel: string;
  ctaHref: string;
  isPublished: boolean;
  updatedAt: string;
}

export type TemplateStorageKind = "static" | "idb";

export interface CustomTemplateAsset {
  id: string;
  name: string;
  description: string;
  fileName: string;
  /** Same-origin path for `storageKind: static`; optional / ignored for `idb`. */
  fileUrl: string;
  format: string;
  isPublished: boolean;
  updatedAt: string;
  /** Bundled files use `static`; admin uploads use `idb` (blob in IndexedDB). */
  storageKind?: TemplateStorageKind;
  /** Optional image used as card preview on the templates page. */
  previewImageUrl?: string;
}

/** Filenames match `public/templates/og-client/` (kebab-case). Shirt first for wizard default. */
export function createCanonicalOgTemplates(updatedAt: string): CustomTemplateAsset[] {
  const row = (
    partial: Omit<CustomTemplateAsset, "updatedAt" | "isPublished" | "storageKind">,
  ): CustomTemplateAsset => ({
    ...partial,
    updatedAt,
    isPublished: true,
    storageKind: "static",
  });

  return [
    row({
      id: "tpl-ogl-shirt",
      name: "Shirt template",
      description: "Short sleeve layout — safe zones and bleed for production.",
      fileName: "oglifestyle-template-shirt.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-shirt.ai",
      format: "AI",
    }),
    row({
      id: "tpl-ogl-banner",
      name: "Banner template",
      description: "Wide banner artwork guides.",
      fileName: "oglifestyle-template-banner.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-banner.ai",
      format: "AI",
    }),
    row({
      id: "tpl-og-roundneck",
      name: "Round neck shirt template",
      description: "Round neck silhouette — placement and margins.",
      fileName: "og-roundneck-shirt-template.ai",
      fileUrl: "/templates/og-client/og-roundneck-shirt-template.ai",
      format: "AI",
    }),
    row({
      id: "tpl-ogl-singlet",
      name: "Singlet template",
      description: "Singlet panels and print zones.",
      fileName: "oglifestyle-template-singlet.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-singlet.ai",
      format: "AI",
    }),
    row({
      id: "tpl-ogl-longsleeves",
      name: "Long sleeves template",
      description: "Long sleeve layout — sleeves and torso guides.",
      fileName: "oglifestyle-template-longsleeves.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-longsleeves.ai",
      format: "AI",
    }),
    row({
      id: "tpl-ogl-longsleeves-hoodie",
      name: "Long sleeves hoodie template",
      description: "Hoodie silhouette — hood, body, and sleeve zones.",
      fileName: "oglifestyle-template-longsleeves-hoodie.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-longsleeves-hoodie.ai",
      format: "AI",
    }),
    row({
      id: "tpl-ogl-shorts",
      name: "Shorts template",
      description: "Shorts panels — waist, legs, and trim.",
      fileName: "oglifestyle-template-shorts.ai",
      fileUrl: "/templates/og-client/oglifestyle-template-shorts.ai",
      format: "AI",
    }),
    row({
      id: "tpl-facetowel-ai",
      name: "Face towel template (Illustrator)",
      description: "Vector towel layout — use with JPG reference if needed.",
      fileName: "facetowel-template.ai",
      fileUrl: "/templates/og-client/facetowel-template.ai",
      format: "AI",
      previewImageUrl: "/templates/og-client/facetowel-template.jpg",
    }),
    row({
      id: "tpl-facetowel-jpg",
      name: "Face towel reference (JPG)",
      description: "Raster reference for face towel artwork.",
      fileName: "facetowel-template.jpg",
      fileUrl: "/templates/og-client/facetowel-template.jpg",
      format: "JPG",
      previewImageUrl: "/templates/og-client/facetowel-template.jpg",
    }),
    row({
      id: "tpl-handtowel-ai",
      name: "Hand towel template (Illustrator)",
      description: "Vector towel layout — pair with JPG reference.",
      fileName: "handtowel-template.ai",
      fileUrl: "/templates/og-client/handtowel-template.ai",
      format: "AI",
      previewImageUrl: "/templates/og-client/handtowel-template.jpg",
    }),
    row({
      id: "tpl-handtowel-jpg",
      name: "Hand towel reference (JPG)",
      description: "Raster reference for hand towel artwork.",
      fileName: "handtowel-template.jpg",
      fileUrl: "/templates/og-client/handtowel-template.jpg",
      format: "JPG",
      previewImageUrl: "/templates/og-client/handtowel-template.jpg",
    }),
  ];
}

interface SiteContentState {
  products: Product[];
  events: SiteEvent[];
  customSections: CustomContentSection[];
  customTemplates: CustomTemplateAsset[];

  addProduct: (input: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  addEvent: (input: SiteEvent) => void;
  updateEvent: (id: string, patch: Partial<SiteEvent>) => void;
  removeEvent: (id: string) => void;

  addCustomSection: (input: CustomContentSection) => void;
  updateCustomSection: (id: string, patch: Partial<CustomContentSection>) => void;
  removeCustomSection: (id: string) => void;

  addTemplate: (input: CustomTemplateAsset) => void;
  updateTemplate: (id: string, patch: Partial<CustomTemplateAsset>) => void;
  removeTemplate: (id: string) => void;
}

const nowIso = () => new Date().toISOString();

const initialCustomSections: CustomContentSection[] = [
  {
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
    ctaHref: "/custom/order",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
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
    ctaHref: "/shop",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
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
    ctaHref: "/custom/order",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
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
    ctaHref: "/custom/templates",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
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
    ctaHref: "/custom/order",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
    id: "sec-faqs",
    slug: "faqs",
    title: "FAQs",
    subtitle: "Answers To Common Questions",
    summary: "Lead times, payment setup, revisions, shipping, and reorders.",
    body:
      "Common FAQ topics include: minimum quantity, deposit requirements, revision limits, sample policy, shipping SLA, and post-delivery support.",
    heroImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop",
    ctaLabel: "Start Inquiry",
    ctaHref: "/custom/order",
    isPublished: true,
    updatedAt: nowIso(),
  },
  {
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
    ctaHref: "/custom/order",
    isPublished: true,
    updatedAt: nowIso(),
  },
];

const initialTemplates: CustomTemplateAsset[] = createCanonicalOgTemplates(nowIso());

const SITE_CONTENT_PERSIST_VERSION = 2;

type PersistedSiteContentSlice = {
  products?: Product[];
  events?: SiteEvent[];
  customSections?: CustomContentSection[];
  customTemplates?: CustomTemplateAsset[];
};

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      products: initialProducts,
      events: initialEvents,
      customSections: initialCustomSections,
      customTemplates: initialTemplates,

      addProduct: (input) => set((state) => ({ products: [input, ...state.products] })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry,
          ),
        })),
      removeProduct: (id) =>
        set((state) => ({ products: state.products.filter((entry) => entry.id !== id) })),

      addEvent: (input) => set((state) => ({ events: [input, ...state.events] })),
      updateEvent: (id, patch) =>
        set((state) => ({
          events: state.events.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        })),
      removeEvent: (id) =>
        set((state) => ({ events: state.events.filter((entry) => entry.id !== id) })),

      addCustomSection: (input) =>
        set((state) => ({ customSections: [input, ...state.customSections] })),
      updateCustomSection: (id, patch) =>
        set((state) => ({
          customSections: state.customSections.map((entry) =>
            entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry,
          ),
        })),
      removeCustomSection: (id) =>
        set((state) => ({ customSections: state.customSections.filter((entry) => entry.id !== id) })),

      addTemplate: (input) => set((state) => ({ customTemplates: [input, ...state.customTemplates] })),
      updateTemplate: (id, patch) =>
        set((state) => ({
          customTemplates: state.customTemplates.map((entry) =>
            entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry,
          ),
        })),
      removeTemplate: (id) =>
        set((state) => ({ customTemplates: state.customTemplates.filter((entry) => entry.id !== id) })),
    }),
    {
      name: "og-site-content",
      version: SITE_CONTENT_PERSIST_VERSION,
      migrate: (persistedState, version): PersistedSiteContentSlice => {
        const p = persistedState as PersistedSiteContentSlice;
        if (version < 2) {
          return {
            ...p,
            customTemplates: createCanonicalOgTemplates(nowIso()),
          };
        }
        if (p.customTemplates?.length) {
          return {
            ...p,
            customTemplates: p.customTemplates.map((t) => ({
              ...t,
              storageKind: t.storageKind ?? "static",
            })),
          };
        }
        return p;
      },
      partialize: (state) => ({
        products: state.products,
        events: state.events,
        customSections: state.customSections,
        customTemplates: state.customTemplates,
      }),
    },
  ),
);
