/** Fixed homepage slots — admins may replace text/images only (no add/move/reorder). */

export type CmsTextSize = "" | "sm" | "md" | "lg" | "xl";

export interface CmsSectionTypography {
  headingColor?: string;
  headingSize?: CmsTextSize;
  bodyColor?: string;
  bodySize?: CmsTextSize;
}

export type LandingTypographySectionKey =
  | "hero"
  | "collections"
  | "bestSellers"
  | "benefits"
  | "event"
  | "social"
  | "teamCommunity"
  | "faq"
  | "cta";

export type LandingTypography = Record<LandingTypographySectionKey, CmsSectionTypography>;

export type LandingCollectionId = "pickleball" | "golf" | "og-pilipinas" | "everyday";

export interface LandingHeroContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  /** Supporting paragraph below the hero title. */
  description: string;
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
  /** Mono caption under the image — general, not event-specific */
  imageCaption: string;
  /** Legacy CMS fields — not shown on the general community/events band */
  date: string;
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

export interface LandingTeamChipContent {
  name: string;
  sport: string;
}

export interface LandingTeamCommunityContent {
  badge: string;
  headlineLine1: string;
  headlineLine2Italic: string;
  teams: [LandingTeamChipContent, LandingTeamChipContent, LandingTeamChipContent, LandingTeamChipContent];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  socialHeading: string;
  instagramUrl: string;
  facebookUrl: string;
}

/** Featured spotlight band on homepage and /shop. */
export type FeaturedSpotlightLayout = "bento" | "hero";
export type FeaturedSpotlightSource = "best_sellers" | "manual";

export interface FeaturedSpotlightSlot {
  /** Product id from catalog; empty = image-only tile (manual campaigns). */
  productId: string;
  /** When set, replaces the product image on the storefront tile. */
  imageOverride: string;
}

export interface LandingBenefitItem {
  title: string;
  description: string;
}

export interface LandingBenefitsContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  items: [LandingBenefitItem, LandingBenefitItem, LandingBenefitItem, LandingBenefitItem];
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingFaqContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  caption: string;
  ctaLabel: string;
  items: [LandingFaqItem, LandingFaqItem, LandingFaqItem, LandingFaqItem, LandingFaqItem];
}

export interface LandingFeaturedSpotlightContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  /** `hero` = one full-width banner (Linya-Linya style). `bento` = 1 large + 2 small tiles. */
  layout: FeaturedSpotlightLayout;
  /** `best_sellers` = Crowd Favorites rank from Products. `manual` = slots below. */
  source: FeaturedSpotlightSource;
  slots: [FeaturedSpotlightSlot, FeaturedSpotlightSlot, FeaturedSpotlightSlot];
  showOnHome: boolean;
  showOnShop: boolean;
}

/** Fixed-length arrays — length is enforced by CMS UI, not by add/remove controls. */
export const LANDING_COLLECTION_COUNT = 4;
export const LANDING_UGC_COUNT = 5;
export const LANDING_TESTIMONIAL_COUNT = 3;
export const LANDING_TEAM_CHIP_COUNT = 4;
export const LANDING_BENEFIT_COUNT = 4;
export const LANDING_FAQ_COUNT = 5;

export const emptyLandingTypography = (): LandingTypography => ({
  hero: {},
  collections: {},
  bestSellers: {},
  benefits: {},
  event: {},
  social: {},
  teamCommunity: {},
  faq: {},
  cta: {},
});

export interface LandingContent {
  hero: LandingHeroContent;
  collectionsHeader: LandingSectionHeaderContent;
  collections: LandingCollectionCardContent[];
  collectionsViewAllLabel: string;
  bestSellersHeader: LandingSectionHeaderContent;
  bestSellersShopLink: string;
  benefits: LandingBenefitsContent;
  brandStory: LandingBrandStoryContent;
  event: LandingEventSpotlightContent;
  socialHeader: LandingSectionHeaderContent;
  ugcTiles: LandingUgcTileContent[];
  testimonials: LandingTestimonialSlotContent[];
  testimonialsViewAll: string;
  teamCommunity: LandingTeamCommunityContent;
  faq: LandingFaqContent;
  cta: LandingCtaContent;
  footer: LandingFooterContent;
  featuredSpotlight: LandingFeaturedSpotlightContent;
  typography: LandingTypography;
}

