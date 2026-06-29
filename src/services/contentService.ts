import type { SiteEvent } from "@/src/data/events";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import type { CustomHeadwearOption } from "@/src/data/customHeadwearOptions";
import type { Database } from "@/src/types/database";
import { supabase } from "@/src/lib/supabase";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export interface ContentService {
  listEvents: () => SiteEvent[];
  addEvent: (input: SiteEvent) => void;
  updateEvent: (id: string, patch: Partial<SiteEvent>) => void;
  removeEvent: (id: string) => void;
  listCustomSections: () => CustomContentSection[];
  addCustomSection: (input: CustomContentSection) => void;
  updateCustomSection: (id: string, patch: Partial<CustomContentSection>) => void;
  removeCustomSection: (id: string) => void;
  listTemplates: () => CustomTemplateAsset[];
  addTemplate: (input: CustomTemplateAsset) => void;
  updateTemplate: (id: string, patch: Partial<CustomTemplateAsset>) => void;
  removeTemplate: (id: string) => void;
  listHeadwearOptions: () => CustomHeadwearOption[];
  addHeadwearOption: (input: Omit<CustomHeadwearOption, "updatedAt">) => void;
  updateHeadwearOption: (id: string, patch: Partial<Omit<CustomHeadwearOption, "id">>) => void;
  removeHeadwearOption: (id: string) => void;
}

/**
 * Content service backed by Supabase for headwear options, guide sections,
 * and template slots. Events still use the local store (no DB table yet).
 */
export const supabaseContentService: ContentService = {
  // Events stay localStorage (no og_events table yet)
  listEvents: () => useSiteContentStore.getState().events,
  addEvent: (input) => useSiteContentStore.getState().addEvent(input),
  updateEvent: (id, patch) => useSiteContentStore.getState().updateEvent(id, patch),
  removeEvent: (id) => useSiteContentStore.getState().removeEvent(id),

  // Custom guide sections — backed by og_custom_guide_sections
  listCustomSections: () => useSiteContentStore.getState().customSections,
  addCustomSection: (input) => {
    useSiteContentStore.getState().addCustomSection(input);
    supabase
      .from("og_custom_guide_sections")
      .upsert({
        id: input.id,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        summary: input.summary,
        body: input.body,
        hero_image: input.heroImage,
        cta_label: input.ctaLabel,
        cta_href: input.ctaHref,
        is_published: input.isPublished,
        sort_order: 0,
      })
      .then(({ error }) => {
        if (error) console.warn("Guide section upsert failed:", error.message);
      });
  },
  updateCustomSection: (id, patch) => {
    useSiteContentStore.getState().updateCustomSection(id, patch);
    type GuideUpdate = Database["public"]["Tables"]["og_custom_guide_sections"]["Update"];
    const partial: GuideUpdate = {};
    if (patch.title !== undefined) partial.title = patch.title;
    if (patch.subtitle !== undefined) partial.subtitle = patch.subtitle;
    if (patch.summary !== undefined) partial.summary = patch.summary;
    if (patch.body !== undefined) partial.body = patch.body;
    if (patch.heroImage !== undefined) partial.hero_image = patch.heroImage;
    if (patch.ctaLabel !== undefined) partial.cta_label = patch.ctaLabel;
    if (patch.ctaHref !== undefined) partial.cta_href = patch.ctaHref;
    if (patch.isPublished !== undefined) partial.is_published = patch.isPublished;
    if (Object.keys(partial).length > 0) {
      supabase
        .from("og_custom_guide_sections")
        .update(partial)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Guide section update failed:", error.message);
        });
    }
  },
  removeCustomSection: (id) => {
    useSiteContentStore.getState().removeCustomSection(id);
    supabase
      .from("og_custom_guide_sections")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Guide section delete failed:", error.message);
      });
  },

  // Templates — backed by og_custom_template_slots
  listTemplates: () => useSiteContentStore.getState().customTemplates,
  addTemplate: (input) => {
    useSiteContentStore.getState().addTemplate(input);
    supabase
      .from("og_custom_template_slots")
      .upsert({
        id: input.id,
        category: input.category,
        name: input.name,
        description: input.description ?? "",
        file_name: input.fileName,
        file_url: input.fileUrl ?? "",
        format: input.format ?? "",
        preview_image_url: input.previewImageUrl ?? null,
        is_published: input.isPublished,
      })
      .then(({ error }) => {
        if (error) console.warn("Template upsert failed:", error.message);
      });
  },
  updateTemplate: (id, patch) => {
    useSiteContentStore.getState().updateTemplate(id, patch);
    type TemplateUpdate = Database["public"]["Tables"]["og_custom_template_slots"]["Update"];
    const partial: TemplateUpdate = {};
    if (patch.name !== undefined) partial.name = patch.name;
    if (patch.description !== undefined) partial.description = patch.description;
    if (patch.fileName !== undefined) partial.file_name = patch.fileName;
    if (patch.fileUrl !== undefined) partial.file_url = patch.fileUrl;
    if (patch.isPublished !== undefined) partial.is_published = patch.isPublished;
    if (Object.keys(partial).length > 0) {
      supabase
        .from("og_custom_template_slots")
        .update(partial)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Template update failed:", error.message);
        });
    }
  },
  removeTemplate: (id) => {
    useSiteContentStore.getState().removeTemplate(id);
    supabase
      .from("og_custom_template_slots")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Template delete failed:", error.message);
      });
  },

  // Headwear options — backed by og_custom_headwear_options
  listHeadwearOptions: () => useSiteContentStore.getState().customHeadwearOptions,
  addHeadwearOption: (input) => {
    useSiteContentStore.getState().addHeadwearOption(input);
    supabase
      .from("og_custom_headwear_options")
      .upsert({
        id: input.id,
        label: input.label,
        description: input.description,
        option_group: input.group,
        price_modifier: input.priceModifier,
        order_sheet_product_type: input.orderSheetProductType,
        sort_order: input.sortOrder,
        is_published: input.isPublished,
      })
      .then(({ error }) => {
        if (error) console.warn("Headwear option upsert failed:", error.message);
      });
  },
  updateHeadwearOption: (id, patch) => {
    useSiteContentStore.getState().updateHeadwearOption(id, patch);
    type HwUpdate = Database["public"]["Tables"]["og_custom_headwear_options"]["Update"];
    const partial: HwUpdate = {};
    if (patch.label !== undefined) partial.label = patch.label;
    if (patch.description !== undefined) partial.description = patch.description;
    if (patch.group !== undefined) partial.option_group = patch.group;
    if (patch.priceModifier !== undefined) partial.price_modifier = patch.priceModifier;
    if (patch.isPublished !== undefined) partial.is_published = patch.isPublished;
    if (Object.keys(partial).length > 0) {
      supabase
        .from("og_custom_headwear_options")
        .update(partial)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Headwear option update failed:", error.message);
        });
    }
  },
  removeHeadwearOption: (id) => {
    useSiteContentStore.getState().removeHeadwearOption(id);
    supabase
      .from("og_custom_headwear_options")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Headwear option delete failed:", error.message);
      });
  },
};

