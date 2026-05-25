/** Fixed homepage slots — admins may replace text/images only (no add/move/reorder). */

export type LandingCollectionId = "pickleball" | "golf" | "og-pilipinas" | "everyday";

export interface LandingHeroContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  locality: string;
  ctaShopLabel: string;
  ctaExploreLabel: string;
  statItemsSoldLabel: string;
  statCollectionsLabel: string;
  statLocalityLine: string;
  statLocalitySub: string;
}

export interface LandingSectionHeaderContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  caption: string;
}

export interface LandingCollectionCardContent {
  id: LandingCollectionId;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  /** Fixed shop filter — not editable in CMS */
  shopCategory: string;
}

export interface LandingBrandStoryContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  titleLine3: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3Prefix: string;
  paragraph3Highlight: string;
  closingQuote: string;
  image: string;
  badgeEst: string;
  badgeLocality: string;
  badgeGritty: string;
  badgeInMotion: string;
  badgeProudlyPinoy: string;
}

export interface LandingUgcTileContent {
  image: string;
  /** Empty string = no overlay label on tile */
  label: string;
}

export interface LandingTestimonialSlotContent {
  quote: string;
  author: string;
  handle: string;
  location: string;
  tag: string;
}

export interface LandingEventSpotlightContent {
  badge: string;
  titleLine1: string;
  titleLine2Italic: string;
  description: string;
  backgroundImage: string;
  /** Display + countdown source, e.g. "15 Jun" */
  date: string;
  /** Countdown target time suffix, e.g. "09:00:00" */
  countdownTime: string;
  location: string;
  category: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface LandingCtaContent {
  titleLine1: string;
  titleLine2: string;
  /** Used when product catalog is empty */
  priceFallback: string;
  ctaShop: string;
  ctaStory: string;
  trustShipping: string;
  trustReturns: string;
  trustShips: string;
  trustCheckout: string;
}

export interface LandingFooterContent {
  taglineLine1: string;
  taglineLine2: string;
  copyright: string;
}

/** Fixed-length arrays — length is enforced by CMS UI, not by add/remove controls. */
export const LANDING_COLLECTION_COUNT = 4;
export const LANDING_UGC_COUNT = 5;
export const LANDING_TESTIMONIAL_COUNT = 3;

export interface LandingContent {
  hero: LandingHeroContent;
  collectionsHeader: LandingSectionHeaderContent;
  collections: LandingCollectionCardContent[];
  bestSellersHeader: LandingSectionHeaderContent;
  bestSellersShopLink: string;
  brandStory: LandingBrandStoryContent;
  event: LandingEventSpotlightContent;
  socialHeader: LandingSectionHeaderContent;
  ugcTiles: LandingUgcTileContent[];
  testimonials: LandingTestimonialSlotContent[];
  testimonialsViewAll: string;
  cta: LandingCtaContent;
  footer: LandingFooterContent;
}

export const LANDING_COLLECTION_IDS: LandingCollectionId[] = [
  "pickleball",
  "golf",
  "og-pilipinas",
  "everyday",
];

export const initialLandingContent: LandingContent = {
  hero: {
    badge: "When Comfort Meets Movement",
    titleLine1: "OFF GRID®",
    titleLine2: "LIFESTYLE",
    tagline: "Play Different. Live Off Grid.",
    locality: "EST. MANILA, PH",
    ctaShopLabel: "Shop Collection",
    ctaExploreLabel: "Explore Sports",
    statItemsSoldLabel: "Items Sold",
    statCollectionsLabel: "Collections",
    statLocalityLine: "EST. MANILA, PH",
    statLocalitySub: "Proudly Pinoy",
  },
  collectionsHeader: {
    eyebrow: "Featured Collections",
    titleLine1: "Pick Your",
    titleLine2Italic: "Sport.",
    caption: "Four collections. One lifestyle. Built for those who play different.",
  },
  collections: [
    {
      id: "pickleball",
      title: "Pickleball",
      subtitle: "Dink. Rally. Repeat.",
      image: "/images/collection_pickleball.png",
      tag: "New Drop",
      shopCategory: "Pickleball",
    },
    {
      id: "golf",
      title: "Golf",
      subtitle: "Fairways & Fresh Fits.",
      image: "/images/collection_golf.png",
      tag: "Best Seller",
      shopCategory: "Golf",
    },
    {
      id: "og-pilipinas",
      title: "OG Pilipinas",
      subtitle: "Rep the Nation.",
      image: "/images/collection_pilipinas.png",
      tag: "PH Limited",
      shopCategory: "Running",
    },
    {
      id: "everyday",
      title: "Everyday Wear",
      subtitle: "Move. Rest. Repeat.",
      image: "/images/collection_everyday.png",
      tag: "Staples",
      shopCategory: "Lifestyle / OG Vibe",
    },
  ],
  bestSellersHeader: {
    eyebrow: "Best Sellers",
    titleLine1: "The Crowd",
    titleLine2Italic: "Favorites.",
    caption: "",
  },
  bestSellersShopLink: "Shop full catalog",
  brandStory: {
    eyebrow: "Our story",
    titleLine1: "We don't just",
    titleLine2Italic: "play the game.",
    titleLine3: "We live it.",
    paragraph1: "OffGrid is for those who move differently — on and off the court.",
    paragraph2:
      "Born in the Philippines, shaped by the players who refuse to fit the mold. Whether you're dinking on the pickleball court, dropping putts at sunrise, or just living your most expressive life — this is your uniform.",
    paragraph3Prefix: "Hindi kami brand lang.",
    paragraph3Highlight: "Kultura kami.",
    closingQuote: "Play Different. Live Off Grid.",
    image: "/images/brand_story.png",
    badgeEst: "EST.",
    badgeLocality: "MANILA, PH",
    badgeGritty: "Gritty",
    badgeInMotion: "In Motion",
    badgeProudlyPinoy: "Proudly Pinoy",
  },
  event: {
    badge: "Featured Community Event",
    titleLine1: "Figaro Barako",
    titleLine2Italic: "Cup Pickleball",
    description:
      "Join the OffGrid community at our flagship pickleball tournament. Premium gear, good coffee, and great rallies.",
    backgroundImage: "/images/event_barako.png",
    date: "15 Jun",
    countdownTime: "09:00:00",
    location: "Manila",
    category: "Pickleball",
    ctaPrimary: "Join the Movement →",
    ctaSecondary: "Event Details",
  },
  socialHeader: {
    eyebrow: "The Community",
    titleLine1: "Off Grid.",
    titleLine2Italic: "On Point.",
    caption: "",
  },
  ugcTiles: [
    { image: "/images/ugc_1.png", label: "🎾 @carlos.plays" },
    { image: "/images/ugc_2.png", label: "" },
    { image: "/images/ugc_3.png", label: "⛳️ Team Fit" },
    { image: "/images/ugc_4.png", label: "👟 Everyday" },
    { image: "/images/ugc_5.png", label: "🇵🇭 OG Pilipinas" },
  ],
  testimonials: [
    {
      quote:
        "The custom team kit looked premium and held up in weekend matches. Breathability and fit were exactly what we asked for.",
      author: "Carlos Tolentino",
      handle: "@carlos.plays",
      location: "Quezon City",
      tag: "Pickleball",
    },
    {
      quote:
        "The Fairway Tee is lightweight but still feels substantial. It worked for both course play and casual wear after game day.",
      author: "Camille Reyes",
      handle: "@cam.onthefairway",
      location: "BGC, Taguig",
      tag: "Golf",
    },
    {
      quote:
        "OG Pilipinas pieces gave us a clean athletic look without feeling generic. The design process was simple and fast.",
      author: "Enzo Dela Cruz",
      handle: "@enzo.dc",
      location: "Makati",
      tag: "Lifestyle",
    },
  ],
  testimonialsViewAll: "View all testimonials",
  cta: {
    titleLine1: "READY TO GO",
    titleLine2: "OFF GRID?",
    priceFallback: "Premium pieces for athletes who play different.",
    ctaShop: "Shop Now",
    ctaStory: "Our Story",
    trustShipping: "Free shipping ₱2,000+",
    trustReturns: "14-day returns",
    trustShips: "Ships nationwide",
    trustCheckout: "Secure checkout",
  },
  footer: {
    taglineLine1: "Play Different. Live Off Grid.",
    taglineLine2: "Proudly made for Filipino athletes.",
    copyright: "© 2026 OffGrid Lifestyle. All rights reserved.",
  },
};
