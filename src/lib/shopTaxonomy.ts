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

function shopCollectionHref(slug: string) {
  return `/shop?collection=${encodeURIComponent(slug)}`;
}

/** Shop by sport — primary retail focus. Ultimate Frisbee is the featured top seller. */
export const SHOP_BY_SPORT: ShopTaxonomyLink[] = [
  {
    label: "Ultimate Frisbee",
    category: "Ultimate Frisbee",
    href: shopCategoryHref("Ultimate Frisbee"),
    description: "National team and tournament kits — our top-selling retail line.",
  },
  {
    label: "Gym & Training",
    category: "Gym & Training",
    href: shopCategoryHref("Gym & Training"),
    description: "Primal Power and Solar Rise performance activewear.",
  },
  {
    label: "Running",
    category: "Running",
    href: shopCategoryHref("Running"),
    description: "Stride-ready singles and long sleeves.",
  },
  {
    label: "Pickleball",
    category: "Pickleball",
    href: shopCategoryHref("Pickleball"),
    description: "Club graphics and Salmon Smasher performance activewear.",
  },
  {
    label: "Golf",
    category: "Golf",
    href: shopCategoryHref("Golf"),
    description: "Fairway polos built to move.",
  },
  {
    label: "Lifestyle",
    category: "Lifestyle",
    href: shopCategoryHref("Lifestyle"),
    description: "Everyday street tees, motoline jerseys, and headwear.",
  },
];

/** Named OFFGRID collections used by the homepage, navigation, and `/collections` hub. */
export const SHOP_BY_COLLECTION: ShopTaxonomyLink[] = [
  {
    label: "Pilipinas National Team",
    category: "pilipinas",
    href: shopCollectionHref("pilipinas"),
    description:
      "Official Pilipinas National Team tournament jerseys engineered for international ultimate frisbee competition.",
  },
  {
    label: "Primal Power Line",
    category: "primal",
    href: shopCollectionHref("primal"),
    description:
      "Heavy-duty performance activewear and drifit essentials built for intense gym training sessions.",
  },
  {
    label: "Solar Rise Line",
    category: "solar",
    href: shopCollectionHref("solar"),
    description:
      "Lightweight, breathable sun-ready drifit activewear engineered for heat and endurance.",
  },
  {
    label: "Running Performance",
    category: "running",
    href: shopCollectionHref("running"),
    description: "Aerodynamic singles and long sleeves built for marathoners and everyday runners.",
  },
  {
    label: "Motoline Collection",
    category: "motoline",
    href: shopCollectionHref("motoline"),
    description: "Off-road and moto-inspired performance lifestyle jerseys built for speed and grit.",
  },
  {
    label: "The OG Vibe Lifestyle",
    category: "the-og-vibe",
    href: shopCollectionHref("the-og-vibe"),
    description: "Everyday streetwear and graphic tees crafted for comfort beyond the court.",
  },
  {
    label: "Pickleball Club",
    category: "pickleball",
    href: shopCollectionHref("pickleball"),
    description:
      "Complete court collection featuring lifestyle graphic tees and Salmon Smasher performance activewear.",
  },
  {
    label: "Golf Series",
    category: "golf",
    href: shopCollectionHref("golf"),
    description: "Engineered fairway polos combining technical stretch with modern course aesthetics.",
  },
  {
    label: "Headwear & Accessories",
    category: "accessories",
    href: shopCollectionHref("accessories"),
    description: "Essential caps and ultra-absorbent microfiber towels engineered for all athletes.",
  },
];
