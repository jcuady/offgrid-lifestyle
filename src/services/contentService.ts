import type { SiteEvent } from "@/src/data/events";
import { initialEvents } from "@/src/data/events";
import type { TestimonialWallEntry } from "@/src/data/testimonialsPage";
import { initialTestimonialWall } from "@/src/data/testimonialsPage";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import type { CustomHeadwearOption } from "@/src/data/customHeadwearOptions";
import type { Database } from "@/src/types/database";
import { isLegacyPlaceholderImage } from "@/src/lib/communityPhotos";
import { logger } from "@/src/lib/logger";
import { loadFeaturedSpotlight, loadSiteCustomPages } from "@/src/lib/siteContentPersistence";
import { normalizeLandingContent } from "@/src/lib/normalizeLandingContent";
import { supabase } from "@/src/lib/supabase";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { isCanonicalTemplateId, resolveCanonicalTemplates } from "@/src/lib/canonicalTemplates";

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

type TestimonialRow = {
  id: string;
  quote: string;
  author: string;
  handle: string;
  location: string;
  tag: string;
  outcome: string;
  image: string;
  featured: boolean;
  rating: number;
  published: boolean;
  sort_order: number;
};

function testimonialRowToEntry(row: TestimonialRow): TestimonialWallEntry {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    handle: row.handle,
    location: row.location,
    tag: row.tag,
    outcome: row.outcome,
    image: row.image,
    featured: row.featured,
    rating: row.rating,
    published: row.published,
    sortOrder: row.sort_order,
  };
}

