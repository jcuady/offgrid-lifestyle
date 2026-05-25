import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/src/data/products";
import { products as initialProducts } from "@/src/data/products";
import type { SiteEvent } from "@/src/data/events";
import { initialEvents } from "@/src/data/events";
import type { LandingCollectionId, LandingContent } from "@/src/data/landingContent";
import { initialLandingContent } from "@/src/data/landingContent";
import type { CustomPageContent } from "@/src/data/customPageContent";
import { initialCustomPageContent, normalizeCustomPageContent } from "@/src/data/customPageContent";
import { FIXED_GUIDE_CTA_HREF, getCanonicalGuideSectionSeeds, resolveGuideSections } from "@/src/lib/customGuideSections";
import {
  isCanonicalTemplateId,
  resolveCanonicalTemplates,
  type EditableTemplatePatch,
} from "@/src/lib/canonicalTemplates";

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
  landingContent: LandingContent;
  customPageContent: CustomPageContent;
  customSections: CustomContentSection[];
  customTemplates: CustomTemplateAsset[];

  updateCustomHub: (patch: Partial<CustomPageContent["hub"]>) => void;
  updateCustomOrderHero: (patch: Partial<CustomPageContent["orderHero"]>) => void;
  updateCustomWizard: (patch: Partial<CustomPageContent["wizard"]>) => void;
  updateCustomWizardStep1: (patch: Partial<CustomPageContent["wizard"]["step1"]>) => void;
  updateCustomWizardStep2: (patch: Partial<CustomPageContent["wizard"]["step2"]>) => void;
  updateCustomWizardStep3: (patch: Partial<CustomPageContent["wizard"]["step3"]>) => void;
  updateCustomProcessStep: (index: 0 | 1 | 2, patch: Partial<CustomPageContent["hub"]["processSteps"][number]>) => void;
  updateCustomTemplatesPage: (patch: Partial<CustomPageContent["templatesPage"]>) => void;
  updateCanonicalTemplate: (id: string, patch: EditableTemplatePatch) => void;
  applyCanonicalTemplateFileOverride: (
    id: string,
    file: { fileName: string; format: string },
  ) => void;
  resetCustomPageContent: () => void;
  resetCustomGuideSections: () => void;
  resetCanonicalTemplates: () => void;
  resetCanonicalTemplateSlot: (id: string) => void;

  setLandingContent: (next: LandingContent) => void;
  updateLandingHero: (patch: Partial<LandingContent["hero"]>) => void;
  updateLandingCollectionsHeader: (patch: Partial<LandingContent["collectionsHeader"]>) => void;
  updateLandingCollectionCard: (
    id: LandingCollectionId,
    patch: Partial<Pick<LandingContent["collections"][number], "title" | "subtitle" | "tag" | "image">>,
  ) => void;
  updateLandingBestSellersHeader: (patch: Partial<LandingContent["bestSellersHeader"]>) => void;
  updateLandingBestSellersShopLink: (label: string) => void;
  updateLandingBrandStory: (patch: Partial<LandingContent["brandStory"]>) => void;
  updateLandingEvent: (patch: Partial<LandingContent["event"]>) => void;
  updateLandingSocialHeader: (patch: Partial<LandingContent["socialHeader"]>) => void;
  updateLandingUgcTile: (index: 0 | 1 | 2 | 3 | 4, patch: Partial<LandingContent["ugcTiles"][number]>) => void;
  updateLandingTestimonial: (
    index: 0 | 1 | 2,
    patch: Partial<LandingContent["testimonials"][number]>,
  ) => void;
  updateLandingTestimonialsViewAll: (label: string) => void;
  updateLandingCta: (patch: Partial<LandingContent["cta"]>) => void;
  updateLandingFooter: (patch: Partial<LandingContent["footer"]>) => void;
  resetLandingContent: () => void;

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

const initialCustomSections: CustomContentSection[] = getCanonicalGuideSectionSeeds();

const initialTemplates: CustomTemplateAsset[] = createCanonicalOgTemplates(nowIso());

const SITE_CONTENT_PERSIST_VERSION = 6;

