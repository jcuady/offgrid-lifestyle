import type { SiteEvent } from "@/src/data/events";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import type { CustomHeadwearOption } from "@/src/data/customHeadwearOptions";
import type { Database } from "@/src/types/database";
import { logger } from "@/src/lib/logger";
import { loadFeaturedSpotlight, loadSiteCustomPages } from "@/src/lib/siteContentPersistence";
import { normalizeLandingContent } from "@/src/lib/normalizeLandingContent";
import { supabase } from "@/src/lib/supabase";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { usePortalStore } from "@/src/store/usePortalStore";

type EventRow = {
  id: string;
  title: string;
  subtitle: string;
  event_date: string;
  event_time: string;
  location: string;
  address: string;
  description: string;
  image: string;
  category: string;
  status: string;
  featured: boolean;
  price: string;
  capacity: number | null;
  registered: number | null;
  highlights: string[];
  sort_order: number;
};

function eventRowToSite(row: EventRow): SiteEvent {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    date: row.event_date,
    time: row.event_time,
    location: row.location,
    address: row.address,
    description: row.description,
    image: row.image,
    category: row.category as SiteEvent["category"],
    status: row.status === "cancelled" ? "past" : (row.status as SiteEvent["status"]),
    featured: row.featured,
    price: row.price,
    capacity: row.capacity ?? undefined,
    registered: row.registered ?? undefined,
    highlights: row.highlights ?? [],
  };
}

function siteEventToRow(event: SiteEvent, sortOrder = 0) {
  return {
    id: event.id,
    title: event.title,
    subtitle: event.subtitle,
    event_date: event.date,
    event_time: event.time,
    location: event.location,
    address: event.address,
    description: event.description,
    image: event.image,
    category: event.category,
    status: event.status,
    featured: event.featured ?? false,
    price: event.price,
    capacity: event.capacity ?? null,
    registered: event.registered ?? null,
    highlights: event.highlights,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

type ContentAuditAction = "content.created" | "content.updated" | "content.deleted";

function logContentError(operation: string, error: string): void {
  logger.warn("Content persistence failed", { service: "contentService", operation, error });
}

function auditContent(action: ContentAuditAction, targetId: string, label: string, metadata: Record<string, unknown> = {}) {
  const actor = usePortalStore.getState().currentUser;
  if (!actor) return;

  usePortalStore.getState().recordAudit({
    action,
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    targetType: "content",
    targetId,
    summary:
      action === "content.created"
        ? `Created ${label}`
        : action === "content.updated"
          ? `Updated ${label}`
          : `Deleted ${label}`,
    metadata,
  });
}

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
 * Content service backed by Supabase for events, headwear, guide sections, templates, and custom page copy.
 */
export const supabaseContentService: ContentService = {
  listEvents: () => useSiteContentStore.getState().events,
  addEvent: (input) => {
    useSiteContentStore.getState().addEvent(input);
    supabase
      .from("og_events")
      .upsert(siteEventToRow(input))
      .then(({ error }) => {
        if (error) logContentError("events.upsert", error.message);
        else auditContent("content.created", input.id, `event ${input.title}`, { kind: "event" });
      });
  },
  updateEvent: (id, patch) => {
    useSiteContentStore.getState().updateEvent(id, patch);
    const current = useSiteContentStore.getState().events.find((e) => e.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    supabase
      .from("og_events")
      .upsert(siteEventToRow(merged))
      .then(({ error }) => {
        if (error) logContentError("events.update", error.message);
        else auditContent("content.updated", id, `event ${merged.title}`, { kind: "event", fields: Object.keys(patch) });
      });
  },
  removeEvent: (id) => {
    useSiteContentStore.getState().removeEvent(id);
    supabase
      .from("og_events")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) logContentError("events.delete", error.message);
        else auditContent("content.deleted", id, `event ${id}`, { kind: "event" });
      });
  },

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
        if (error) logContentError("guideSections.upsert", error.message);
        else auditContent("content.created", input.id, `guide section ${input.title}`, { kind: "guide_section" });
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
          if (error) logContentError("guideSections.update", error.message);
          else auditContent("content.updated", id, `guide section ${id}`, { kind: "guide_section", fields: Object.keys(patch) });
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
        if (error) logContentError("guideSections.delete", error.message);
        else auditContent("content.deleted", id, `guide section ${id}`, { kind: "guide_section" });
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
        if (error) logContentError("templates.upsert", error.message);
        else auditContent("content.created", input.id, `template ${input.name}`, { kind: "template" });
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
          if (error) logContentError("templates.update", error.message);
          else auditContent("content.updated", id, `template ${id}`, { kind: "template", fields: Object.keys(patch) });
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
        if (error) logContentError("templates.delete", error.message);
        else auditContent("content.deleted", id, `template ${id}`, { kind: "template" });
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
        if (error) logContentError("headwearOptions.upsert", error.message);
        else auditContent("content.created", input.id, `headwear option ${input.label}`, { kind: "headwear_option" });
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
          if (error) logContentError("headwearOptions.update", error.message);
          else auditContent("content.updated", id, `headwear option ${id}`, { kind: "headwear_option", fields: Object.keys(patch) });
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
        if (error) logContentError("headwearOptions.delete", error.message);
        else auditContent("content.deleted", id, `headwear option ${id}`, { kind: "headwear_option" });
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

/** Load landing, custom page copy, events, and custom CMS from Supabase. */
export async function hydrateSiteContentFromSupabase(): Promise<void> {
  await hydrateCustomContentFromSupabase();

  const [pagesPatch, spotlight, eventsRes] = await Promise.all([
    loadSiteCustomPages(),
    loadFeaturedSpotlight(),
    supabase.from("og_events").select("*").order("sort_order"),
  ]);

  const storePatch: Record<string, unknown> = {};

  if (pagesPatch.landing) {
    storePatch.landingContent = normalizeLandingContent({
      ...useSiteContentStore.getState().landingContent,
      ...pagesPatch.landing,
      ...(spotlight ? { featuredSpotlight: spotlight } : {}),
    });
  } else if (spotlight) {
    storePatch.landingContent = normalizeLandingContent({
      ...useSiteContentStore.getState().landingContent,
      featuredSpotlight: spotlight,
    });
  }

  const customPagePatch: Record<string, unknown> = {};
  if (pagesPatch.hub) customPagePatch.hub = pagesPatch.hub;
  if (pagesPatch.orderHero) customPagePatch.orderHero = pagesPatch.orderHero;
  if (pagesPatch.wizard) customPagePatch.wizard = pagesPatch.wizard;
  if (pagesPatch.templatesPage) customPagePatch.templatesPage = pagesPatch.templatesPage;
  if (Object.keys(customPagePatch).length > 0) {
    storePatch.customPageContent = {
      ...useSiteContentStore.getState().customPageContent,
      ...customPagePatch,
    };
  }

  if (eventsRes.data?.length) {
    storePatch.events = eventsRes.data.map((row) => eventRowToSite(row as EventRow));
  }

  if (Object.keys(storePatch).length > 0) {
    useSiteContentStore.setState(storePatch);
  }
}
