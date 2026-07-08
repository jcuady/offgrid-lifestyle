import type { LandingContent } from "@/src/data/landingContent";
import { initialLandingContent } from "@/src/data/landingContent";

function mergeTypography(
  base: LandingContent["typography"],
  patch: LandingContent["typography"] | undefined,
): LandingContent["typography"] {
  if (!patch) return base;
  const keys = Object.keys(base) as (keyof LandingContent["typography"])[];
  const merged = { ...base };
  for (const key of keys) {
    merged[key] = { ...base[key], ...(patch[key] ?? {}) };
  }
  return merged;
}

/** Deep-merge persisted landing JSON with current defaults (new CMS fields). */
export function normalizeLandingContent(partial?: Partial<LandingContent> | null): LandingContent {
  const base = initialLandingContent;
  if (!partial) return base;

  const legacyTeam = partial.teamCommunity as
    | (Partial<LandingContent["teamCommunity"]> & {
        headlinePart1?: string;
        headlinePart2?: string;
        headlinePart3?: string;
      })
    | undefined;
  const teamCommunity = {
    ...base.teamCommunity,
    ...partial.teamCommunity,
    headlineLine1:
      partial.teamCommunity?.headlineLine1 ??
      (legacyTeam?.headlinePart1
        ? `${legacyTeam.headlinePart1} ${legacyTeam.headlinePart2 ?? ""}`.trim()
        : base.teamCommunity.headlineLine1),
    headlineLine2Italic:
      partial.teamCommunity?.headlineLine2Italic ??
      legacyTeam?.headlinePart3 ??
      base.teamCommunity.headlineLine2Italic,
    teams: base.teamCommunity.teams.map((team, index) => ({
      ...team,
      ...(partial.teamCommunity?.teams?.[index] ?? {}),
    })) as LandingContent["teamCommunity"]["teams"],
  };

  return {
    ...base,
    ...partial,
    hero: { ...base.hero, ...partial.hero },
    collectionsHeader: { ...base.collectionsHeader, ...partial.collectionsHeader },
    collections: base.collections.map((card, index) => ({
      ...card,
      ...(partial.collections?.[index] ?? {}),
      id: card.id,
      shopCategory: card.shopCategory,
    })),
    bestSellersHeader: { ...base.bestSellersHeader, ...partial.bestSellersHeader },
    bestSellersShopLink: partial.bestSellersShopLink ?? base.bestSellersShopLink,
    benefits: {
      ...base.benefits,
      ...partial.benefits,
      items: base.benefits.items.map((item, index) => ({
        ...item,
        ...(partial.benefits?.items?.[index] ?? {}),
      })) as LandingContent["benefits"]["items"],
    },
    collectionsViewAllLabel: partial.collectionsViewAllLabel ?? base.collectionsViewAllLabel,
    brandStory: { ...base.brandStory, ...partial.brandStory },
    event: { ...base.event, ...partial.event },
    socialHeader: { ...base.socialHeader, ...partial.socialHeader },
    ugcTiles: base.ugcTiles.map((tile, index) => ({
      ...tile,
      ...(partial.ugcTiles?.[index] ?? {}),
    })),
    testimonials: base.testimonials.map((entry, index) => ({
      ...entry,
      ...(partial.testimonials?.[index] ?? {}),
    })),
    testimonialsViewAll: partial.testimonialsViewAll ?? base.testimonialsViewAll,
    faq: {
      ...base.faq,
      ...partial.faq,
      items: base.faq.items.map((item, index) => ({
        ...item,
        ...(partial.faq?.items?.[index] ?? {}),
      })) as LandingContent["faq"]["items"],
    },
    cta: { ...base.cta, ...partial.cta },
    footer: { ...base.footer, ...partial.footer },
    featuredSpotlight: {
      ...base.featuredSpotlight,
      ...partial.featuredSpotlight,
      slots: base.featuredSpotlight.slots.map((slot, index) => ({
        ...slot,
        ...(partial.featuredSpotlight?.slots?.[index] ?? {}),
      })) as LandingContent["featuredSpotlight"]["slots"],
    },
    teamCommunity,
    typography: mergeTypography(base.typography, partial.typography),
  };
}
