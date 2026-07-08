import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";

export interface TestimonialWallEntry {
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
  sortOrder: number;
}

export interface TestimonialsShowcaseTile {
  image: string;
  label: string;
}

export interface TestimonialsPageContent {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2Italic: string;
    description: string;
    backLabel: string;
  };
  showcase: {
    eyebrow: string;
    title: string;
    ctaLabel: string;
    ctaHref: string;
    tiles: TestimonialsShowcaseTile[];
  };
  wall: {
    featuredEyebrow: string;
    filterEyebrow: string;
    filterTitle: string;
    emptyMessage: string;
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
}

export const initialTestimonialsPageContent: TestimonialsPageContent = {
  hero: {
    eyebrow: "Testimonials",
    titleLine1: "Proof in the",
    titleLine2Italic: "play.",
    description:
      "Teams, athletes, and everyday wearers put OffGrid through real matches, long runs, and game days. Here is what they say about the fit, the finish, and the experience.",
    backLabel: "Back to home",
  },
  showcase: {
    eyebrow: "Real OG, in the wild",
    title: "Worn by the community",
    ctaLabel: "Shop the looks",
    ctaHref: "/shop",
    tiles: [
      { image: COMMUNITY_PHOTO_PATHS.ultimateCatch, label: "Community Play" },
      { image: COMMUNITY_PHOTO_PATHS.pilipinasPortrait, label: "OG Pilipinas" },
      { image: COMMUNITY_PHOTO_PATHS.pilipinasDuffel, label: "The Greatest x OG" },
      { image: COMMUNITY_PHOTO_PATHS.towelsWalk, label: "Custom Towels" },
      { image: COMMUNITY_PHOTO_PATHS.laces, label: "In Motion" },
    ],
  },
  wall: {
    featuredEyebrow: "Featured story",
    filterEyebrow: "What people say",
    filterTitle: "The full wall",
    emptyMessage: "No stories in this category yet — check back soon.",
  },
  cta: {
    eyebrow: "Your turn",
    title: "Ready to build yours?",
    description:
      "Start with templates and the ordering guide, then submit your custom request with full specs — or shop the lines the community is already wearing.",
    primaryLabel: "Start custom order",
    primaryHref: "/custom/order",
    secondaryLabel: "Shop now",
    secondaryHref: "/shop",
  },
};

export const initialTestimonialWall: TestimonialWallEntry[] = [
  {
    id: "tm-carlos-pickle",
    quote:
      "The custom team kit looked premium and held up in weekend matches. Breathability and fit were exactly what we asked for.",
    author: "Carlos Tolentino",
    handle: "@carlos.plays",
    location: "Quezon City",
    tag: "Pickleball",
    outcome: "Team reorder after first batch",
    image: COMMUNITY_PHOTO_PATHS.ultimateCatch,
    featured: true,
    rating: 5,
    published: true,
    sortOrder: 0,
  },
  {
    id: "tm-camille-fairway",
    quote:
      "The Fairway Tee is lightweight but still feels substantial. It worked for both course play and casual wear after game day.",
    author: "Camille Reyes",
    handle: "@cam.onthefairway",
    location: "BGC, Taguig",
    tag: "Golf",
    outcome: "Higher event-day sell-through",
    image: COMMUNITY_PHOTO_PATHS.pilipinasPortrait,
    featured: false,
    rating: 5,
    published: true,
    sortOrder: 1,
  },
  {
    id: "tm-enzo-lifestyle",
    quote:
      "OG Pilipinas pieces gave us a clean athletic look without feeling generic. The design process was simple and fast.",
    author: "Enzo Dela Cruz",
    handle: "@enzo.dc",
    location: "Makati",
    tag: "Lifestyle",
    outcome: "Repeat custom inquiry in 2 weeks",
    image: COMMUNITY_PHOTO_PATHS.ogBackpack,
    featured: false,
    rating: 5,
    published: true,
    sortOrder: 2,
  },
  {
    id: "tm-jeri-running",
    quote:
      "From template download to order submission, the flow was straightforward. No confusion, and sizing recommendations were accurate.",
    author: "Jeri Lim",
    handle: "@jeri.runs",
    location: "Pasig",
    tag: "Running",
    outcome: "Zero size-exchange issues",
    image: COMMUNITY_PHOTO_PATHS.laces,
    featured: false,
    rating: 5,
    published: true,
    sortOrder: 3,
  },
  {
    id: "tm-maya-bulk",
    quote:
      "As a team manager, I liked that statuses were transparent and delivery expectations were clear. It felt reliable from day one.",
    author: "Maya Santos",
    handle: "@maya.teamops",
    location: "Cebu",
    tag: "Team Orders",
    outcome: "Scaled from 30 to 90 pcs",
    image: COMMUNITY_PHOTO_PATHS.pilipinasDuffel,
    featured: false,
    rating: 5,
    published: true,
    sortOrder: 4,
  },
  {
    id: "tm-paolo-events",
    quote:
      "The product quality and brand storytelling helped us present better at events. Customers noticed the premium vibe immediately.",
    author: "Paolo Navarro",
    handle: "@paolo.events",
    location: "Davao",
    tag: "Events",
    outcome: "Stronger booth conversion",
    image: COMMUNITY_PHOTO_PATHS.towelsWalk,
    featured: false,
    rating: 5,
    published: true,
    sortOrder: 5,
  },
];
