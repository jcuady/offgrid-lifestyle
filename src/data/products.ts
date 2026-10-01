/** Apparel size label. Presets live in `SIZE_PRESETS`; custom values (e.g. YOUTH-10) are allowed. */
export type SizeCode = string;

export type GarmentCut =
  | "long_sleeve"
  | "short_sleeve"
  | "sleeveless"
  | "polo"
  | "tank"
  | "shorts"
  | "cap"
  | "hoodie";

export type FabricType =
  | "dri_fit"
  | "cotton"
  | "running_mesh"
  | "drifit_polyester"
  | "poly_blend"
  | "nylon_spandex";

export interface ProductVariant {
  sku: string;
  designName: string;
  colorPrimary?: string;
  colorSecondary?: string;
  fabricOption?: FabricType;
  priceOverride?: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface ProductColor {
  name: string;
  value: string;
  variantSku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Merchandising category/collection; sport navigation uses `sports`. */
  category: string;
  /** A product may appear under more than one admin-managed sport. */
  sports?: string[];
  collectionIds?: string[];
  /** Regular/list price. */
  basePrice: number;
  /** Current selling price; lower than basePrice when discounted. */
  price: number;
  image: string;
  gallery?: string[];
  colors: ProductColor[];
  sizes: SizeCode[];
  sizeRange?: string;
  description: string;
  shortDescription?: string;
  material: string;
  fabricType: FabricType;
  cut: GarmentCut;
  fit?: string;
  variants?: ProductVariant[];
  sold: number;
  stock?: number;
  /** Legacy primary badge retained while older database rows migrate. */
  tag?: string;
  /** Storefront badges and promo filters; first item is the primary badge. */
  tags?: string[];
  /** 1 = first in homepage Crowd Favorites; omit or 0 to exclude from that strip. */
  homeBestSellerRank?: number;
  status: "draft" | "active" | "archived";
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

function genVariant(
  slug: string,
  cutCode: string,
  fabCode: string,
  colorRaw: string,
  imageUrl?: string,
): ProductVariant {
  const designName = colorRaw.trim();
  const designCode = designName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return {
    sku: `OG-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${cutCode}-${fabCode}-${designCode}`,
    designName,
    isActive: true,
    imageUrl,
  };
}

export const products: Product[] = [
  // ==========================================
  // ULTIMATE FRISBEE / PILIPINAS COLLECTION
  // ==========================================
  {
    id: "pilipinas-aouc-jersey",
    slug: "pilipinas-aouc-jersey-2025",
    name: "PILIPINAS AOUC JERSEY 2025",
    category: "Pilipinas Collection",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["pilipinas"],
    basePrice: 1000,
    price: 1000,
    image: "/images/products/pilipinas-aouc-capiz.webp",
    gallery: [
      "/images/products/pilipinas-aouc-capiz.webp",
      "/images/products/pilipinas-aouc-lilim.webp",
      "/images/products/pilipinas-aouc-piloncitos.webp",
    ],
    colors: [
      { name: "Capiz", value: "bg-[#E6DEC8]", variantSku: "OG-PILIPINAS-AOUC-SS-DRF-CAPIZ" },
      { name: "Lilim", value: "bg-[#1E293B]", variantSku: "OG-PILIPINAS-AOUC-SS-DRF-LILIM" },
      { name: "Piloncitos", value: "bg-[#D97706]", variantSku: "OG-PILIPINAS-AOUC-SS-DRF-PILONCITOS" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "Official Pilipinas AOUC 2025 National Team Jersey. Full sublimation dryfit activewear engineered for international ultimate tournament play.",
    shortDescription: "Pilipinas AOUC 2025 National Team Jersey · 2XS–5XL.",
    status: "active",
    sold: 145,
    tag: "Best Seller",
    tags: ["Best Seller", "Pilipinas", "National Team"],
    homeBestSellerRank: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pilipinas-aouc", "SS", "DRF", "Capiz", "/images/products/pilipinas-aouc-capiz.webp"),
      genVariant("pilipinas-aouc", "SS", "DRF", "Lilim", "/images/products/pilipinas-aouc-lilim.webp"),
      genVariant("pilipinas-aouc", "SS", "DRF", "Piloncitos", "/images/products/pilipinas-aouc-piloncitos.webp"),
    ],
  },
  {
    id: "pilipinas-ultimate-jersey",
    slug: "pilipinas-ultimate-jersey",
    name: "PILIPINAS ULTIMATE TEAM JERSEY",
    category: "Pilipinas Collection",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["pilipinas"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/pilipinas-ultimate-blue.webp",
    gallery: [
      "/images/products/pilipinas-ultimate-blue.webp",
      "/images/products/pilipinas-ultimate-white.webp",
    ],
    colors: [
      { name: "National Blue", value: "bg-blue-700", variantSku: "OG-PILIPINAS-ULTIMATE-SS-DRF-NATIONALBLUE" },
      { name: "National White", value: "bg-white", variantSku: "OG-PILIPINAS-ULTIMATE-SS-DRF-NATIONALWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester",
    description:
      "Pilipinas Ultimate Team Jersey featuring national heraldry and high-breathability performance mesh.",
    shortDescription: "Pilipinas Ultimate Jersey in Blue & White.",
    status: "active",
    sold: 88,
    tag: "Pilipinas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pilipinas-ultimate", "SS", "DRF", "National Blue", "/images/products/pilipinas-ultimate-blue.webp"),
      genVariant("pilipinas-ultimate", "SS", "DRF", "National White", "/images/products/pilipinas-ultimate-white.webp"),
    ],
  },
  {
    id: "og-padayon-jersey",
    slug: "og-padayon-jersey",
    name: "PADAYON PILIPINAS JERSEY",
    category: "Pilipinas Collection",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["pilipinas"],
    basePrice: 1200,
    price: 1200,
    image: "/images/products/pilipinas-padayon-jersey.webp",
    gallery: [
      "/images/products/pilipinas-padayon-jersey.webp",
      "/images/community/community-pilipinas-portrait.jpg",
      "/images/community/community-pilipinas-cap.jpg",
    ],
    colors: [
      { name: "Pilipinas Gold & Sun", value: "bg-[#FFD700]", variantSku: "OG-PADAYON-TK-DRF-GOLDSUN" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    sizeRange: "2XS–4XL",
    cut: "tank",
    fabricType: "dri_fit",
    material: "Full Sublimation Dryfit (Customizable number)",
    description:
      "Padayon Pilipinas sleeveless jersey with Baybayin script accents, Philippine Sun details, and customizable back player number.",
    shortDescription: "Padayon sleeveless national jersey with customizable number.",
    status: "active",
    sold: 112,
    tag: "Pilipinas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("padayon", "TK", "DRF", "Gold Sun", "/images/products/pilipinas-padayon-jersey.webp"),
    ],
  },

  // ==========================================
  // RUNNING
  // ==========================================
  {
    id: "running-line",
    slug: "running-performance-line",
    name: "RUNNING PERFORMANCE LINE 2.0",
    category: "Running",
    sports: ["Running"],
    collectionIds: ["running"],
    basePrice: 900,
    price: 900,
    image: "/images/products/running-performance-cover.webp",
    gallery: [
      "/images/products/running-performance-cover.webp",
      "/images/products/running-classic-black.webp",
      "/images/products/running-flow-state-blue.webp",
      "/images/products/running-purpose-green.webp",
      "/images/products/running-catch-me-cream.webp",
      "/images/products/running-stride-club-gray.webp",
    ],
    colors: [
      { name: "OFFGRID Classic (Black)", value: "bg-offgrid-dark", variantSku: "OG-RUNNING-LINE-SS-DRF-OFFGRIDCLASSICBLACK" },
      { name: "The Flow State (Blue)", value: "bg-blue-600", variantSku: "OG-RUNNING-LINE-SS-DRF-THEFLOWSTATEBLUE" },
      { name: "Run With Purpose (Green)", value: "bg-offgrid-green", variantSku: "OG-RUNNING-LINE-SS-DRF-RUNWITHPURPOSEGREEN" },
      { name: "Catch Me If You Can (Cream)", value: "bg-offgrid-cream", variantSku: "OG-RUNNING-LINE-SS-DRF-CATCHMEIFYOUCANCREAM" },
      { name: "The Stride Club (Dark Gray)", value: "bg-gray-700", variantSku: "OG-RUNNING-LINE-SS-DRF-THESTRIDECLUBDARKGRAY" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Running Mesh / Drifit",
    description:
      "Running Performance Line 2.0 — built for daily miles and tempo runs with featherweight moisture-wicking comfort.",
    shortDescription: "Running performance graphic tees.",
    status: "active",
    sold: 320,
    tag: "Top Rated",
    homeBestSellerRank: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("running-line", "SS", "DRF", "OFFGRID Classic Black", "/images/products/running-classic-black.webp"),
      genVariant("running-line", "SS", "DRF", "The Flow State Blue", "/images/products/running-flow-state-blue.webp"),
      genVariant("running-line", "SS", "DRF", "Run With Purpose Green", "/images/products/running-purpose-green.webp"),
      genVariant("running-line", "SS", "DRF", "Catch Me If You Can Cream", "/images/products/running-catch-me-cream.webp"),
      genVariant("running-line", "SS", "DRF", "The Stride Club Dark Gray", "/images/products/running-stride-club-gray.webp"),
    ],
  },
  {
    id: "og-stride-running",
    slug: "og-stride-collection",
    name: "OFF GRID STRIDE COLLECTION",
    category: "Running",
    sports: ["Running"],
    collectionIds: ["running"],
    basePrice: 1000,
    price: 1000,
    image: "/images/products/stride-running-banner.webp",
    gallery: [
      "/images/products/stride-running-banner.webp",
      "/images/products/stride-running-promo.webp",
      "/images/products/stride-running-grid.webp",
      "/images/products/stride-running-detail.webp",
    ],
    colors: [
      { name: "White-Teal", value: "bg-teal-400", variantSku: "OG-STRIDE-SS-RUN-WHITETEAL" },
      { name: "White-Pink", value: "bg-pink-400", variantSku: "OG-STRIDE-SS-RUN-WHITEPINK" },
      { name: "White-Neon Green", value: "bg-lime-400", variantSku: "OG-STRIDE-SS-RUN-WHITENEONGREEN" },
      { name: "White-Orange", value: "bg-orange-400", variantSku: "OG-STRIDE-SS-RUN-WHITEORANGE" },
      { name: "Black-Teal", value: "bg-teal-700", variantSku: "OG-STRIDE-SS-RUN-BLACKTEAL" },
      { name: "Black-Pink", value: "bg-pink-700", variantSku: "OG-STRIDE-SS-RUN-BLACKPINK" },
      { name: "Black-Neon Green", value: "bg-lime-600", variantSku: "OG-STRIDE-SS-RUN-BLACKNEONGREEN" },
      { name: "Pink-Teal", value: "bg-fuchsia-600", variantSku: "OG-STRIDE-SS-RUN-PINKTEAL" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "running_mesh",
    material: "Breathable Running Poly",
    description:
      "OFF GRID Stride Collection — high-visibility dual-tone colorways engineered for chasing PRs from morning intervals to night runs.",
    shortDescription: "Chasing PR dual-tone running shirts.",
    status: "active",
    sold: 195,
    tag: "Running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("stride", "SS", "RUN", "White-Teal", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "White-Pink", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "White-Neon Green", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "White-Orange", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "Black-Teal", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "Black-Pink", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "Black-Neon Green", "/images/products/stride-running-grid.webp"),
      genVariant("stride", "SS", "RUN", "Pink-Teal", "/images/products/stride-running-grid.webp"),
    ],
  },

  // ==========================================
  // LIFESTYLE (Includes MOTOLINE)
  // ==========================================
  {
    id: "og-motoline",
    slug: "motoline",
    name: "OFF GRID LIFESTYLE — MOTOLINE",
    category: "Lifestyle / Motoline",
    sports: ["Lifestyle"],
    collectionIds: ["motoline"],
    basePrice: 650,
    price: 650,
    image: "/images/products/motoline-cover.webp",
    gallery: [
      "/images/products/motoline-cover.webp",
      "/images/products/motoline-full-throttle.webp",
      "/images/products/motoline-takbong-og.webp",
      "/images/products/motoline-stay-offgrid.webp",
      "/images/products/motoline-takbong-pogi.webp",
    ],
    colors: [
      { name: "FULL THROTTLE LIFE", value: "bg-offgrid-dark", variantSku: "OG-MOTOLINE-LS-DRF-FULLTHROTTLELIFE" },
      { name: "TAKBONG OG", value: "bg-offgrid-green", variantSku: "OG-MOTOLINE-LS-DRF-TAKBONGOG" },
      { name: "STAY OFFGRID", value: "bg-offgrid-lime", variantSku: "OG-MOTOLINE-LS-DRF-STAYOFFGRID" },
      { name: "TAKBONG POGI MODE", value: "bg-offgrid-cream", variantSku: "OG-MOTOLINE-LS-DRF-TAKBONGPOGIMODE" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    sizeRange: "XS–4XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Premium Drifit",
    description:
      "MOTOLINE long-sleeve lifestyle & moto kit — gritty street and road runs with iconic Filipino rider catchphrases in OFFGRID colorways.",
    shortDescription: "Long sleeve drifit lifestyle moto gear.",
    status: "active",
    sold: 154,
    tag: "Trending",
    homeBestSellerRank: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("motoline", "LS", "DRF", "FULL THROTTLE LIFE", "/images/products/motoline-full-throttle.webp"),
      genVariant("motoline", "LS", "DRF", "TAKBONG OG", "/images/products/motoline-takbong-og.webp"),
      genVariant("motoline", "LS", "DRF", "STAY OFFGRID", "/images/products/motoline-stay-offgrid.webp"),
      genVariant("motoline", "LS", "DRF", "TAKBONG POGI MODE", "/images/products/motoline-takbong-pogi.webp"),
    ],
  },
  {
    id: "the-og-vibe-collection",
    slug: "the-og-vibe-collection",
    name: "THE OG VIBE STREETWEAR TEE",
    category: "Lifestyle / OG Vibe",
    sports: ["Lifestyle"],
    collectionIds: ["the-og-vibe"],
    basePrice: 850,
    price: 850,
    image: "/images/products/og-vibe-photoshoot-banner.webp",
    gallery: [
      "/images/products/og-vibe-photoshoot-banner.webp",
      "/images/products/og-vibe-steampunk-black.webp",
      "/images/products/og-vibe-blossom-black.webp",
      "/images/products/og-vibe-steampunk-cream.webp",
      "/images/products/og-vibe-blossom-cream.webp",
      "/images/products/og-vibe-model-front.webp",
      "/images/products/og-vibe-model-back.webp",
    ],
    colors: [
      { name: "Black Steampunk", value: "bg-black", variantSku: "OG-THE-OG-VIBE-COLLECTION-SS-COT-BLACKSTEAMPUNK" },
      { name: "Black Blossom", value: "bg-neutral-900", variantSku: "OG-THE-OG-VIBE-COLLECTION-SS-COT-BLACKBLOSSOM" },
      { name: "Cream Steampunk", value: "bg-[#F5F2EB]", variantSku: "OG-THE-OG-VIBE-COLLECTION-SS-COT-CREAMSTEAMPUNK" },
      { name: "Cream Blossom", value: "bg-offgrid-cream", variantSku: "OG-THE-OG-VIBE-COLLECTION-SS-COT-CREAMBLOSSOM" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    sizeRange: "S–2XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Heavyweight Cotton Streetwear",
    description:
      "Lifestyle streetwear for everyday athletes. Heavyweight cotton with premium screen-printed OG Steampunk and Blossom graphics.",
    shortDescription: "Heavyweight cotton streetwear tee.",
    status: "active",
    sold: 430,
    tag: "Lifestyle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("the-og-vibe-collection", "SS", "COT", "Black Steampunk", "/images/products/og-vibe-steampunk-black.webp"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Black Blossom", "/images/products/og-vibe-blossom-black.webp"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Cream Steampunk", "/images/products/og-vibe-steampunk-cream.webp"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Cream Blossom", "/images/products/og-vibe-blossom-cream.webp"),
    ],
  },
  {
    id: "og-momentum-caps",
    slug: "og-momentum-caps",
    name: "OFF GRID MOMENTUM ATHLETIC CAP",
    category: "Headwear & Accessories",
    sports: ["Lifestyle"],
    collectionIds: ["accessories"],
    basePrice: 950,
    price: 950,
    image: "/images/products/momentum-cap-cover.webp",
    gallery: [
      "/images/products/momentum-cap-cover.webp",
      "/images/products/momentum-cap-dark-blue.webp",
      "/images/products/momentum-cap-black.webp",
      "/images/products/momentum-cap-white.webp",
      "/images/products/momentum-cap-sky-blue.webp",
      "/images/products/momentum-cap-pink.webp",
    ],
    colors: [
      { name: "Dark Blue", value: "bg-blue-900", variantSku: "OG-MOMENTUM-CAPS-CP-PLY-DARKBLUE" },
      { name: "Black", value: "bg-black", variantSku: "OG-MOMENTUM-CAPS-CP-PLY-BLACK" },
      { name: "White", value: "bg-white", variantSku: "OG-MOMENTUM-CAPS-CP-PLY-WHITE" },
      { name: "Sky Blue", value: "bg-sky-400", variantSku: "OG-MOMENTUM-CAPS-CP-PLY-SKYBLUE" },
      { name: "Pink", value: "bg-pink-400", variantSku: "OG-MOMENTUM-CAPS-CP-PLY-PINK" },
    ],
    sizes: ["One Size"],
    sizeRange: "One Size (Adjustable strap)",
    cut: "cap",
    fabricType: "poly_blend",
    material: "Structured Breathable Twill",
    description:
      "OFF GRID Lifestyle Momentum Caps — structured crown with moisture-managing sweatband and adjustable fit for sun protection and style.",
    shortDescription: "Breathable athletic cap with adjustable strap.",
    status: "active",
    sold: 70,
    tag: "Headwear",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("momentum-caps", "CP", "PLY", "Dark Blue", "/images/products/momentum-cap-dark-blue.webp"),
      genVariant("momentum-caps", "CP", "PLY", "Black", "/images/products/momentum-cap-black.webp"),
      genVariant("momentum-caps", "CP", "PLY", "White", "/images/products/momentum-cap-white.webp"),
      genVariant("momentum-caps", "CP", "PLY", "Sky Blue", "/images/products/momentum-cap-sky-blue.webp"),
      genVariant("momentum-caps", "CP", "PLY", "Pink", "/images/products/momentum-cap-pink.webp"),
    ],
  },
  {
    id: "og-microfiber-towel",
    slug: "og-microfiber-towel",
    name: "OFF GRID MICROFIBER PERFORMANCE TOWEL",
    category: "Accessories",
    sports: ["Lifestyle"],
    collectionIds: ["accessories"],
    basePrice: 650,
    price: 650,
    image: "/images/products/towel-microfiber-promo.webp",
    gallery: [
      "/images/products/towel-microfiber-promo.webp",
      "/images/products/towel-microfiber-progress.webp",
      "/images/products/towel-microfiber-hand-spec.webp",
      "/images/products/towel-microfiber-detail.webp",
      "/images/products/towel-microfiber-flatlay.webp",
    ],
    colors: [
      { name: "OFFGRID Lime / Field Black", value: "bg-offgrid-green", variantSku: "OG-MICROFIBER-TOWEL-AC-MCF-HAND35X75" },
    ],
    sizes: ["Face (30x30)", "Hand (35x75)", "Bath (140x70)"],
    sizeRange: "Face, Hand, Bath sizes",
    cut: "shorts",
    fabricType: "poly_blend",
    material: "Microfiber Blend (Polyester/Polyamide)",
    description:
      "Ultra-compact quick-drying microfiber performance towel. Dual-texture functionality: smooth high-definition printed face with high-absorption back loop.",
    shortDescription: "Quick-drying printed microfiber sports towel.",
    status: "active",
    sold: 160,
    tag: "Lifestyle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("microfiber-towel", "AC", "MCF", "Face 30x30", "/images/products/towel-microfiber-progress.webp"),
      genVariant("microfiber-towel", "AC", "MCF", "Hand 35x75", "/images/products/towel-microfiber-hand-spec.webp"),
      genVariant("microfiber-towel", "AC", "MCF", "Bath 140x70", "/images/products/towel-microfiber-flatlay.webp"),
    ],
  },

  // ==========================================
  // GYM & TRAINING — PRIMAL POWER
  // ==========================================
  {
    id: "og-primal-sleeveless",
    slug: "og-primal-sleeveless",
    name: "OG PRIMAL POWER — SLEEVELESS TANK",
    category: "Primal Collection",
    sports: ["Gym & Training"],
    collectionIds: ["primal"],
    basePrice: 900,
    price: 900,
    image: "/images/products/primal-sleeveless-black-green.webp",
    gallery: [
      "/images/products/primal-sleeveless-black-green.webp",
      "/images/products/primal-sleeveless-blue-ivory.webp",
      "/images/products/primal-sleeveless-green-pink.webp",
      "/images/products/primal-sleeveless-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black", variantSku: "OG-PRIMAL-SLEEVELESS-SL-DRF-BLACKGREEN" },
      { name: "Blue/Ivory", value: "bg-blue-800", variantSku: "OG-PRIMAL-SLEEVELESS-SL-DRF-BLUEIVORY" },
      { name: "Green/Pink", value: "bg-emerald-700", variantSku: "OG-PRIMAL-SLEEVELESS-SL-DRF-GREENPINK" },
      { name: "Teal/White", value: "bg-teal-600", variantSku: "OG-PRIMAL-SLEEVELESS-SL-DRF-TEALWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "sleeveless",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Primal Power Sleeveless Tank — maximum mobility for heavy lifts and intense conditioning sessions.",
    shortDescription: "Primal power sleeveless gym tank.",
    status: "active",
    sold: 180,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("primal-sleeveless", "SL", "DRF", "Black/Green", "/images/products/primal-sleeveless-black-green.webp"),
      genVariant("primal-sleeveless", "SL", "DRF", "Blue/Ivory", "/images/products/primal-sleeveless-blue-ivory.webp"),
      genVariant("primal-sleeveless", "SL", "DRF", "Green/Pink", "/images/products/primal-sleeveless-green-pink.webp"),
      genVariant("primal-sleeveless", "SL", "DRF", "Teal/White", "/images/products/primal-sleeveless-teal-white.webp"),
    ],
  },
  {
    id: "og-primal-shortsleeve",
    slug: "og-primal-shortsleeve",
    name: "OG PRIMAL POWER — SHORT SLEEVE",
    category: "Primal Collection",
    sports: ["Gym & Training"],
    collectionIds: ["primal"],
    basePrice: 900,
    price: 900,
    image: "/images/products/primal-shortsleeve-black-green.webp",
    gallery: [
      "/images/products/primal-shortsleeve-black-green.webp",
      "/images/products/primal-shortsleeve-blue-ivory.webp",
      "/images/products/primal-shortsleeve-green-pink.webp",
      "/images/products/primal-shortsleeve-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black", variantSku: "OG-PRIMAL-SHORTSLEEVE-SS-DRF-BLACKGREEN" },
      { name: "Blue/Ivory", value: "bg-blue-800", variantSku: "OG-PRIMAL-SHORTSLEEVE-SS-DRF-BLUEIVORY" },
      { name: "Green/Pink", value: "bg-emerald-700", variantSku: "OG-PRIMAL-SHORTSLEEVE-SS-DRF-GREENPINK" },
      { name: "Teal/White", value: "bg-teal-600", variantSku: "OG-PRIMAL-SHORTSLEEVE-SS-DRF-TEALWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Primal Power Short Sleeve Tee — high-density sublimated gym gear tailored for training and physique.",
    shortDescription: "Primal power short sleeve performance shirt.",
    status: "active",
    sold: 240,
    tag: "Popular",
    homeBestSellerRank: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("primal-shortsleeve", "SS", "DRF", "Black/Green", "/images/products/primal-shortsleeve-black-green.webp"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Blue/Ivory", "/images/products/primal-shortsleeve-blue-ivory.webp"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Green/Pink", "/images/products/primal-shortsleeve-green-pink.webp"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Teal/White", "/images/products/primal-shortsleeve-teal-white.webp"),
    ],
  },
  {
    id: "og-primal-longsleeve",
    slug: "og-primal-longsleeve",
    name: "OG PRIMAL POWER — LONG SLEEVE",
    category: "Primal Collection",
    sports: ["Gym & Training"],
    collectionIds: ["primal"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/primal-longsleeve-black-green.webp",
    gallery: [
      "/images/products/primal-longsleeve-black-green.webp",
      "/images/products/primal-longsleeve-blue-ivory.webp",
      "/images/products/primal-longsleeve-green-pink.webp",
      "/images/products/primal-longsleeve-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black", variantSku: "OG-PRIMAL-LONGSLEEVE-LS-DRF-BLACKGREEN" },
      { name: "Blue/Ivory", value: "bg-blue-800", variantSku: "OG-PRIMAL-LONGSLEEVE-LS-DRF-BLUEIVORY" },
      { name: "Green/Pink", value: "bg-emerald-700", variantSku: "OG-PRIMAL-LONGSLEEVE-LS-DRF-GREENPINK" },
      { name: "Teal/White", value: "bg-teal-600", variantSku: "OG-PRIMAL-LONGSLEEVE-LS-DRF-TEALWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Primal Power Long Sleeve — athletic taper with full arm coverage for warmup, outdoors, and strength training.",
    shortDescription: "Primal power long sleeve performance shirt.",
    status: "active",
    sold: 130,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("primal-longsleeve", "LS", "DRF", "Black/Green", "/images/products/primal-longsleeve-black-green.webp"),
      genVariant("primal-longsleeve", "LS", "DRF", "Blue/Ivory", "/images/products/primal-longsleeve-blue-ivory.webp"),
      genVariant("primal-longsleeve", "LS", "DRF", "Green/Pink", "/images/products/primal-longsleeve-green-pink.webp"),
      genVariant("primal-longsleeve", "LS", "DRF", "Teal/White", "/images/products/primal-longsleeve-teal-white.webp"),
    ],
  },
  {
    id: "og-primal-hoodie",
    slug: "og-primal-hoodie",
    name: "OG PRIMAL POWER — HOODIE",
    category: "Primal Collection",
    sports: ["Gym & Training"],
    collectionIds: ["primal"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/primal-hoodie-black-green.webp",
    gallery: [
      "/images/products/primal-hoodie-black-green.webp",
      "/images/products/primal-hoodie-blue-ivory.webp",
      "/images/products/primal-hoodie-green-pink.webp",
      "/images/products/primal-hoodie-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black", variantSku: "OG-PRIMAL-HOODIE-HD-DRF-BLACKGREEN" },
      { name: "Blue/Ivory", value: "bg-blue-800", variantSku: "OG-PRIMAL-HOODIE-HD-DRF-BLUEIVORY" },
      { name: "Green/Pink", value: "bg-emerald-700", variantSku: "OG-PRIMAL-HOODIE-HD-DRF-GREENPINK" },
      { name: "Teal/White", value: "bg-teal-600", variantSku: "OG-PRIMAL-HOODIE-HD-DRF-TEALWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "hoodie",
    fabricType: "dri_fit",
    material: "Performance Sublimated Poly Hoodie",
    description:
      "OG Primal Power Performance Hoodie — lightweight workout layer with drawstring hood and athletic cut.",
    shortDescription: "Primal power performance hoodie.",
    status: "active",
    sold: 95,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("primal-hoodie", "HD", "DRF", "Black/Green", "/images/products/primal-hoodie-black-green.webp"),
      genVariant("primal-hoodie", "HD", "DRF", "Blue/Ivory", "/images/products/primal-hoodie-blue-ivory.webp"),
      genVariant("primal-hoodie", "HD", "DRF", "Green/Pink", "/images/products/primal-hoodie-green-pink.webp"),
      genVariant("primal-hoodie", "HD", "DRF", "Teal/White", "/images/products/primal-hoodie-teal-white.webp"),
    ],
  },

  // ==========================================
  // GYM & TRAINING — SOLAR RISE
  // ==========================================
  {
    id: "og-solar-sleeveless",
    slug: "og-solar-sleeveless",
    name: "OG SOLAR RISE — SLEEVELESS TANK",
    category: "Solar Collection",
    sports: ["Gym & Training"],
    collectionIds: ["solar"],
    basePrice: 900,
    price: 900,
    image: "/images/products/solar-sleeveless-white-teal.webp",
    gallery: [
      "/images/products/solar-sleeveless-white-teal.webp",
      "/images/products/solar-sleeveless-white-red.webp",
      "/images/products/solar-sleeveless-blue-yellow.webp",
      "/images/products/solar-sleeveless-black-teal.webp",
      "/images/products/solar-sleeveless-black-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400", variantSku: "OG-SOLAR-SLEEVELESS-SL-DRF-WHITETEAL" },
      { name: "White/Red", value: "bg-red-500", variantSku: "OG-SOLAR-SLEEVELESS-SL-DRF-WHITERED" },
      { name: "Blue/Yellow", value: "bg-yellow-400", variantSku: "OG-SOLAR-SLEEVELESS-SL-DRF-BLUEYELLOW" },
      { name: "Black/Teal", value: "bg-teal-700", variantSku: "OG-SOLAR-SLEEVELESS-SL-DRF-BLACKTEAL" },
      { name: "Black/Yellow", value: "bg-neutral-900", variantSku: "OG-SOLAR-SLEEVELESS-SL-DRF-BLACKYELLOW" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "sleeveless",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Solar Rise Sleeveless Tank — energized graphics and lightweight ventilation for heavy training sessions.",
    shortDescription: "Solar Rise sleeveless athletic tank.",
    status: "active",
    sold: 110,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("solar-sleeveless", "SL", "DRF", "White/Teal", "/images/products/solar-sleeveless-white-teal.webp"),
      genVariant("solar-sleeveless", "SL", "DRF", "White/Red", "/images/products/solar-sleeveless-white-red.webp"),
      genVariant("solar-sleeveless", "SL", "DRF", "Blue/Yellow", "/images/products/solar-sleeveless-blue-yellow.webp"),
      genVariant("solar-sleeveless", "SL", "DRF", "Black/Teal", "/images/products/solar-sleeveless-black-teal.webp"),
      genVariant("solar-sleeveless", "SL", "DRF", "Black/Yellow", "/images/products/solar-sleeveless-black-yellow.webp"),
    ],
  },
  {
    id: "og-solar-shortsleeve",
    slug: "og-solar-shortsleeve",
    name: "OG SOLAR RISE — SHORT SLEEVE",
    category: "Solar Collection",
    sports: ["Gym & Training"],
    collectionIds: ["solar"],
    basePrice: 1000,
    price: 1000,
    image: "/images/products/solar-shortsleeve-white-teal.webp",
    gallery: [
      "/images/products/solar-shortsleeve-white-teal.webp",
      "/images/products/solar-shortsleeve-white-red.webp",
      "/images/products/solar-shortsleeve-blue-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400", variantSku: "OG-SOLAR-SHORTSLEEVE-SS-DRF-WHITETEAL" },
      { name: "White/Red", value: "bg-red-500", variantSku: "OG-SOLAR-SHORTSLEEVE-SS-DRF-WHITERED" },
      { name: "Blue/Yellow", value: "bg-yellow-400", variantSku: "OG-SOLAR-SHORTSLEEVE-SS-DRF-BLUEYELLOW" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Solar Rise Short Sleeve — radiant gradient motifs on sweat-wicking dryfit fabric.",
    shortDescription: "Solar Rise short sleeve performance tee.",
    status: "active",
    sold: 140,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("solar-shortsleeve", "SS", "DRF", "White/Teal", "/images/products/solar-shortsleeve-white-teal.webp"),
      genVariant("solar-shortsleeve", "SS", "DRF", "White/Red", "/images/products/solar-shortsleeve-white-red.webp"),
      genVariant("solar-shortsleeve", "SS", "DRF", "Blue/Yellow", "/images/products/solar-shortsleeve-blue-yellow.webp"),
    ],
  },
  {
    id: "og-solar-longsleeve",
    slug: "og-solar-longsleeve",
    name: "OG SOLAR RISE — LONG SLEEVE",
    category: "Solar Collection",
    sports: ["Gym & Training"],
    collectionIds: ["solar"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/solar-longsleeve-white-teal.webp",
    gallery: [
      "/images/products/solar-longsleeve-white-teal.webp",
      "/images/products/solar-longsleeve-white-red.webp",
      "/images/products/solar-longsleeve-blue-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400", variantSku: "OG-SOLAR-LONGSLEEVE-LS-DRF-WHITETEAL" },
      { name: "White/Red", value: "bg-red-500", variantSku: "OG-SOLAR-LONGSLEEVE-LS-DRF-WHITERED" },
      { name: "Blue/Yellow", value: "bg-yellow-400", variantSku: "OG-SOLAR-LONGSLEEVE-LS-DRF-BLUEYELLOW" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "2XS–5XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Dryfit Polyester, Full Sublimation",
    description:
      "OG Solar Rise Long Sleeve — solar flare graphics with full coverage against the sun and elements.",
    shortDescription: "Solar Rise long sleeve performance shirt.",
    status: "active",
    sold: 90,
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("solar-longsleeve", "LS", "DRF", "White/Teal", "/images/products/solar-longsleeve-white-teal.webp"),
      genVariant("solar-longsleeve", "LS", "DRF", "White/Red", "/images/products/solar-longsleeve-white-red.webp"),
      genVariant("solar-longsleeve", "LS", "DRF", "Blue/Yellow", "/images/products/solar-longsleeve-blue-yellow.webp"),
    ],
  },

  // ==========================================
  // GOLF
  // ==========================================
  {
    id: "og-golf",
    slug: "og-links-golf-polo",
    name: "OFF GRID LIFESTYLE — LINKS GOLF POLO",
    category: "Golf",
    sports: ["Golf"],
    collectionIds: ["golf"],
    basePrice: 1200,
    price: 1200,
    image: "/images/products/golf-links-cover.webp",
    gallery: [
      "/images/products/golf-links-cover.webp",
      "/images/products/golf-navy-blue.webp",
      "/images/products/golf-pink.webp",
      "/images/products/golf-teal-green.webp",
    ],
    colors: [
      { name: "Navy Blue (One More Swing)", value: "bg-blue-900", variantSku: "OG-OG-GOLF-PO-POL-NAVYBLUE" },
      { name: "Pink (One More Swing)", value: "bg-[#FFC0CB]", variantSku: "OG-OG-GOLF-PO-POL-PINK" },
      { name: "Teal Green (Trust The Swing)", value: "bg-teal-700", variantSku: "OG-OG-GOLF-PO-POL-TEALGREEN" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "S–5XL",
    cut: "polo",
    fabricType: "poly_blend",
    material: "Performance Technical Golf Pique",
    description:
      "OFFGRID Links Golf Polo — 4-way stretch with breathable collar construction. Built for 18 holes under the tropical sun.",
    shortDescription: "Performance technical golf polo · S–5XL.",
    status: "active",
    sold: 210,
    tag: "Golf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("og-golf", "PO", "POL", "Navy Blue", "/images/products/golf-navy-blue.webp"),
      genVariant("og-golf", "PO", "POL", "Pink", "/images/products/golf-pink.webp"),
      genVariant("og-golf", "PO", "POL", "Teal Green", "/images/products/golf-teal-green.webp"),
    ],
  },

  // ==========================================
  // PICKLEBALL
  // ==========================================
  {
    id: "og-pickleball-club",
    slug: "og-pickleball-club-collection",
    name: "OG PICKLEBALL — CLUB COLLECTION",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 850,
    price: 620,
    image: "/images/products/pickleball-club-cover.webp",
    gallery: [
      "/images/products/pickleball-club-cover.webp",
      "/images/products/pickleball-club-cream.webp",
      "/images/products/pickleball-club-green.webp",
      "/images/products/pickleball-club-black.webp",
      "/images/products/pickleball-club-violet.webp",
      "/images/products/pickleball-club-white.webp",
    ],
    colors: [
      { name: "Pickleball Cream", value: "bg-offgrid-cream", variantSku: "OG-PICKLE-CLUB-SS-DRF-PICKLEBALLCREAM" },
      { name: "Pickleball Green", value: "bg-offgrid-green", variantSku: "OG-PICKLE-CLUB-SS-DRF-PICKLEBALLGREEN" },
      { name: "Pickleball Black", value: "bg-black", variantSku: "OG-PICKLE-CLUB-SS-DRF-PICKLEBALLBLACK" },
      { name: "Pickleball Violet", value: "bg-purple-700", variantSku: "OG-PICKLE-CLUB-SS-DRF-PICKLEBALLVIOLET" },
      { name: "Pickleball White", value: "bg-white", variantSku: "OG-PICKLE-CLUB-SS-DRF-PICKLEBALLWHITE" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL"],
    sizeRange: "2XS–2XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Performance Dryfit",
    description:
      "Club cut in the OFFGRID pickleball collection. Clean team look for league nights and open play with 27% launch discount.",
    shortDescription: "Pickleball club performance tee (27% OFF).",
    status: "active",
    sold: 280,
    tag: "Sale",
    tags: ["Sale", "Pickleball"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pickle-club", "SS", "DRF", "Pickleball Cream", "/images/products/pickleball-club-cream.webp"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Green", "/images/products/pickleball-club-green.webp"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Black", "/images/products/pickleball-club-black.webp"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Violet", "/images/products/pickleball-club-violet.webp"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball White", "/images/products/pickleball-club-white.webp"),
    ],
  },
  {
    id: "og-pickleball-graphics",
    slug: "og-pickleball-graphic-collection",
    name: "OG PICKLEBALL — GRAPHIC COLLECTION",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 850,
    price: 850,
    image: "/images/products/pickleball-alt-cover.webp",
    gallery: [
      "/images/products/pickleball-alt-cover.webp",
      "/images/products/pickleball-dink-different.webp",
      "/images/products/pickleball-summer-league.webp",
      "/images/products/pickleball-everyday-pickleday.webp",
      "/images/products/pickleball-get-dink-on.webp",
      "/images/products/pickleball-pocket-print.webp",
    ],
    colors: [
      { name: "Dink Different (Black)", value: "bg-black", variantSku: "OG-PICKLE-GRAPHICS-SS-DRF-DINKDIFFERENT" },
      { name: "Summer League (Royal Blue)", value: "bg-blue-600", variantSku: "OG-PICKLE-GRAPHICS-SS-DRF-SUMMERLEAGUE" },
      { name: "Everyday Pickle Day (Pink)", value: "bg-pink-300", variantSku: "OG-PICKLE-GRAPHICS-SS-DRF-EVERYDAYPICKLEDAY" },
      { name: "Get Your Dink On (Teal)", value: "bg-teal-700", variantSku: "OG-PICKLE-GRAPHICS-SS-DRF-GETYOURDINKON" },
      { name: "Pocket Print (White)", value: "bg-white", variantSku: "OG-PICKLE-GRAPHICS-SS-DRF-POCKETPRINT" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit Performance Mesh",
    description:
      "OFFGRID Pickleball Graphic Collection — signature court graphics including Dink Different, Summer League, Everyday Pickle Day, Get Your Dink On, and Pocket Print with premium front and back court prints.",
    shortDescription: "Signature pickleball graphic tees with front & back court prints.",
    status: "active",
    sold: 310,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pickle-graphics", "SS", "DRF", "Dink Different", "/images/products/pickleball-dink-different.webp"),
      genVariant("pickle-graphics", "SS", "DRF", "Summer League", "/images/products/pickleball-summer-league.webp"),
      genVariant("pickle-graphics", "SS", "DRF", "Everyday Pickle Day", "/images/products/pickleball-everyday-pickleday.webp"),
      genVariant("pickle-graphics", "SS", "DRF", "Get Your Dink On", "/images/products/pickleball-get-dink-on.webp"),
      genVariant("pickle-graphics", "SS", "DRF", "Pocket Print", "/images/products/pickleball-pocket-print.webp"),
    ],
  },
  {
    id: "salmon-smasher-shortsleeve",
    slug: "salmon-smasher-shortsleeve",
    name: "OFFGRID SALMON SMASHER SHORTSLEEVE",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/pickleball-salmon-smasher-ss.webp",
    gallery: [
      "/images/products/pickleball-salmon-smasher-ss.webp",
    ],
    colors: [
      { name: "Salmon Pink", value: "bg-[#FA8072]", variantSku: "OG-SALMON-SMASHER-SS-DRF-SALMONPINK" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Performance Drifit",
    description:
      "Smash like a salmon — vibrant tournament drifit short sleeve activewear engineered for high-intensity court play.",
    shortDescription: "Salmon smasher performance drifit short sleeve tee · 2XS–3XL.",
    status: "active",
    sold: 105,
    tag: "Pickleball",
    tags: ["Pickleball", "Court", "Drifit"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("salmon-smasher", "SS", "DRF", "Salmon Pink", "/images/products/pickleball-salmon-smasher-ss.webp"),
    ],
  },
  {
    id: "salmon-smasher-longsleeve",
    slug: "salmon-smasher-longsleeve",
    name: "OFFGRID SALMON SMASHER LONGSLEEVE",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/pickleball-salmon-smasher-ls.webp",
    gallery: [
      "/images/products/pickleball-salmon-smasher-ls.webp",
    ],
    colors: [
      { name: "Salmon Pink", value: "bg-[#E06F62]", variantSku: "OG-SALMON-SMASHER-LS-DRF-SALMONPINK" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Performance Drifit",
    description:
      "Smash like a salmon — vibrant tournament drifit long sleeve activewear engineered for sun protection and court performance.",
    shortDescription: "Salmon smasher performance drifit long sleeve tee · 2XS–3XL.",
    status: "active",
    sold: 84,
    tag: "Pickleball",
    tags: ["Pickleball", "Court", "Drifit"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("salmon-smasher", "LS", "DRF", "Salmon Pink", "/images/products/pickleball-salmon-smasher-ls.webp"),
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH")}`;
}

export function getProductSports(product: Product): string[] {
  if (product.sports?.length) return product.sports;
  if (["Ultimate Frisbee", "Frisbee", "Pilipinas Collection"].includes(product.category)) {
    return ["Ultimate Frisbee"];
  }
  if (["Solar Collection", "Primal Collection", "Gym & Training"].includes(product.category)) {
    return ["Gym & Training"];
  }
  if (["Lifestyle / OG Vibe", "Lifestyle", "Lifestyle / Motoline"].includes(product.category)) {
    return ["Lifestyle"];
  }
  return [product.category];
}

export function getProductTags(product: Product): string[] {
  if (product.tags?.length) return product.tags;
  return product.tag?.trim() ? [product.tag.trim()] : [];
}

const SPORT_PRIORITY = ["Ultimate Frisbee", "Pickleball", "Golf", "Running", "Gym & Training", "Lifestyle"];

export function compareSports(a: string, b: string): number {
  const aIndex = SPORT_PRIORITY.indexOf(a);
  const bIndex = SPORT_PRIORITY.indexOf(b);
  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }
  return a.localeCompare(b);
}

export function isProductDiscounted(product: Pick<Product, "basePrice" | "price">): boolean {
  return Number.isFinite(product.basePrice) && product.basePrice > product.price;
}

export function getDiscountPercent(product: Pick<Product, "basePrice" | "price">): number {
  return isProductDiscounted(product)
    ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
    : 0;
}