type PersistedSiteContentSlice = {
  products?: Product[];
  events?: SiteEvent[];
  landingContent?: LandingContent;
  customPageContent?: CustomPageContent;
  customSections?: CustomContentSection[];
  customTemplates?: CustomTemplateAsset[];
};

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      products: initialProducts,
      events: initialEvents,
      landingContent: initialLandingContent,
      customPageContent: normalizeCustomPageContent(initialCustomPageContent),
      customSections: initialCustomSections,
      customTemplates: initialTemplates,

      updateCustomHub: (patch) =>
        set((state) => ({
          customPageContent: { ...state.customPageContent, hub: { ...state.customPageContent.hub, ...patch } },
        })),
      updateCustomOrderHero: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            orderHero: { ...state.customPageContent.orderHero, ...patch },
          },
        })),
      updateCustomWizard: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            wizard: { ...state.customPageContent.wizard, ...patch },
          },
        })),
      updateCustomWizardStep1: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            wizard: { ...state.customPageContent.wizard, step1: { ...state.customPageContent.wizard.step1, ...patch } },
          },
        })),
      updateCustomWizardStep2: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            wizard: { ...state.customPageContent.wizard, step2: { ...state.customPageContent.wizard.step2, ...patch } },
          },
        })),
      updateCustomWizardStep3: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            wizard: { ...state.customPageContent.wizard, step3: { ...state.customPageContent.wizard.step3, ...patch } },
          },
        })),
      updateCustomProcessStep: (index, patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            hub: {
              ...state.customPageContent.hub,
              processSteps: state.customPageContent.hub.processSteps.map((step, i) =>
                i === index ? { ...step, ...patch } : step,
              ),
            },
          },
        })),
      updateCustomTemplatesPage: (patch) =>
        set((state) => ({
          customPageContent: {
            ...state.customPageContent,
            templatesPage: { ...state.customPageContent.templatesPage, ...patch },
          },
        })),
      updateCanonicalTemplate: (id, patch) => {
        if (!isCanonicalTemplateId(id)) return;
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.map((entry) =>
              entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry,
            ),
          ),
        }));
      },
      applyCanonicalTemplateFileOverride: (id, file) => {
        if (!isCanonicalTemplateId(id)) return;
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    storageKind: "idb",
                    fileName: file.fileName,
                    format: file.format,
                    fileUrl: "",
                    updatedAt: nowIso(),
                  }
                : entry,
            ),
          ),
        }));
      },
      resetCustomPageContent: () =>
        set({
          customPageContent: normalizeCustomPageContent(initialCustomPageContent),
          customTemplates: createCanonicalOgTemplates(nowIso()),
        }),
      resetCustomGuideSections: () => set({ customSections: getCanonicalGuideSectionSeeds() }),
      resetCanonicalTemplates: () => set({ customTemplates: createCanonicalOgTemplates(nowIso()) }),
      resetCanonicalTemplateSlot: (id) => {
        if (!isCanonicalTemplateId(id)) return;
        const seed = createCanonicalOgTemplates(nowIso()).find((t) => t.id === id);
        if (!seed) return;
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.map((entry) => (entry.id === id ? seed : entry)),
          ),
        }));
      },

      setLandingContent: (next) => set({ landingContent: next }),
      updateLandingHero: (patch) =>
        set((state) => ({ landingContent: { ...state.landingContent, hero: { ...state.landingContent.hero, ...patch } } })),
      updateLandingCollectionsHeader: (patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            collectionsHeader: { ...state.landingContent.collectionsHeader, ...patch },
          },
        })),
      updateLandingCollectionCard: (id, patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            collections: state.landingContent.collections.map((card) =>
              card.id === id ? { ...card, ...patch } : card,
            ),
          },
        })),
      updateLandingBestSellersHeader: (patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            bestSellersHeader: { ...state.landingContent.bestSellersHeader, ...patch },
          },
        })),
      updateLandingBestSellersShopLink: (label) =>
        set((state) => ({ landingContent: { ...state.landingContent, bestSellersShopLink: label } })),
      updateLandingBrandStory: (patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            brandStory: { ...state.landingContent.brandStory, ...patch },
          },
        })),
      updateLandingEvent: (patch) =>
        set((state) => ({
          landingContent: { ...state.landingContent, event: { ...state.landingContent.event, ...patch } },
        })),
      updateLandingSocialHeader: (patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            socialHeader: { ...state.landingContent.socialHeader, ...patch },
          },
        })),
      updateLandingUgcTile: (index, patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            ugcTiles: state.landingContent.ugcTiles.map((tile, i) =>
              i === index ? { ...tile, ...patch } : tile,
            ),
          },
        })),
      updateLandingTestimonial: (index, patch) =>
        set((state) => ({
          landingContent: {
            ...state.landingContent,
            testimonials: state.landingContent.testimonials.map((entry, i) =>
              i === index ? { ...entry, ...patch } : entry,
            ),
          },
        })),
      updateLandingTestimonialsViewAll: (label) =>
        set((state) => ({ landingContent: { ...state.landingContent, testimonialsViewAll: label } })),
      updateLandingCta: (patch) =>
        set((state) => ({
          landingContent: { ...state.landingContent, cta: { ...state.landingContent.cta, ...patch } },
        })),
      updateLandingFooter: (patch) =>
        set((state) => ({
          landingContent: { ...state.landingContent, footer: { ...state.landingContent.footer, ...patch } },
        })),
      resetLandingContent: () => set({ landingContent: initialLandingContent }),

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
          customSections: state.customSections.map((entry) => {
            if (entry.id !== id) return entry;
            const { ctaHref: _cta, slug: _slug, id: _id, ...editable } = patch;
            return {
              ...entry,
              ...editable,
              ctaHref: FIXED_GUIDE_CTA_HREF[entry.slug],
              updatedAt: nowIso(),
            };
          }),
        })),
      removeCustomSection: (id) =>
        set((state) => ({ customSections: state.customSections.filter((entry) => entry.id !== id) })),

      /** MVP: no new template slots — only canonical IDs can be updated. */
      addTemplate: (input) => {
        if (!isCanonicalTemplateId(input.id)) return;
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.map((entry) =>
              entry.id === input.id ? { ...entry, ...input, updatedAt: nowIso() } : entry,
            ),
          ),
        }));
      },
      updateTemplate: (id, patch) => {
        if (!isCanonicalTemplateId(id)) {
          set((state) => ({
            customTemplates: state.customTemplates.map((entry) =>
              entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry,
            ),
          }));
          return;
        }
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.map((entry) =>
              entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry,
            ),
          ),
        }));
      },
      removeTemplate: (id) => {
        if (isCanonicalTemplateId(id)) return;
        set((state) => ({
          customTemplates: resolveCanonicalTemplates(
            state.customTemplates.filter((entry) => entry.id !== id),
          ),
        }));
      },
    }),
    {
      name: "og-site-content",
      version: SITE_CONTENT_PERSIST_VERSION,
      migrate: (persistedState, version): PersistedSiteContentSlice => {
        const p = persistedState as PersistedSiteContentSlice;
        let next: PersistedSiteContentSlice = { ...p };

        if (version < 2) {
          next = {
            ...next,
            customTemplates: createCanonicalOgTemplates(nowIso()),
          };
        } else if (next.customTemplates?.length) {
          next = {
            ...next,
            customTemplates: next.customTemplates.map((t) => ({
              ...t,
              storageKind: t.storageKind ?? "static",
            })),
          };
        }

        if (version < 3) {
          const seedById = new Map(initialProducts.map((x) => [x.id, x]));
          const mergedProducts = (next.products ?? initialProducts).map((prod) => {
            const seed = seedById.get(prod.id);
            if (!seed) return prod;
            if (prod.homeBestSellerRank != null) return prod;
            if (seed.homeBestSellerRank == null) return prod;
            return { ...prod, homeBestSellerRank: seed.homeBestSellerRank };
          });
          next = { ...next, products: mergedProducts };
        }

        if (version < 4) {
          next = { ...next, landingContent: next.landingContent ?? initialLandingContent };
        }

        if (version < 5) {
          next = {
            ...next,
            customPageContent: normalizeCustomPageContent(
              next.customPageContent ?? initialCustomPageContent,
            ),
            customSections: resolveGuideSections(next.customSections ?? initialCustomSections),
          };
        }

        if (version < 6) {
          const page = normalizeCustomPageContent({
            ...initialCustomPageContent,
            ...next.customPageContent,
            templatesPage: {
              ...initialCustomPageContent.templatesPage,
              ...next.customPageContent?.templatesPage,
            },
          });
          next = {
            ...next,
            customPageContent: page,
            customTemplates: resolveCanonicalTemplates(next.customTemplates ?? initialTemplates),
          };
        }

        next = {
          ...next,
          customPageContent: normalizeCustomPageContent(
            next.customPageContent ?? initialCustomPageContent,
          ),
          customSections: resolveGuideSections(next.customSections ?? initialCustomSections),
          customTemplates: resolveCanonicalTemplates(next.customTemplates ?? initialTemplates),
        };

        return next;
      },
      partialize: (state) => ({
        products: state.products,
        events: state.events,
        landingContent: state.landingContent,
        customPageContent: normalizeCustomPageContent(state.customPageContent),
        customSections: resolveGuideSections(state.customSections),
        customTemplates: resolveCanonicalTemplates(state.customTemplates),
      }),
    },
  ),
);
