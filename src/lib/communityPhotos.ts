/** Curated OG lifestyle photography (compressed from Materials shoot). */
export const COMMUNITY_PHOTO_PATHS = {
  ultimateSkyball: "/images/community/community-ultimate-skyball.jpg",
  ultimateCatch: "/images/community/community-ultimate-catch.jpg",
  ultimateField: "/images/community/community-ultimate-field.jpg",
  pilipinasPortrait: "/images/community/community-pilipinas-portrait.jpg",
  pilipinasCap: "/images/community/community-pilipinas-cap.jpg",
  laces: "/images/community/community-laces.jpg",
  towelsWalk: "/images/community/community-towels-walk.jpg",
  ogBackpack: "/images/community/product-og-backpack.jpg",
  pilipinasDuffel: "/images/community/product-pilipinas-duffel.jpg",
  towelFlag: "/images/community/product-towel-flag.jpg",
  towelBench: "/images/community/product-towel-bench.jpg",
} as const;

/** Focus-rail stories for the homepage community section — real Materials shoot photos. */
export const COMMUNITY_FOCUS_RAIL = [
  {
    id: "discfest",
    title: "Discfest 2025",
    description: "Ultimate frisbee event energy — skyballs, squads, and OFFGRID kit on the field.",
    meta: "Event · Ultimate",
    imageSrc: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
    href: "/community",
  },
  {
    id: "ultimate-catch",
    title: "Catch & cut",
    description: "Game-day sports moments from OFFGRID teams that show up ready.",
    meta: "Sport · Ultimate",
    imageSrc: COMMUNITY_PHOTO_PATHS.ultimateCatch,
    href: "/community",
  },
  {
    id: "mixed-masters",
    title: "Mixed Masters",
    description: "Fundraiser weekends and Pilipinas pride — events that build the roster.",
    meta: "Event · Community",
    imageSrc: COMMUNITY_PHOTO_PATHS.pilipinasPortrait,
    href: "/community",
  },
  {
    id: "pickle-project",
    title: "Court sessions",
    description: "Pickleball and multi-sport days — where kits meet real play.",
    meta: "Sport · Pickleball",
    imageSrc: COMMUNITY_PHOTO_PATHS.pilipinasCap,
    href: "/community",
  },
  {
    id: "field-walk",
    title: "Sideline kit",
    description: "Towels, packs, and gear that travel from event to everyday.",
    meta: "Events · Gear",
    imageSrc: COMMUNITY_PHOTO_PATHS.towelsWalk,
    href: "/community",
  },
] as const;

/** Materials folders highlighted in the community & events band. */
export const COMMUNITY_COLLECTIONS = [
  {
    id: "discfest",
    label: "Discfest 2025",
    tag: "Ultimate",
    image: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
    alt: "OFFGRID community at Discfest 2025",
    layout: "feature",
  },
  {
    id: "mixed-masters",
    label: "Mixed Masters",
    tag: "Fundraiser",
    image: COMMUNITY_PHOTO_PATHS.pilipinasPortrait,
    alt: "Mixed Masters community fundraiser",
    layout: "tile",
  },
  {
    id: "greatest-og",
    label: "The Greatest x OG",
    tag: "Collab",
    image: COMMUNITY_PHOTO_PATHS.ogBackpack,
    alt: "The Greatest x OFFGRID collaboration",
    layout: "tile",
  },
  {
    id: "towels",
    label: "OG Lifestyle Towels",
    tag: "Custom Gear",
    image: COMMUNITY_PHOTO_PATHS.towelsWalk,
    alt: "OG Lifestyle custom towels on the field",
    layout: "tile",
  },
  {
    id: "pickle",
    label: "Pickle Project",
    tag: "Pickleball",
    image: COMMUNITY_PHOTO_PATHS.pilipinasCap,
    alt: "Pickle Project community on the court",
    layout: "tile",
  },
] as const;

/** Stock placeholders and legacy seed art — swap for real community photography. */
export function isLegacyPlaceholderImage(src: string | undefined): boolean {
  if (!src) return true;
  return (
    src.includes("unsplash.com") ||
    src.startsWith("/images/ugc") ||
    src === "/images/brand-story-editorial.jpg" ||
    src === "/images/brand-story.jpg" ||
    src === "/images/brand_story.png" ||
    src === "/images/event-community.png"
  );
}