function testimonialEntryToRow(entry: TestimonialWallEntry, sortOrder = entry.sortOrder) {
  return {
    id: entry.id,
    quote: entry.quote,
    author: entry.author,
    handle: entry.handle,
    location: entry.location,
    tag: entry.tag,
    outcome: entry.outcome,
    image: entry.image,
    featured: entry.featured,
    rating: entry.rating,
    published: entry.published,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

async function clearOtherFeaturedTestimonials(keepId: string): Promise<void> {
  const { error } = await supabase
    .from("og_testimonials")
    .update({ featured: false, updated_at: new Date().toISOString() })
    .neq("id", keepId);
  if (error) logContentError("testimonials.clearFeatured", error.message);
}

function templateAssetToRow(asset: CustomTemplateAsset) {
  const storageKind = asset.storageKind ?? "static";
  return {
    id: asset.id,
    category: asset.category,
    name: asset.name,
    description: asset.description ?? "",
    file_name: asset.fileName,
    file_url: asset.fileUrl ?? "",
    storage_kind: storageKind === "storage" ? "storage" : "static",
    format: asset.format ?? "",
    preview_image_url: asset.previewImageUrl?.trim() || null,
    is_published: asset.isPublished,
    updated_at: new Date().toISOString(),
  };
}

function templateRowToAsset(row: {
  id: string;
  category: string;
  name: string;
  description: string | null;
  file_name: string;
  file_url: string;
  storage_kind: string;
  format: string;
  preview_image_url: string | null;
  is_published: boolean;
  updated_at: string;
}): CustomTemplateAsset {
  const storageKind =
    row.storage_kind === "storage" ? "storage" : ("static" as const);
  return {
    id: row.id,
    category: row.category as CustomTemplateAsset["category"],
    name: row.name,
    description: row.description ?? "",
    fileName: row.file_name,
    fileUrl: row.file_url ?? "",
    format: row.format ?? "",
    previewImageUrl: row.preview_image_url ?? "",
    isPublished: row.is_published ?? false,
    storageKind,
    updatedAt: row.updated_at,
  };
}

function getMergedTemplate(id: string): CustomTemplateAsset | undefined {
  return resolveCanonicalTemplates(useSiteContentStore.getState().customTemplates).find((t) => t.id === id);
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
  addEvent: (input: SiteEvent) => Promise<string | null>;
  updateEvent: (id: string, patch: Partial<SiteEvent>) => Promise<string | null>;
  removeEvent: (id: string) => Promise<string | null>;
  listTestimonials: () => TestimonialWallEntry[];
  addTestimonial: (input: TestimonialWallEntry) => Promise<string | null>;
  updateTestimonial: (id: string, patch: Partial<TestimonialWallEntry>) => Promise<string | null>;
  removeTestimonial: (id: string) => Promise<string | null>;
  listCustomSections: () => CustomContentSection[];
  addCustomSection: (input: CustomContentSection) => void;
  updateCustomSection: (id: string, patch: Partial<CustomContentSection>) => void;
  removeCustomSection: (id: string) => void;
  listTemplates: () => CustomTemplateAsset[];
  addTemplate: (input: CustomTemplateAsset) => Promise<string | null>;
  updateTemplate: (id: string, patch: Partial<CustomTemplateAsset>) => Promise<string | null>;
  removeTemplate: (id: string) => Promise<string | null>;
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
  addEvent: async (input) => {
    useSiteContentStore.getState().addEvent(input);
    const sortOrder = useSiteContentStore.getState().events.findIndex((e) => e.id === input.id);
    const { error } = await supabase.from("og_events").upsert(siteEventToRow(input, sortOrder >= 0 ? sortOrder : 0));
    if (error) {
      useSiteContentStore.getState().removeEvent(input.id);
      logContentError("events.upsert", error.message);
      return error.message;
    }
    auditContent("content.created", input.id, `event ${input.title}`, { kind: "event" });
    return null;
  },
  updateEvent: async (id, patch) => {
    const previous = useSiteContentStore.getState().events.find((e) => e.id === id);
    if (!previous) return "Event not found.";
    useSiteContentStore.getState().updateEvent(id, patch);
    const merged = { ...previous, ...patch };
    const sortOrder = useSiteContentStore.getState().events.findIndex((e) => e.id === id);
    const { error } = await supabase
      .from("og_events")
      .upsert(siteEventToRow(merged, sortOrder >= 0 ? sortOrder : 0));
    if (error) {
      useSiteContentStore.getState().updateEvent(id, previous);
      logContentError("events.update", error.message);
      return error.message;
    }
    auditContent("content.updated", id, `event ${merged.title}`, { kind: "event", fields: Object.keys(patch) });
    return null;
  },
  removeEvent: async (id) => {
    const previous = useSiteContentStore.getState().events.find((e) => e.id === id);
    if (!previous) return null;
    useSiteContentStore.getState().removeEvent(id);
    const { error } = await supabase.from("og_events").delete().eq("id", id);
    if (error) {
      useSiteContentStore.getState().addEvent(previous);
      logContentError("events.delete", error.message);
      return error.message;
    }
    auditContent("content.deleted", id, `event ${id}`, { kind: "event" });
    return null;
  },

  // Custom guide sections  backed by og_custom_guide_sections
  listTestimonials: () => useSiteContentStore.getState().testimonialWall,
  addTestimonial: async (input) => {
    useSiteContentStore.getState().addTestimonial(input);
    if (input.featured) await clearOtherFeaturedTestimonials(input.id);
    const sortOrder = useSiteContentStore.getState().testimonialWall.findIndex((t) => t.id === input.id);
    const { error } = await supabase
      .from("og_testimonials")
      .upsert(testimonialEntryToRow(input, sortOrder >= 0 ? sortOrder : 0));
    if (error) {
      useSiteContentStore.getState().removeTestimonial(input.id);
      logContentError("testimonials.upsert", error.message);
      return error.message;
    }
    auditContent("content.created", input.id, `testimonial ${input.author}`, { kind: "testimonial" });
    return null;
  },
  updateTestimonial: async (id, patch) => {
    const previous = useSiteContentStore.getState().testimonialWall.find((t) => t.id === id);
    if (!previous) return "Testimonial not found.";
    useSiteContentStore.getState().updateTestimonial(id, patch);
    const merged = { ...previous, ...patch };
    if (merged.featured) await clearOtherFeaturedTestimonials(id);
    const sortOrder = useSiteContentStore.getState().testimonialWall.findIndex((t) => t.id === id);
    const { error } = await supabase
      .from("og_testimonials")
      .upsert(testimonialEntryToRow(merged, sortOrder >= 0 ? sortOrder : 0));
    if (error) {
      useSiteContentStore.getState().updateTestimonial(id, previous);
      logContentError("testimonials.update", error.message);
      return error.message;
    }
    auditContent("content.updated", id, `testimonial ${merged.author}`, {
      kind: "testimonial",
      fields: Object.keys(patch),
    });
    return null;
  },
  removeTestimonial: async (id) => {
    const previous = useSiteContentStore.getState().testimonialWall.find((t) => t.id === id);
    if (!previous) return null;
    useSiteContentStore.getState().removeTestimonial(id);
    const { error } = await supabase.from("og_testimonials").delete().eq("id", id);
    if (error) {
      useSiteContentStore.getState().addTestimonial(previous);
      logContentError("testimonials.delete", error.message);
      return error.message;
    }
    auditContent("content.deleted", id, `testimonial ${id}`, { kind: "testimonial" });
    return null;
  },

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

  // Templates  backed by og_custom_template_slots
  listTemplates: () => resolveCanonicalTemplates(useSiteContentStore.getState().customTemplates),
  addTemplate: async (input) => {
    useSiteContentStore.getState().addTemplate(input);
    const merged = getMergedTemplate(input.id) ?? input;
    const { error } = await supabase.from("og_custom_template_slots").upsert(templateAssetToRow(merged));
    if (error) {
      useSiteContentStore.getState().removeTemplate(input.id);
      logContentError("templates.upsert", error.message);
      return error.message;
    }
    auditContent("content.created", input.id, `template ${merged.name}`, { kind: "template" });
    return null;
  },
  updateTemplate: async (id, patch) => {
    const previous = getMergedTemplate(id);
    if (!previous) return "Template not found.";
    useSiteContentStore.getState().updateTemplate(id, patch);
    const merged = getMergedTemplate(id);
    if (!merged) {
      useSiteContentStore.getState().updateTemplate(id, previous);
      return "Template not found.";
    }
    const { error } = await supabase.from("og_custom_template_slots").upsert(templateAssetToRow(merged));
    if (error) {
      useSiteContentStore.getState().updateTemplate(id, previous);
      logContentError("templates.update", error.message);
      return error.message;
    }
    auditContent("content.updated", id, `template ${merged.name}`, { kind: "template", fields: Object.keys(patch) });
    return null;
  },
  removeTemplate: async (id) => {
    const previous = getMergedTemplate(id);
    if (!previous) return null;
    const canonical = isCanonicalTemplateId(id);
    useSiteContentStore.getState().removeTemplate(id);

    const { error } = canonical
      ? await supabase
          .from("og_custom_template_slots")
          .upsert(templateAssetToRow(getMergedTemplate(id) ?? { ...previous, isPublished: false }))
      : await supabase.from("og_custom_template_slots").delete().eq("id", id);

    if (error) {
      useSiteContentStore.getState().addTemplate(previous);
      logContentError("templates.delete", error.message);
      return error.message;
    }
    auditContent("content.deleted", id, `template ${id}`, { kind: "template", canonical });
    return null;
  },

  // Headwear options  backed by og_custom_headwear_options
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

  if (!templatesRes.error) {
    const persisted = (templatesRes.data ?? []).map((row) => templateRowToAsset(row));
    patch.customTemplates = resolveCanonicalTemplates(persisted);
  } else {
    logContentError("templates.hydrate", templatesRes.error.message);
  }

  if (Object.keys(patch).length > 0) {
    useSiteContentStore.setState(patch);
  }
}

/** Load landing, custom page copy, events, and custom CMS from Supabase. */
export async function hydrateSiteContentFromSupabase(): Promise<void> {
  await hydrateCustomContentFromSupabase();

  const [pagesPatch, spotlight, eventsRes, testimonialsRes] = await Promise.all([
    loadSiteCustomPages(),
    loadFeaturedSpotlight(),
    supabase.from("og_events").select("*").order("sort_order"),
    supabase.from("og_testimonials").select("*").order("sort_order"),
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

  if (!eventsRes.error) {
    const seedById = new Map(initialEvents.map((e) => [e.id, e]));
    storePatch.events = (eventsRes.data ?? []).map((row) => {
      const event = eventRowToSite(row as EventRow);
      const seed = seedById.get(event.id);
      if (seed && isLegacyPlaceholderImage(event.image)) {
        return { ...event, image: seed.image };
      }
      return event;
    });
  } else {
    logContentError("events.hydrate", eventsRes.error.message);
  }

  if (!testimonialsRes.error && (testimonialsRes.data?.length ?? 0) > 0) {
    storePatch.testimonialWall = testimonialsRes.data.map((row) =>
      testimonialRowToEntry(row as TestimonialRow),
    );
  } else if (testimonialsRes.error) {
    logContentError("testimonials.hydrate", testimonialsRes.error.message);
    storePatch.testimonialWall = useSiteContentStore.getState().testimonialWall.length
      ? useSiteContentStore.getState().testimonialWall
      : initialTestimonialWall;
  }

  if (Object.keys(storePatch).length > 0) {
    useSiteContentStore.setState(storePatch);
  }
}
