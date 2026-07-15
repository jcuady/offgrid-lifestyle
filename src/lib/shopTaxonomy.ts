/** Storefront shop IA — sport vs named collection filters. */

export type ShopTaxonomyLink = {
  label: string;
  category: string;
  href: string;
  description: string;
};

function shopCategoryHref(category: string) {
  return `/shop?category=${encodeURIComponent(category)}`;
}

/** Shop by sport — primary retail focus. Ultimate Frisbee is the featured top seller. */
export const SHOP_BY_SPORT: ShopTaxonomyLink[] = [
  {
    label: "Ultimate Frisbee",
    category: "Ultimate Frisbee",
    href: shopCategoryHref("Ultimate Frisbee"),
    description: "Discfest-proven kits — our top-selling retail line.",
  },
  {
    label: "Pickleball",
    category: "Pickleball",
    href: shopCategoryHref("Pickleball"),
    description: "One pickleball line for court and lifestyle.",
  },
  {
    label: "Golf",
    category: "Golf",
    href: shopCategoryHref("Golf"),
    description: "Fairway polos built to move.",
  },
  {
    label: "Running",
    category: "Running",
    href: shopCategoryHref("Running"),
    description: "Stride-ready singles and long sleeves.",
  },
];

/** Shop by collection — named drops (not separate sport silos). */
export const SHOP_BY_COLLECTION: ShopTaxonomyLink[] = [
  {
    label: "Discfest",
    category: "Ultimate Frisbee",
    href: shopCategoryHref("Ultimate Frisbee"),
    description: "Event exclusive ultimate frisbee retail — Voyager, Stats, Arcade, Comet.",
  },
  {
    label: "Solar",
    category: "Solar Collection",
    href: shopCategoryHref("Solar Collection"),
    description: "Sun-ready sleeveless, short sleeve, and long sleeve.",
  },
  {
    label: "Primal",
    category: "Primal Collection",
    href: shopCategoryHref("Primal Collection"),
    description: "Performance drifit across cuts.",
  },
  {
    label: "OG Vibe",
    category: "Lifestyle / OG Vibe",
    href: shopCategoryHref("Lifestyle / OG Vibe"),
    description: "Everyday lifestyle tees.",
  },
];
