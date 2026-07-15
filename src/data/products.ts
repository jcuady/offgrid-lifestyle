export type SizeCode = "2XS" | "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";

export type GarmentCut = "long_sleeve" | "short_sleeve" | "sleeveless" | "polo" | "tank" | "shorts" | "cap";

export type FabricType = "dri_fit" | "cotton" | "running_mesh" | "poly_blend" | "nylon_spandex";

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
    description: `${name} — OFFGRID ultimate frisbee retail from the Discfest line. Performance drifit for ultimate / disc days and everyday wear.`,
    shortDescription: `Discfest ultimate frisbee tee · ${name}.`,
    status: "active",
    sold,
    tag,
    tags: tag ? [tag, ...(tag === "Best Seller" ? ["Promo"] : [])] : ["Discfest"],
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
    id: "og-motoline",
    slug: "motoline",
    name: "MOTOLINE",
    category: "Running",
    collectionIds: ["running"],
    basePrice: 650,
    price: 650,
    image: "/images/product-motoline.jpg",
    colors: [
      { name: "FULL THROTTLE", value: "bg-offgrid-dark" },
      { name: "TAKBONG OG", value: "bg-offgrid-green" },
      { name: "STAY OFFGRID", value: "bg-offgrid-lime" },
      { name: "TAKBONG POGI", value: "bg-offgrid-cream" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Premium Drifit",
    description:
      "MOTOLINE long-sleeve running kit — gritty street and tempo runs. Moisture-wicking drifit in OFFGRID colorways.",
    shortDescription: "Long sleeve drifit running gear.",
    status: "active",
    sold: 154,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("motoline", "LS", "DRF", "FULL THROTTLE"),
      genVariant("motoline", "LS", "DRF", "TAKBONG OG"),
      genVariant("motoline", "LS", "DRF", "STAY OFFGRID"),
      genVariant("motoline", "LS", "DRF", "TAKBONG POGI"),
    ],
  },
  {
    id: "og-golf",
    slug: "og-golf",
    name: "OG GOLF",
    category: "Golf",
    collectionIds: ["golf"],
    basePrice: 1200,
    price: 1200,
    image: "/images/product-og-golf.png",
    colors: [
      { name: "Pink", value: "bg-[#FFC0CB]" },
      { name: "Navy Blue", value: "bg-blue-900" },
      { name: "Green", value: "bg-offgrid-green" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "S–5XL",
    cut: "polo",
    fabricType: "poly_blend",
    material: "Performance polo knit",
    description:
      "OFFGRID golf polo with stretch for the fairway — clean enough for the clubhouse, mobile enough for 18 holes.",
    shortDescription: "Performance golf polo · S–5XL.",
    status: "active",
    sold: 210,
    tag: "Golf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("og-golf", "SS", "POL", "Pink"),
      genVariant("og-golf", "SS", "POL", "Navy Blue"),
      genVariant("og-golf", "SS", "POL", "Green"),
    ],
  },
  {
    id: "og-pickleball",
    slug: "og-pickleball",
    name: "OG PICKLEBALL",
    category: "Pickleball",
    collectionIds: ["pickleball"],
    basePrice: 900,
    price: 900,
    image: "/images/product-pickleball-2.png",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
      { name: "Blue", value: "bg-blue-600" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Cotton",
    description:
      "Core OFFGRID pickleball tee (merged 2.0 / club / lifestyle line). Soft cotton for rallies and off-court days.",
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
    id: "running-line",
    slug: "running-line",
    name: "RUNNING LINE",
    category: "Running",
    basePrice: 1000,
    price: 1000,
    image: "/images/product-running-line.png",
    colors: [
      { name: "White-Teal", value: "bg-white" },
      { name: "Black-Teal", value: "bg-black" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "sleeveless",
    fabricType: "running_mesh",
    material: "Running Mesh",
    description: "Lightweight running singlet for peak performance.",
    shortDescription: "Lightweight running singlet.",
    status: "active",
    sold: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("running-line", "SL", "RUN", "White-Teal"),
      genVariant("running-line", "SL", "RUN", "Black-Teal"),
    ],
  },
  {
    id: "the-og-vibe-collection",
    slug: "the-og-vibe-collection",
    name: "THE OG VIBE COLLECTION",
    category: "Lifestyle / OG Vibe",
    basePrice: 850,
    price: 850,
    image: "/images/product-og-vibe.jpg",
    colors: [
      { name: "Black Steampunk", value: "bg-black" },
      { name: "Cream Steampunk", value: "bg-offgrid-cream" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    sizeRange: "S–2XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Cotton",
    description: "Lifestyle wear for the everyday athlete.",
    shortDescription: "Lifestyle cotton tee.",
    status: "active",
    sold: 430,
    tag: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("the-og-vibe-collection", "SS", "COT", "Black Steampunk"),
      genVariant("the-og-vibe-collection", "SS", "COT", "Cream Steampunk"),
    ],
  },
  {
    id: "og-solar-sleeveless",
    slug: "og-solar-sleeveless",
    name: "OG SOLAR SLEEVELESS",
    category: "Solar Collection",
    basePrice: 900,
    price: 900,
    image: "/images/product-solar-sleeveless.jpg",
    colors: [
      { name: "White-Teal", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "sleeveless",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Sleeveless drifit top for hot days.",
    shortDescription: "Sleeveless drifit top.",
    status: "active",
    sold: 95,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-primal-longsleeve",
    slug: "og-primal-longsleeve",
    name: "OG PRIMAL LONGSLEEVE",
    category: "Primal Collection",
    basePrice: 990,
    price: 990,
    image: "/images/product-primal-longsleeve.jpg",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Premium longsleeve performance wear.",
    shortDescription: "Premium longsleeve.",
    status: "active",
    sold: 110,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-primal-sleeveless",
    slug: "og-primal-sleeveless",
    name: "OG PRIMAL SLEEVELESS",
    category: "Primal Collection",
    basePrice: 900,
    price: 900,
    image: "/images/product-primal-sleeveless.jpg",
    colors: [
      { name: "Black-Neon Green", value: "bg-black" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "sleeveless",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Primal sleeveless top.",
    shortDescription: "Primal sleeveless top.",
    status: "active",
    sold: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-solar-longsleeve",
    slug: "og-solar-longsleeve",
    name: "OG SOLAR LONGSLEEVE",
    category: "Solar Collection",
    basePrice: 900,
    price: 900,
    image: "/images/product-solar-longsleeve.jpg",
    colors: [
      { name: "White-Teal", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Solar longsleeve for ultimate protection.",
    shortDescription: "Solar longsleeve.",
    status: "active",
    sold: 75,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-primal-shortsleeve",
    slug: "og-primal-shortsleeve",
    name: "OG PRIMAL SHORTSLEEVE",
    category: "Primal Collection",
    basePrice: 900,
    price: 900,
    image: "/images/product-primal-shortsleeve.jpg",
    colors: [
      { name: "Teal-White", value: "bg-teal-500" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Shortsleeve primal top.",
    shortDescription: "Shortsleeve primal top.",
    status: "active",
    sold: 140,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-solar-shortsleeve",
    slug: "og-solar-shortsleeve",
    name: "OG SOLAR SHORTSLEEVE",
    category: "Solar Collection",
    basePrice: 700,
    price: 700,
    image: "/images/product-solar-shortsleeve.jpg",
    colors: [
      { name: "White-Teal", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description: "Solar shortsleeve.",
    shortDescription: "Solar shortsleeve.",
    status: "active",
    sold: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "everyday-is-pickle-day",
    slug: "everyday-is-pickle-day",
    name: "EVERYDAY IS PICKLE DAY",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product-everyday-pickle.png",
    colors: [
      { name: "White-Pink", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Everyday is pickle day tee.",
    shortDescription: "Pickle day tee.",
    status: "active",
    sold: 230,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      { ...genVariant("everyday-is-pickle-day", "SS", "DRF", "White-Pink"), fabricOption: "dri_fit" },
      { ...genVariant("everyday-is-pickle-day", "SS", "RUN", "White-Pink"), fabricOption: "running_mesh" },
    ],
  },
  {
    id: "get-your-dink",
    slug: "get-your-dink",
    name: "GET YOUR DINK",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product-get-your-dink.jpg",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Get your dink on.",
    shortDescription: "Get your dink tee.",
    status: "active",
    sold: 310,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pickleball-lifestyle",
    slug: "pickleball-lifestyle",
    name: "OG PICKLEBALL — LIFESTYLE",
    category: "Pickleball",
    collectionIds: ["pickleball"],
    basePrice: 1100,
    price: 1100,
    image: "/images/product-pickleball-lifestyle.png",
    colors: [
      { name: "White", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description:
      "Lifestyle cut in the merged OFFGRID pickleball line — court-to-street tee in breathable drifit.",
    shortDescription: "Pickleball lifestyle cut · drifit.",
    status: "active",
    sold: 180,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "salmon-smasher",
    slug: "salmon-smasher",
    name: "SALMON SMASHER",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product-salmon-smasher.png",
    colors: [
      { name: "Salmon", value: "bg-[#FA8072]" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Smash like a salmon.",
    shortDescription: "Salmon smasher tee.",
    status: "active",
    sold: 105,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-dink-different",
    slug: "og-dink-different",
    name: "OG DINK DIFFERENT",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product-dink-different.png",
    colors: [
      { name: "Black", value: "bg-black" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Dink different.",
    shortDescription: "Dink different tee.",
    status: "active",
    sold: 215,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-pickleball-club",
    slug: "og-pickleball-club",
    name: "OG PICKLEBALL — CLUB",
    category: "Pickleball",
    collectionIds: ["pickleball"],
    basePrice: 1100,
    price: 1100,
    image: "/images/product-pickle-club.png",
    colors: [
      { name: "White", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit",
    description:
      "Club cut in the merged OFFGRID pickleball line — clean team look for league nights and open play.",
    shortDescription: "Pickleball club cut · drifit.",
    status: "active",
    sold: 280,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
  if (["Ultimate Frisbee", "Frisbee", "Solar Collection", "Primal Collection"].includes(product.category)) {
    return ["Ultimate Frisbee"];
  }
  if (product.category === "Lifestyle / OG Vibe") return ["Lifestyle"];
  return [product.category];
}

export function getProductTags(product: Product): string[] {
  if (product.tags?.length) return product.tags;
  return product.tag?.trim() ? [product.tag.trim()] : [];
}

const SPORT_PRIORITY = ["Ultimate Frisbee", "Pickleball", "Golf", "Running", "Lifestyle"];

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
