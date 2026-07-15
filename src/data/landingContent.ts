/** Fixed homepage slots — admins may replace text/images only (no add/move/reorder). */

import { COMMUNITY_COLLECTIONS, COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import {
  initialTestimonialsPageContent,
  type TestimonialsPageContent,
} from "@/src/data/testimonialsPage";

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
  | "gallery"
  | "event"
  | "social"
  | "teamCommunity"
  | "faq"
  | "cta";

export type LandingTypography = Record<LandingTypographySectionKey, CmsSectionTypography>;

/** Shop-by-sport tiles on the homepage (frisbee is featured). */
export type LandingCollectionId = "frisbee" | "pickleball" | "golf" | "running";

export interface LandingHeroContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  /** Supporting paragraph below the hero title. */
  description: string;
  locality: string;
  /** Optional loop video; when empty, `imageSrc` is used. */
  videoSrc: string;
  /** Sports still — preferred hero media when video is empty or fails. */
  imageSrc: string;
  ctaShopLabel: string;
  ctaShopHref: string;
  ctaExploreLabel: string;
  ctaExploreHref: string;
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
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  /** Supporting line under the closing headline */
  priceFallback: string;
  contactEmail: string;
  contactLinkLabel: string;
  contactHref: string;
  localityLine: string;
  ctaShop: string;
  ctaShopHref: string;
  ctaStory: string;
  ctaStoryHref: string;
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
  metaLine: string;
  teams: [LandingTeamChipContent, LandingTeamChipContent, LandingTeamChipContent, LandingTeamChipContent];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
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

export interface LandingGalleryTile {
  image: string;
  alt: string;
  label: string;
  tag: string;
  variant: "feature" | "tile";
}

export interface LandingGalleryContent {
  eyebrow: string;
  titleLine1: string;
  titleLine2Italic: string;
  caption: string;
  footnote: string;
  ctaLabel: string;
  ctaHref: string;
  tiles: LandingGalleryTile[];
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
  ctaHref: string;
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
export const LANDING_GALLERY_TILE_COUNT = 5;
export const LANDING_FAQ_COUNT = 5;

export const emptyLandingTypography = (): LandingTypography => ({
  hero: {},
  collections: {},
  bestSellers: {},
  gallery: {},
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
  gallery: LandingGalleryContent;
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
  testimonialsPage: TestimonialsPageContent;
  typography: LandingTypography;
}

export const FEATURED_SPOTLIGHT_SLOT_COUNT = 3;

const emptyFeaturedSlot = (): FeaturedSpotlightSlot => ({ productId: "", imageOverride: "" });

export const initialFeaturedSpotlightContent: LandingFeaturedSpotlightContent = {
  eyebrow: "Promo of the month",
  titleLine1: "Ultimate",
  titleLine2Italic: "frisbee.",
  subtitle: "Our top-selling retail — Discfest-proven kits. Shop the drop teams keep reordering.",
  ctaLabel: "Shop the ultimate line",
  ctaHref: "/shop?category=Ultimate Frisbee",
  layout: "bento",
  source: "best_sellers",
  slots: [emptyFeaturedSlot(), emptyFeaturedSlot(), emptyFeaturedSlot()],
  showOnHome: true,
  showOnShop: true,
};

export const LANDING_HERO_VIDEO_DEFAULT =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const initialGalleryTiles = (): LandingGalleryTile[] =>
  COMMUNITY_COLLECTIONS.map((item) => ({
    image: item.image,
    alt: item.alt,
    label: item.label,
    tag: item.tag,
    variant: item.layout === "feature" ? "feature" : "tile",
  }));

export const LANDING_COLLECTION_IDS: LandingCollectionId[] = [
  "frisbee",
  "pickleball",
  "golf",
  "running",
];

export const initialLandingContent: LandingContent = {
  hero: {
    badge: "Filipino sportswear · Built for play",
    titleLine1: "OFFGRID®",
    titleLine2: "LIFESTYLE",
    tagline: "Play different. Live OFFGRID.",
    description: "Sportswear for ultimate frisbee, pickleball, golf, and running — plus custom team kits.",
    locality: "EST. MANILA, PH",
    videoSrc: "",
    imageSrc: COMMUNITY_PHOTO_PATHS.ultimateCatch,
    ctaShopLabel: "Shop Ultimate Line",
    ctaShopHref: "/shop?category=Ultimate Frisbee",
    ctaExploreLabel: "Shop By Sport",
    ctaExploreHref: "/#collections",
    statItemsSoldLabel: "Items Sold",
    statCollectionsLabel: "Sports",
    statLocalityLine: "EST. MANILA, PH",
    statLocalitySub: "Proudly Pinoy",
  },
  collectionsHeader: {
    eyebrow: "Shop By Sport",
    titleLine1: "Pick your",
    titleLine2Italic: "game.",
    caption: "Fewer lines. Clearer focus. Ultimate frisbee first — our top-selling retail.",
  },
  collections: [
    {
      id: "frisbee",
      title: "Ultimate Frisbee",
      subtitle: "Top seller · Discfest ready",
      image: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
      tag: "Featured",
      shopCategory: "Ultimate Frisbee",
    },
    {
      id: "pickleball",
      title: "Pickleball",
      subtitle: "One line. Court + lifestyle.",
      image: "/images/collection-pickleball.png",
      tag: "Merged line",
      shopCategory: "Pickleball",
    },
    {
      id: "golf",
      title: "Golf",
      subtitle: "Fairway fits.",
      image: "/images/collection-golf.png",
      tag: "Course",
      shopCategory: "Golf",
    },
    {
      id: "running",
      title: "Running",
      subtitle: "Stride ready.",
      image: "/images/collection-pilipinas.png",
      tag: "In motion",
      shopCategory: "Running",
    },
  ],
  collectionsViewAllLabel: "View all sports",
  bestSellersHeader: {
    eyebrow: "Retail",
    titleLine1: "Shop what",
    titleLine2Italic: "moves.",
    caption: "Ultimate frisbee, pickleball, golf, and running — ready to ship.",
  },
  bestSellersShopLink: "Open the shop",
  gallery: {
    eyebrow: "Community",
    titleLine1: "On the field.",
    titleLine2Italic: "In the kit.",
    caption: "Discfest, pickle, and race days — sportswear tested where it matters.",
    footnote: "Discfest · Pickle · Running · Golf",
    ctaLabel: "See community & events",
    ctaHref: "/community",
    tiles: initialGalleryTiles(),
  },
  brandStory: {
    eyebrow: "Who we are",
    titleLine1: "Sportswear for",
    titleLine2Italic: "how you play.",
    titleLine3: "",
    paragraph1:
      "OFFGRID makes Filipino sportswear for athletes and teams — ultimate frisbee first, then pickleball, golf, and running.",
    paragraph2: "Retail drops for everyday play. Custom kits when your squad needs a full run.",
    paragraph3Prefix: "",
    paragraph3Highlight: "",
    closingQuote: "",
    image: COMMUNITY_PHOTO_PATHS.ultimateField,
    badgeEst: "EST.",
    badgeLocality: "MANILA, PH",
    badgeGritty: "Gritty",
    badgeInMotion: "In Motion",
    badgeProudlyPinoy: "Proudly Pinoy",
  },
  event: {
    badge: "Community",
    titleLine1: "Play together.",
    titleLine2Italic: "Show up in kit.",
    description:
      "Events, gatherings, and team days — where OFFGRID meets the community. Browse upcoming and past sessions below.",
    backgroundImage: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
    imageCaption: "Discfest · Courts · Courses · Runs",
    date: "",
    countdownTime: "",
    location: "",
    category: "",
    ctaPrimary: "See upcoming events",
    ctaSecondary: "Start a team order",
  },
  socialHeader: {
    eyebrow: "Testimonials",
    titleLine1: "From the",
    titleLine2Italic: "field.",
    caption: "Teams and athletes on fit, finish, and game-day wear.",
  },
  ugcTiles: [
    { image: COMMUNITY_PHOTO_PATHS.ultimateCatch, label: "Community Play" },
    { image: COMMUNITY_PHOTO_PATHS.pilipinasPortrait, label: "OG Pilipinas" },
    { image: COMMUNITY_PHOTO_PATHS.pilipinasDuffel, label: "The Greatest x OG" },
    { image: COMMUNITY_PHOTO_PATHS.towelsWalk, label: "Custom Towels" },
    { image: COMMUNITY_PHOTO_PATHS.laces, label: "In Motion" },
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
    badge: "Community",
    headlineLine1: "Teams. Events.",
    headlineLine2Italic: "Same kit energy.",
    metaLine: "EST. MANILA, PH · ULTIMATE FRISBEE · PICKLEBALL · GOLF · RUNNING",
    teams: [
      { name: "Discfest squads", sport: "Ultimate Frisbee" },
      { name: "Manila Smash", sport: "Pickleball" },
      { name: "Fairway Co.", sport: "Golf" },
      { name: "Takbo MNL", sport: "Running" },
    ],
    primaryCtaLabel: "Community & events",
    primaryCtaHref: "/community",
    secondaryCtaLabel: "Kit my team",
    secondaryCtaHref: "/custom/order",
    socialHeading: "Follow OFFGRID",
    instagramUrl: "https://www.instagram.com/offgridlifestyle.ph/",
    facebookUrl: "https://www.facebook.com/offgridlifestyleph/",
  },
  faq: {
    eyebrow: "FAQ",
    titleLine1: "Quick",
    titleLine2Italic: "answers.",
    caption: "Orders, artwork, and custom team kits.",
    ctaLabel: "Full ordering guide",
    ctaHref: "/custom#faqs",
    items: [
      {
        question: "What is the minimum order quantity?",
        answer:
          "Tops and bottoms minimum is 10 pieces per design. You can mix shirt types within that 10-piece run — tank tops, short sleeves, long sleeves, and sun hoodies.",
      },
      {
        question: "What file format should I submit?",
        answer:
          "Place your design in OFFGRID templates, then send the final file as Adobe Illustrator (.AI) in CMYK for production.",
      },
      {
        question: "What if I don't use Illustrator?",
        answer:
          "Send any file format and an OFFGRID rep will help get it production-ready.",
      },
      {
        question: "Can OFFGRID help with design?",
        answer:
          "Yes — design help is free. Share concept, colors, logos, and references.",
      },
      {
        question: "How do I give design direction?",
        answer:
          "Send pegs and sample looks. More context = faster match to your direction.",
      },
    ],
  },
  cta: {
    eyebrow: "Next step",
    titleLine1: "READY TO",
    titleLine2: "PLAY?",
    priceFallback: "Shop retail or kit your team.",
    contactEmail: "hello@offgridlifestyle.ph",
    contactLinkLabel: "Send a message",
    contactHref: "/contact",
    localityLine: "Est. Manila, PH · 14.5995° N, 120.9842° E",
    ctaShop: "Grab the ultimate drop",
    ctaShopHref: "/shop?category=Ultimate Frisbee",
    ctaStory: "Kit my team",
    ctaStoryHref: "/custom/order",
    trustShipping: "Free shipping ₱2,000+",
    trustReturns: "14-day returns",
    trustShips: "Ships nationwide",
    trustCheckout: "Secure checkout",
  },
  footer: {
    taglineLine1: "Play different. Live OFFGRID.",
    taglineLine2: "Made for Filipino athletes and teams.",
    copyright: "© 2026 OFFGRID Lifestyle. All rights reserved.",
  },
  featuredSpotlight: initialFeaturedSpotlightContent,
  testimonialsPage: initialTestimonialsPageContent,
  typography: emptyLandingTypography(),
};