export const FEATURED_SPOTLIGHT_SLOT_COUNT = 3;

const emptyFeaturedSlot = (): FeaturedSpotlightSlot => ({ productId: "", imageOverride: "" });

export const initialFeaturedSpotlightContent: LandingFeaturedSpotlightContent = {
  eyebrow: "Featured",
  titleLine1: "Crowd",
  titleLine2Italic: "favorites.",
  subtitle: "Hand-picked drops the community keeps coming back to. Shop the pieces defining the season.",
  ctaLabel: "Shop all featured",
  ctaHref: "/shop",
  layout: "bento",
  source: "best_sellers",
  slots: [emptyFeaturedSlot(), emptyFeaturedSlot(), emptyFeaturedSlot()],
  showOnHome: true,
  showOnShop: true,
};

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
    description:
      "Premium Filipino sportswear engineered for movement — on the court, on the course, and everywhere off the grid.",
    locality: "EST. MANILA, PH",
    ctaShopLabel: "Shop Collection",
    ctaExploreLabel: "Explore Sports",
    statItemsSoldLabel: "Items Sold",
    statCollectionsLabel: "OG Signatures",
    statLocalityLine: "EST. MANILA, PH",
    statLocalitySub: "Proudly Pinoy",
  },
  collectionsHeader: {
    eyebrow: "OG Signatures",
    titleLine1: "Find Your",
    titleLine2Italic: "Movement.",
    caption: "One lifestyle. Thoughtfully designed for every way you move.",
  },
  collections: [
    {
      id: "pickleball",
      title: "Pickleball",
      subtitle: "Dink. Rally. Repeat.",
      image: "/images/collection-pickleball.png",
      tag: "Court Ready",
      shopCategory: "Pickleball",
    },
    {
      id: "golf",
      title: "Golf",
      subtitle: "Fairways & Fresh Fits.",
      image: "/images/collection-golf.png",
      tag: "Course Classics",
      shopCategory: "Golf",
    },
    {
      id: "og-pilipinas",
      title: "Running",
      subtitle: "Stride With Purpose.",
      image: "/images/collection-pilipinas.png",
      tag: "In Motion",
      shopCategory: "Running",
    },
    {
      id: "everyday",
      title: "Everyday Wear",
      subtitle: "Move. Rest. Repeat.",
      image: "/images/collection-everyday.jpg",
      tag: "OG Vibe",
      shopCategory: "Lifestyle / OG Vibe",
    },
  ],
  collectionsViewAllLabel: "View all OG Signatures",
  bestSellersHeader: {
    eyebrow: "The Full Collection",
    titleLine1: "A complete expression of",
    titleLine2Italic: "Off Grid Lifestyle.",
    caption:
      "Thoughtfully designed pieces inspired by sport, shaped by culture, and made for everyday movement.",
  },
  bestSellersShopLink: "Shop full catalog",
  benefits: {
    eyebrow: "Why Off Grid",
    titleLine1: "Built for athletes.",
    titleLine2Italic: "Made for everyday.",
    items: [
      {
        title: "Premium fabric & fit",
        description:
          "Engineered for movement on court, course, and street — breathable, durable, and cut for real athletes.",
      },
      {
        title: "Custom team orders",
        description:
          "From concept to delivery, we make it easy for teams to design, order, and rep gear that feels uniquely theirs.",
      },
      {
        title: "Filipino craft",
        description:
          "Designed in Manila with local athletes in mind — proudly Pinoy sportswear built for how we play and live.",
      },
      {
        title: "Versatile lifestyle",
        description:
          "Pieces that transition from competition to everyday wear without losing comfort, style, or performance.",
      },
    ],
  },
  brandStory: {
    eyebrow: "Our Story",
    titleLine1: "Where Comfort",
    titleLine2Italic: "Meets Movement.",
    titleLine3: "",
    paragraph1:
      "Off Grid Lifestyle was founded on the belief that the things we wear should move with us. Through everyday routines, quiet moments, and everything in between.",
    paragraph2:
      "From thoughtfully curated collections to pieces made uniquely yours, we create apparel designed with comfort, versatility, and craftsmanship at its core.",
    paragraph3Prefix: "Because style isn't reserved for special occasions.",
    paragraph3Highlight: "It's found in the way we live, move, and make things our own.",
    closingQuote: "",
    image: "/images/community/product-og-backpack.jpg",
    badgeEst: "EST.",
    badgeLocality: "MANILA, PH",
    badgeGritty: "Gritty",
    badgeInMotion: "In Motion",
    badgeProudlyPinoy: "Proudly Pinoy",
  },
  event: {
    badge: "Community & Events",
    titleLine1: "More Than a Brand.",
    titleLine2Italic: "A shared space for connection.",
    description:
      "Off Grid Lifestyle exists beyond clothing. Through gatherings and shared experiences, we create space for people to connect, move, and belong.",
    backgroundImage: "/images/community/community-ultimate-skyball.jpg",
    imageCaption: "Gritty · In motion · Product-focused",
    date: "",
    countdownTime: "",
    location: "",
    category: "",
    ctaPrimary: "Explore Events",
    ctaSecondary: "View Community",
  },
  socialHeader: {
    eyebrow: "Testimonials",
    titleLine1: "Crafted with",
    titleLine2Italic: "Intention.",
    caption:
      "Off Grid Lifestyle is built on consistency and care. From custom pieces to everyday essentials, each experience reflects quality, clarity, and craftsmanship.",
  },
  ugcTiles: [
    { image: "/images/community/community-ultimate-catch.jpg", label: "Community Play" },
    { image: "/images/community/community-pilipinas-portrait.jpg", label: "OG Pilipinas" },
    { image: "/images/community/product-pilipinas-duffel.jpg", label: "The Greatest x OG" },
    { image: "/images/community/community-towels-walk.jpg", label: "Custom Towels" },
    { image: "/images/community/community-laces.jpg", label: "In Motion" },
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
  teamCommunity: {
    badge: "Our Community",
    headlineLine1: "Built for teams.",
    headlineLine2Italic: "Powered by connection.",
    teams: [
      { name: "Manila Smash", sport: "Pickleball" },
      { name: "Fairway Co.", sport: "Golf" },
      { name: "Takbo MNL", sport: "Running" },
      { name: "Barangay Ball", sport: "Basketball" },
    ],
    primaryCtaLabel: "View events",
    secondaryCtaLabel: "Start a team order",
    socialHeading: "Follow the movement",
    instagramUrl: "https://www.instagram.com/offgridlifestyle.ph/",
    facebookUrl: "https://www.facebook.com/offgridlifestyleph/",
  },
  faq: {
    eyebrow: "FAQ",
    titleLine1: "Questions",
    titleLine2Italic: "answered.",
    caption: "Quick answers on orders, artwork, and custom design support.",
    ctaLabel: "View full ordering guide",
    items: [
      {
        question: "What is the minimum order quantity?",
        answer:
          "Tops and bottoms minimum is 10 pieces per design. You can mix shirt types within that 10-piece run — tank tops, short sleeves, long sleeves, and sun hoodies.",
      },
      {
        question: "What file format should I submit?",
        answer:
          "Place your design in OffGrid templates, then send the final file as Adobe Illustrator (.AI) in CMYK color mode for clean production output.",
      },
      {
        question: "What if I don't use Illustrator?",
        answer:
          "You can still send any file format and an OffGrid rep will guide you through preparation so your artwork is production-ready.",
      },
      {
        question: "Can OffGrid help with design?",
        answer:
          "Design assistance is free. Share your concept, colors, logos, references, and team style so we can build a production-ready layout faster.",
      },
      {
        question: "How do I give design direction?",
        answer:
          "Review sample team looks from our channels and include pegs in your brief. The more context you share, the faster we match your direction.",
      },
    ],
  },
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
  featuredSpotlight: initialFeaturedSpotlightContent,
  typography: emptyLandingTypography(),
};
