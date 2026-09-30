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

function genVariant(slug: string, cutCode: string, fabCode: string, colorRaw: string): ProductVariant {
  const designName = colorRaw.trim();
  const designCode = designName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return {
    sku: `OG-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${cutCode}-${fabCode}-${designCode}`,
    designName,
    isActive: true,
  };
}

function frisbeeProduct(
  id: string,
  slug: string,
  name: string,
  image: string,
  price: number,
  sold: number,
  rank?: number,
  tag?: string,
): Product {
  return {
    id,
    slug,
    name,
    category: "Ultimate Frisbee",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["discfest"],
    basePrice: tag === "Best Seller" ? price + 200 : price,
    price,
    image,
    colors: [
      { name: "Field Black", value: "bg-offgrid-dark" },
      { name: "OFFGRID Lime", value: "bg-offgrid-lime" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Premium Drifit",
    description: `${name} — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate and disc days. Full sublimation teamwear.`,
    shortDescription: `Discfest ultimate frisbee tee · ${name}.`,
    status: "active",
    sold,
    tag,
    homeBestSellerRank: rank,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant(slug, "SS", "DRF", "Field Black"),
      genVariant(slug, "SS", "DRF", "OFFGRID Lime"),
    ],
  };
}

export const products: Product[] = [
  // ==========================================
  // ULTIMATE FRISBEE / DISCFEST & PILIPINAS
  // ==========================================
  frisbeeProduct(
    "og-voyager",
    "og-voyager",
    "OG VOYAGER",
    "/images/community/community-ultimate-skyball.jpg",
    1100,
    520,
    1,
    "Best Seller",
  ),
  frisbeeProduct(
    "og-stats",
    "og-stats",
    "OG STATS",
    "/images/community/community-ultimate-catch.jpg",
    1100,
    410,
    2,
  ),
  frisbeeProduct(
    "og-arcade",
    "og-arcade",
    "OG ARCADE",
    "/images/community/community-ultimate-field.jpg",
    1100,
    380,
    3,
  ),
  frisbeeProduct(
    "og-comet",
    "og-comet",
    "OG COMET",
    "/images/community/community-ultimate-skyball.jpg",
    1100,
    295,
    4,
  ),
  {
    id: "og-discfest-towel",
    slug: "og-discfest-towel",
    name: "OG DISCFEST TOWEL",
    category: "Ultimate Frisbee",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["discfest"],
    basePrice: 650,
    price: 650,
    image: "/images/community/product-towel-bench.jpg",
    colors: [{ name: "Field Cream", value: "bg-offgrid-cream" }],
    sizes: ["S", "M", "L", "XL"],
    sizeRange: "One size / S–XL pack",
    cut: "shorts",
    fabricType: "cotton",
    material: "Absorbent cotton terry",
    description:
      "OFFGRID Discfest towel — sideline essential for ultimate frisbee game days. Part of our top-selling ultimate frisbee retail line.",
    shortDescription: "Discfest ultimate frisbee towel.",
    status: "active",
    sold: 260,
    tag: "Discfest",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pilipinas-aouc-jersey",
    slug: "pilipinas-aouc-jersey-2025",
    name: "PILIPINAS AOUC JERSEY 2025",
    category: "Pilipinas Collection",
    sports: ["Ultimate Frisbee"],
    collectionIds: ["pilipinas", "discfest"],
    basePrice: 1000,
    price: 1000,
    image: "/images/products/pilipinas-aouc-capiz.webp",
    gallery: [
      "/images/products/pilipinas-aouc-capiz.webp",
      "/images/products/pilipinas-aouc-lilim.webp",
      "/images/products/pilipinas-aouc-piloncitos.webp",
    ],
    colors: [
      { name: "Capiz", value: "bg-[#E6DEC8]" },
      { name: "Lilim", value: "bg-[#1E293B]" },
      { name: "Piloncitos", value: "bg-[#D97706]" },
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
    tag: "Pilipinas",
    tags: ["Pilipinas", "National Team"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pilipinas-aouc", "SS", "DRF", "Capiz"),
      genVariant("pilipinas-aouc", "SS", "DRF", "Lilim"),
      genVariant("pilipinas-aouc", "SS", "DRF", "Piloncitos"),
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
      { name: "National Blue", value: "bg-blue-700" },
      { name: "National White", value: "bg-white" },
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
      genVariant("pilipinas-ultimate", "SS", "DRF", "National Blue"),
      genVariant("pilipinas-ultimate", "SS", "DRF", "National White"),
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
    colors: [
      { name: "Pilipinas Gold & Sun", value: "bg-[#FFD700]" },
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
      genVariant("padayon", "TK", "DRF", "Gold Sun"),
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
      "/images/products/running-classic-black.webp",
      "/images/products/running-flow-state-blue.webp",
      "/images/products/running-purpose-green.webp",
      "/images/products/running-catch-me-cream.webp",
      "/images/products/running-stride-club-gray.webp",
    ],
    colors: [
      { name: "OFFGRID Classic (Black)", value: "bg-offgrid-dark" },
      { name: "The Flow State (Blue)", value: "bg-blue-600" },
      { name: "Run With Purpose (Green)", value: "bg-offgrid-green" },
      { name: "Catch Me If You Can (Cream)", value: "bg-offgrid-cream" },
      { name: "The Stride Club (Dark Gray)", value: "bg-gray-700" },
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
    tag: "Running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("running-line", "SS", "DRF", "OFFGRID Classic Black"),
      genVariant("running-line", "SS", "DRF", "The Flow State Blue"),
      genVariant("running-line", "SS", "DRF", "Run With Purpose Green"),
      genVariant("running-line", "SS", "DRF", "Catch Me If You Can Cream"),
      genVariant("running-line", "SS", "DRF", "The Stride Club Dark Gray"),
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
      "/images/products/stride-running-promo.webp",
      "/images/products/stride-running-grid.webp",
      "/images/products/stride-running-detail.webp",
    ],
    colors: [
      { name: "White-Teal", value: "bg-teal-400" },
      { name: "White-Pink", value: "bg-pink-400" },
      { name: "White-Neon Green", value: "bg-lime-400" },
      { name: "White-Orange", value: "bg-orange-400" },
      { name: "Black-Teal", value: "bg-teal-700" },
      { name: "Black-Pink", value: "bg-pink-700" },
      { name: "Black-Neon Green", value: "bg-lime-600" },
      { name: "Pink-Teal", value: "bg-fuchsia-600" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "running_mesh",
    material: "Breathable Running Poly",
    description:
      "Off Grid Stride Collection — high-visibility dual-tone colorways engineered for chasing PRs from morning intervals to night runs.",
    shortDescription: "Chasing PR dual-tone running shirts.",
    status: "active",
    sold: 195,
    tag: "Running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("stride", "SS", "RUN", "White-Teal"),
      genVariant("stride", "SS", "RUN", "White-Pink"),
      genVariant("stride", "SS", "RUN", "White-Neon Green"),
      genVariant("stride", "SS", "RUN", "White-Orange"),
      genVariant("stride", "SS", "RUN", "Black-Teal"),
      genVariant("stride", "SS", "RUN", "Black-Pink"),
      genVariant("stride", "SS", "RUN", "Black-Neon Green"),
      genVariant("stride", "SS", "RUN", "Pink-Teal"),
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
    collectionIds: ["lifestyle", "running"],
    basePrice: 650,
    price: 650,
    image: "/images/products/motoline-cover.webp",
    gallery: [
      "/images/products/motoline-full-throttle.webp",
      "/images/products/motoline-takbong-og.webp",
      "/images/products/motoline-stay-offgrid.webp",
      "/images/products/motoline-takbong-pogi.webp",
    ],
    colors: [
      { name: "FULL THROTTLE LIFE", value: "bg-offgrid-dark" },
      { name: "TAKBONG OG", value: "bg-offgrid-green" },
      { name: "STAY OFFGRID", value: "bg-offgrid-lime" },
      { name: "TAKBONG POGI MODE", value: "bg-offgrid-cream" },
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
    tag: "Lifestyle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("motoline", "LS", "DRF", "FULL THROTTLE LIFE"),
      genVariant("motoline", "LS", "DRF", "TAKBONG OG"),
      genVariant("motoline", "LS", "DRF", "STAY OFFGRID"),
      genVariant("motoline", "LS", "DRF", "TAKBONG POGI MODE"),
    ],
  },
  {
    id: "the-og-vibe-collection",
    slug: "the-og-vibe-collection",
    name: "THE OG VIBE STREETWEAR TEE",
    category: "Lifestyle / OG Vibe",
    sports: ["Lifestyle"],
    collectionIds: ["lifestyle"],
    basePrice: 850,
    price: 850,
    image: "/images/products/og-vibe-steampunk-black.webp",
    gallery: [
      "/images/products/og-vibe-blossom-black.webp",
      "/images/products/og-vibe-steampunk-cream.webp",
      "/images/products/og-vibe-blossom-cream.webp",
    ],
    colors: [
      { name: "Black Steampunk", value: "bg-black" },
      { name: "Black Blossom", value: "bg-neutral-900" },
      { name: "Cream Steampunk", value: "bg-[#F5F2EB]" },
      { name: "Cream Blossom", value: "bg-offgrid-cream" },
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
      genVariant("the-og-vibe-collection", "SS", "COT", "Black Steampunk"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Black Blossom"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Cream Steampunk"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Cream Blossom"),
    ],
  },
  {
    id: "og-momentum-caps",
    slug: "og-momentum-caps",
    name: "OFF GRID MOMENTUM ATHLETIC CAP",
    category: "Lifestyle",
    sports: ["Lifestyle"],
    collectionIds: ["lifestyle"],
    basePrice: 950,
    price: 950,
    image: "/images/products/momentum-cap-cover.webp",
    gallery: [
      "/images/products/momentum-cap-dark-blue.webp",
      "/images/products/momentum-cap-black.webp",
      "/images/products/momentum-cap-white.webp",
      "/images/products/momentum-cap-sky-blue.webp",
      "/images/products/momentum-cap-pink.webp",
    ],
    colors: [
      { name: "Dark Blue", value: "bg-blue-900" },
      { name: "Black", value: "bg-black" },
      { name: "White", value: "bg-white" },
      { name: "Sky Blue", value: "bg-sky-400" },
      { name: "Pink", value: "bg-pink-400" },
    ],
    sizes: ["One Size"],
    sizeRange: "One Size (Adjustable strap)",
    cut: "cap",
    fabricType: "poly_blend",
    material: "Structured Breathable Twill",
    description:
      "Off Grid Lifestyle Momentum Caps — structured crown with moisture-managing sweatband and adjustable fit for sun protection and style.",
    shortDescription: "Breathable athletic cap with adjustable strap.",
    status: "active",
    sold: 70,
    tag: "Headwear",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("momentum-caps", "CP", "PLY", "Dark Blue"),
      genVariant("momentum-caps", "CP", "PLY", "Black"),
      genVariant("momentum-caps", "CP", "PLY", "White"),
      genVariant("momentum-caps", "CP", "PLY", "Sky Blue"),
      genVariant("momentum-caps", "CP", "PLY", "Pink"),
    ],
  },
  {
    id: "og-microfiber-towel",
    slug: "og-microfiber-towel",
    name: "OFF GRID MICROFIBER PERFORMANCE TOWEL",
    category: "Lifestyle",
    sports: ["Lifestyle"],
    collectionIds: ["lifestyle"],
    basePrice: 650,
    price: 650,
    image: "/images/products/towel-microfiber-promo.webp",
    gallery: [
      "/images/products/towel-microfiber-progress.webp",
      "/images/products/towel-microfiber-hand-spec.webp",
      "/images/products/towel-microfiber-detail.webp",
      "/images/products/towel-microfiber-flatlay.webp",
    ],
    colors: [
      { name: "OFFGRID Lime / Field Black", value: "bg-offgrid-green" },
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
      genVariant("microfiber-towel", "AC", "MCF", "Face 30x30"),
      genVariant("microfiber-towel", "AC", "MCF", "Hand 35x75"),
      genVariant("microfiber-towel", "AC", "MCF", "Bath 140x70"),
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
      "/images/products/primal-sleeveless-blue-ivory.webp",
      "/images/products/primal-sleeveless-green-pink.webp",
      "/images/products/primal-sleeveless-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black" },
      { name: "Blue/Ivory", value: "bg-blue-800" },
      { name: "Green/Pink", value: "bg-emerald-700" },
      { name: "Teal/White", value: "bg-teal-600" },
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
      genVariant("primal-sleeveless", "SL", "DRF", "Black/Green"),
      genVariant("primal-sleeveless", "SL", "DRF", "Blue/Ivory"),
      genVariant("primal-sleeveless", "SL", "DRF", "Green/Pink"),
      genVariant("primal-sleeveless", "SL", "DRF", "Teal/White"),
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
      "/images/products/primal-shortsleeve-blue-ivory.webp",
      "/images/products/primal-shortsleeve-green-pink.webp",
      "/images/products/primal-shortsleeve-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black" },
      { name: "Blue/Ivory", value: "bg-blue-800" },
      { name: "Green/Pink", value: "bg-emerald-700" },
      { name: "Teal/White", value: "bg-teal-600" },
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
    tag: "Gym & Training",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("primal-shortsleeve", "SS", "DRF", "Black/Green"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Blue/Ivory"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Green/Pink"),
      genVariant("primal-shortsleeve", "SS", "DRF", "Teal/White"),
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
      "/images/products/primal-longsleeve-blue-ivory.webp",
      "/images/products/primal-longsleeve-green-pink.webp",
      "/images/products/primal-longsleeve-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black" },
      { name: "Blue/Ivory", value: "bg-blue-800" },
      { name: "Green/Pink", value: "bg-emerald-700" },
      { name: "Teal/White", value: "bg-teal-600" },
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
      genVariant("primal-longsleeve", "LS", "DRF", "Black/Green"),
      genVariant("primal-longsleeve", "LS", "DRF", "Blue/Ivory"),
      genVariant("primal-longsleeve", "LS", "DRF", "Green/Pink"),
      genVariant("primal-longsleeve", "LS", "DRF", "Teal/White"),
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
      "/images/products/primal-hoodie-blue-ivory.webp",
      "/images/products/primal-hoodie-green-pink.webp",
      "/images/products/primal-hoodie-teal-white.webp",
    ],
    colors: [
      { name: "Black/Green", value: "bg-black" },
      { name: "Blue/Ivory", value: "bg-blue-800" },
      { name: "Green/Pink", value: "bg-emerald-700" },
      { name: "Teal/White", value: "bg-teal-600" },
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
      genVariant("primal-hoodie", "HD", "DRF", "Black/Green"),
      genVariant("primal-hoodie", "HD", "DRF", "Blue/Ivory"),
      genVariant("primal-hoodie", "HD", "DRF", "Green/Pink"),
      genVariant("primal-hoodie", "HD", "DRF", "Teal/White"),
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
      "/images/products/solar-sleeveless-white-red.webp",
      "/images/products/solar-sleeveless-blue-yellow.webp",
      "/images/products/solar-sleeveless-black-teal.webp",
      "/images/products/solar-sleeveless-black-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400" },
      { name: "White/Red", value: "bg-red-500" },
      { name: "Blue/Yellow", value: "bg-yellow-400" },
      { name: "Black/Teal", value: "bg-teal-700" },
      { name: "Black/Yellow", value: "bg-neutral-900" },
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
      genVariant("solar-sleeveless", "SL", "DRF", "White/Teal"),
      genVariant("solar-sleeveless", "SL", "DRF", "White/Red"),
      genVariant("solar-sleeveless", "SL", "DRF", "Blue/Yellow"),
      genVariant("solar-sleeveless", "SL", "DRF", "Black/Teal"),
      genVariant("solar-sleeveless", "SL", "DRF", "Black/Yellow"),
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
      "/images/products/solar-shortsleeve-white-red.webp",
      "/images/products/solar-shortsleeve-blue-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400" },
      { name: "White/Red", value: "bg-red-500" },
      { name: "Blue/Yellow", value: "bg-yellow-400" },
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
      genVariant("solar-shortsleeve", "SS", "DRF", "White/Teal"),
      genVariant("solar-shortsleeve", "SS", "DRF", "White/Red"),
      genVariant("solar-shortsleeve", "SS", "DRF", "Blue/Yellow"),
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
      "/images/products/solar-longsleeve-white-red.webp",
      "/images/products/solar-longsleeve-blue-yellow.webp",
    ],
    colors: [
      { name: "White/Teal", value: "bg-teal-400" },
      { name: "White/Red", value: "bg-red-500" },
      { name: "Blue/Yellow", value: "bg-yellow-400" },
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
      genVariant("solar-longsleeve", "LS", "DRF", "White/Teal"),
      genVariant("solar-longsleeve", "LS", "DRF", "White/Red"),
      genVariant("solar-longsleeve", "LS", "DRF", "Blue/Yellow"),
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
      "/images/products/golf-navy-blue.webp",
      "/images/products/golf-pink.webp",
      "/images/products/golf-teal-green.webp",
    ],
    colors: [
      { name: "Navy Blue (One More Swing)", value: "bg-blue-900" },
      { name: "Pink (One More Swing)", value: "bg-[#FFC0CB]" },
      { name: "Teal Green (Trust The Swing)", value: "bg-teal-700" },
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
      genVariant("og-golf", "PO", "POL", "Navy Blue"),
      genVariant("og-golf", "PO", "POL", "Pink"),
      genVariant("og-golf", "PO", "POL", "Teal Green"),
    ],
  },

  // ==========================================
  // PICKLEBALL
  // ==========================================
  {
    id: "og-pickleball",
    slug: "og-pickleball",
    name: "OG PICKLEBALL CLASSIC",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 900,
    price: 900,
    image: "/images/products/pickleball-lifestyle-shirt.webp",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
      { name: "Blue", value: "bg-blue-600" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Soft Combed Cotton",
    description:
      "Core OFFGRID pickleball tee. Soft combed cotton for open play and sideline hangs.",
    shortDescription: "Core pickleball cotton tee.",
    status: "active",
    sold: 342,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("og-pickleball", "SS", "COT", "Green"),
      genVariant("og-pickleball", "SS", "COT", "Blue"),
    ],
  },
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
      "/images/products/pickleball-club-black.webp",
      "/images/products/pickleball-club-cream.webp",
      "/images/products/pickleball-club-green.webp",
      "/images/products/pickleball-club-violet.webp",
      "/images/products/pickleball-club-white.webp",
    ],
    colors: [
      { name: "Pickleball Cream", value: "bg-offgrid-cream" },
      { name: "Pickleball Green", value: "bg-offgrid-green" },
      { name: "Pickleball Black", value: "bg-black" },
      { name: "Pickleball Violet", value: "bg-purple-700" },
      { name: "Pickleball White", value: "bg-white" },
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
      genVariant("pickle-club", "SS", "DRF", "Pickleball Cream"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Green"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Black"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball Violet"),
      genVariant("pickle-club", "SS", "DRF", "Pickleball White"),
    ],
  },
  {
    id: "everyday-is-pickle-day",
    slug: "everyday-is-pickle-day",
    name: "EVERYDAY IS PICKLE DAY",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 850,
    price: 850,
    image: "/images/products/pickleball-everyday-pickleday.webp",
    colors: [
      { name: "White-Pink", value: "bg-pink-100" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Cotton Lifestyle Blend",
    description: "Everyday is pickle day graphic tee for avid players.",
    shortDescription: "Pickle day casual tee.",
    status: "active",
    sold: 230,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("everyday-pickle", "SS", "COT", "White-Pink"),
    ],
  },
  {
    id: "get-your-dink",
    slug: "get-your-dink",
    name: "GET YOUR DINK ON",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 850,
    price: 850,
    image: "/images/products/pickleball-get-dink-on.webp",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Soft Cotton Tee",
    description: "Get your dink on — court-ready casual tee.",
    shortDescription: "Get your dink tee.",
    status: "active",
    sold: 310,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("get-dink", "SS", "COT", "Green"),
    ],
  },
  {
    id: "pickleball-lifestyle",
    slug: "pickleball-lifestyle",
    name: "OG PICKLEBALL — LIFESTYLE",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 850,
    price: 850,
    image: "/images/products/pickleball-lifestyle-shirt.webp",
    colors: [
      { name: "White", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Comfort Cotton",
    description:
      "Lifestyle cut in the OFFGRID pickleball line — court-to-street tee in comfortable cotton.",
    shortDescription: "Pickleball lifestyle tee.",
    status: "active",
    sold: 180,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("pickle-lifestyle", "SS", "COT", "White"),
    ],
  },
  {
    id: "salmon-smasher",
    slug: "salmon-smasher",
    name: "SALMON SMASHER PERFORMANCE",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 900,
    price: 900,
    image: "/images/products/pickleball-salmon-smasher-ss.webp",
    gallery: [
      "/images/products/pickleball-salmon-smasher-ls.webp",
    ],
    colors: [
      { name: "Salmon Pink", value: "bg-[#FA8072]" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Performance Drifit",
    description: "Smash like a salmon — vibrant tournament drifit tee.",
    shortDescription: "Salmon smasher performance tee.",
    status: "active",
    sold: 105,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("salmon-smasher", "SS", "DRF", "Salmon Pink"),
    ],
  },
  {
    id: "og-dink-different",
    slug: "og-dink-different",
    name: "OG DINK DIFFERENT",
    category: "Pickleball",
    sports: ["Pickleball"],
    collectionIds: ["pickleball"],
    basePrice: 1100,
    price: 1100,
    image: "/images/products/pickleball-dink-different.webp",
    colors: [
      { name: "Black", value: "bg-black" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit Performance Mesh",
    description: "Dink different. Stand out on the pickleball court.",
    shortDescription: "Dink different performance tee.",
    status: "active",
    sold: 215,
    tag: "Pickleball",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("dink-different", "SS", "DRF", "Black"),
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
