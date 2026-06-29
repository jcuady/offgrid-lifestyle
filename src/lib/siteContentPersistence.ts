import type { LandingContent } from "@/src/data/landingContent";
import type { CustomPageContent } from "@/src/data/customPageContent";
import type { Json } from "@/src/types/database";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/lib/supabase";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { usePortalStore } from "@/src/store/usePortalStore";

export type SiteCustomPageScope = "hub" | "order_hero" | "wizard" | "templates_page" | "landing";

const SPOTLIGHT_ID = "default";

function auditPagePersist(scope: SiteCustomPageScope): void {
  const actor = usePortalStore.getState().currentUser;
  if (!actor) return;

  usePortalStore.getState().recordAudit({
    action: "content.updated",
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    targetType: "content",
    targetId: scope,
    summary: `Updated ${scope.replace(/_/g, " ")} content`,
    metadata: { kind: "site_custom_page", scope },
  });
}

export async function persistCustomPageScope(
  scope: Exclude<SiteCustomPageScope, "landing">,
  content: unknown,
): Promise<void> {
  const { error } = await supabase.from("og_site_custom_pages").upsert({
    scope,
    content: content as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    logger.warn("Custom page persist failed", {
      service: "siteContentPersistence",
      operation: "persistCustomPageScope",
      scope,
      error: error.message,
    });
    return;
  }
  auditPagePersist(scope);
}

export async function persistLandingContent(content: LandingContent): Promise<void> {
  const { error } = await supabase.from("og_site_custom_pages").upsert({
    scope: "landing",
    content: content as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    logger.warn("Landing content persist failed", {
      service: "siteContentPersistence",
      operation: "persistLandingContent",
      error: error.message,
    });
    return;
  }
  auditPagePersist("landing");
}

export async function persistFeaturedSpotlight(
  spotlight: LandingContent["featuredSpotlight"],
): Promise<void> {
  const { error } = await supabase.from("og_site_featured_spotlight").upsert({
    id: SPOTLIGHT_ID,
    content: spotlight as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    logger.warn("Featured spotlight persist failed", {
      service: "siteContentPersistence",
      operation: "persistFeaturedSpotlight",
      error: error.message,
    });
  }
}

export async function loadSiteCustomPages(): Promise<Partial<CustomPageContent> & { landing?: LandingContent }> {
  const { data } = await supabase.from("og_site_custom_pages").select("scope, content");
  const patch: Partial<CustomPageContent> & { landing?: LandingContent } = {};

  for (const row of data ?? []) {
    const content = row.content as Record<string, unknown>;
    if (row.scope === "hub") patch.hub = content as unknown as CustomPageContent["hub"];
    if (row.scope === "order_hero") patch.orderHero = content as unknown as CustomPageContent["orderHero"];
    if (row.scope === "wizard") patch.wizard = content as unknown as CustomPageContent["wizard"];
    if (row.scope === "templates_page") patch.templatesPage = content as unknown as CustomPageContent["templatesPage"];
    if (row.scope === "landing") patch.landing = content as unknown as LandingContent;
  }

  return patch;
}

export async function loadFeaturedSpotlight(): Promise<LandingContent["featuredSpotlight"] | null> {
  const { data } = await supabase
    .from("og_site_featured_spotlight")
    .select("content")
    .eq("id", SPOTLIGHT_ID)
    .maybeSingle();
  if (!data?.content) return null;
  return data.content as unknown as LandingContent["featuredSpotlight"];
}

let landingPersistTimer: ReturnType<typeof setTimeout> | null = null;
let customPersistTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced persist for admin landing editor. */
export function schedulePersistLandingFromStore(): void {
  if (landingPersistTimer) clearTimeout(landingPersistTimer);
  landingPersistTimer = setTimeout(() => {
    const { landingContent } = useSiteContentStore.getState();
    void persistLandingContent(landingContent);
    void persistFeaturedSpotlight(landingContent.featuredSpotlight);
  }, 900);
}

/** Debounced persist for admin custom pages editor. */
export function schedulePersistCustomPagesFromStore(): void {
  if (customPersistTimer) clearTimeout(customPersistTimer);
  customPersistTimer = setTimeout(() => {
    const { customPageContent } = useSiteContentStore.getState();
    void persistCustomPageScope("hub", customPageContent.hub);
    void persistCustomPageScope("order_hero", customPageContent.orderHero);
    void persistCustomPageScope("wizard", customPageContent.wizard);
    void persistCustomPageScope("templates_page", customPageContent.templatesPage);
  }, 900);
}