/** Load custom CMS tables from Supabase into the local store (if rows exist). */
export async function hydrateCustomContentFromSupabase(): Promise<void> {
  const [sectionsRes, headwearRes, templatesRes] = await Promise.all([
    supabase.from("og_custom_guide_sections").select("*").order("sort_order"),
    supabase.from("og_custom_headwear_options").select("*").order("sort_order"),
    supabase.from("og_custom_template_slots").select("*"),
  ]);

  const patch: Record<string, unknown> = {};

  if (sectionsRes.data?.length) {
    patch.customSections = sectionsRes.data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle ?? "",
      summary: row.summary ?? "",
      body: row.body ?? "",
      heroImage: row.hero_image ?? "",
      ctaLabel: row.cta_label ?? "",
      ctaHref: row.cta_href ?? "",
      isPublished: row.is_published ?? true,
    }));
  }

  if (headwearRes.data?.length) {
    patch.customHeadwearOptions = headwearRes.data.map((row) => ({
      id: row.id,
      label: row.label,
      description: row.description ?? "",
      group: row.option_group as "headwear" | "towel",
      priceModifier: Number(row.price_modifier) || 1,
      orderSheetProductType: row.order_sheet_product_type ?? "headwear",
      sortOrder: row.sort_order ?? 0,
      isPublished: row.is_published ?? true,
      updatedAt: row.updated_at,
    }));
  }

  if (templatesRes.data?.length) {
    patch.customTemplates = templatesRes.data.map((row) => ({
      id: row.id,
      category: row.category,
      name: row.name,
      description: row.description ?? "",
      fileName: row.file_name,
      fileUrl: row.file_url ?? "",
      format: row.format ?? "",
      previewImageUrl: row.preview_image_url ?? null,
      isPublished: row.is_published ?? true,
      storageKind: "static" as const,
    }));
  }

  if (Object.keys(patch).length > 0) {
    useSiteContentStore.setState(patch);
  }
}
