import type { LandingContent } from "@/src/data/landingContent";
import { initialLandingContent, LANDING_HERO_VIDEO_DEFAULT } from "@/src/data/landingContent";
import { isLegacyPlaceholderImage } from "@/src/lib/communityPhotos";

function mergeTypography(
  base: LandingContent["typography"],
  patch: LandingContent["typography"] | undefined,
  legacyPatch?: { benefits?: LandingContent["typography"]["gallery"] },
): LandingContent["typography"] {
  if (!patch && !legacyPatch?.benefits) return base;
  const keys = Object.keys(base) as (keyof LandingContent["typography"])[];
  const merged = { ...base };
  for (const key of keys) {
    merged[key] = { ...base[key], ...(patch?.[key] ?? {}) };
  }
  if (legacyPatch?.benefits) {
    merged.gallery = { ...base.gallery, ...legacyPatch.benefits, ...merged.gallery };
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
    hero: {
      ...base.hero,
      ...partial.hero,
      // Prefer sports still; clear legacy default video so the still shows.
      imageSrc: partial.hero?.imageSrc?.trim() || base.hero.imageSrc,
      videoSrc: (() => {
        const next = partial.hero?.videoSrc ?? base.hero.videoSrc;
        if (!next?.trim() || next === LANDING_HERO_VIDEO_DEFAULT) return "";
        return next;
      })(),
    },
    collectionsHeader: { ...base.collectionsHeader, ...partial.collectionsHeader },
    collections: base.collections.map((card, index) => ({
      ...card,
      ...(partial.collections?.[index] ?? {}),
      id: card.id,
      shopCategory: card.shopCategory,
    })),
    bestSellersHeader: { ...base.bestSellersHeader, ...partial.bestSellersHeader },
    bestSellersShopLink: partial.bestSellersShopLink ?? base.bestSellersShopLink,
    gallery: (() => {
      const legacyBenefits = partial.benefits as
        | { eyebrow?: string; titleLine1?: string; titleLine2Italic?: string }
        | undefined;
      const gallery = partial.gallery;
      return {
        ...base.gallery,
        ...gallery,
        eyebrow: gallery?.eyebrow ?? legacyBenefits?.eyebrow ?? base.gallery.eyebrow,
        titleLine1: gallery?.titleLine1 ?? legacyBenefits?.titleLine1 ?? base.gallery.titleLine1,
        titleLine2Italic:
          gallery?.titleLine2Italic ?? legacyBenefits?.titleLine2Italic ?? base.gallery.titleLine2Italic,
        caption: gallery?.caption ?? base.gallery.caption,
        footnote: gallery?.footnote ?? base.gallery.footnote,
        ctaLabel: gallery?.ctaLabel ?? base.gallery.ctaLabel,
        ctaHref: gallery?.ctaHref ?? base.gallery.ctaHref,
        tiles: base.gallery.tiles.map((tile, index) => {
          const persisted = gallery?.tiles?.[index];
          return {
            ...tile,
            ...(persisted ?? {}),
            image: isLegacyPlaceholderImage(persisted?.image)
              ? tile.image
              : (persisted?.image ?? tile.image),
          };
        }),
      };
    })(),
    collectionsViewAllLabel: partial.collectionsViewAllLabel ?? base.collectionsViewAllLabel,
    brandStory: {
      ...base.brandStory,
      ...partial.brandStory,
      image: isLegacyPlaceholderImage(partial.brandStory?.image)
        ? base.brandStory.image
        : (partial.brandStory?.image ?? base.brandStory.image),
    },
    event: {
      ...base.event,
      ...partial.event,
      backgroundImage: isLegacyPlaceholderImage(partial.event?.backgroundImage)
        ? base.event.backgroundImage
        : (partial.event?.backgroundImage ?? base.event.backgroundImage),
    },
    socialHeader: { ...base.socialHeader, ...partial.socialHeader },
    ugcTiles: base.ugcTiles.map((tile, index) => {
      const persisted = partial.ugcTiles?.[index];
      return {
        ...tile,
        ...(persisted ?? {}),
        image: isLegacyPlaceholderImage(persisted?.image)
          ? tile.image
          : (persisted?.image ?? tile.image),
      };
    }),
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
    testimonialsPage: {
      ...base.testimonialsPage,
      ...partial.testimonialsPage,
      hero: { ...base.testimonialsPage.hero, ...partial.testimonialsPage?.hero },
      showcase: {
        ...base.testimonialsPage.showcase,
        ...partial.testimonialsPage?.showcase,
        tiles: base.testimonialsPage.showcase.tiles.map((tile, index) => ({
          ...tile,
          ...(partial.testimonialsPage?.showcase?.tiles?.[index] ?? {}),
        })),
      },
      wall: { ...base.testimonialsPage.wall, ...partial.testimonialsPage?.wall },
      cta: { ...base.testimonialsPage.cta, ...partial.testimonialsPage?.cta },
    },
    teamCommunity,
    typography: mergeTypography(
      base.typography,
      partial.typography,
      partial.typography as { benefits?: LandingContent["typography"]["gallery"] } | undefined,
    ),
  };
}
