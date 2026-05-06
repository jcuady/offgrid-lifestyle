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
  category: string;
  collectionIds?: string[];
  basePrice: number;
  price: number; // Keep for backward compatibility temporarily
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
  tag?: string;
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

export const products: Product[] = [
  {
    id: "og-motoline",
    slug: "motoline",
    name: "MOTOLINE",
    category: "Running",
    basePrice: 650,
    price: 650,
    image: "/images/product_tee_graphic.png", // Using existing placeholder until real images arrive
    colors: [
      { name: "FULL THROTTLE", value: "bg-offgrid-dark" },
      { name: "TAKBONG OG", value: "bg-offgrid-green" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "long_sleeve",
    fabricType: "dri_fit",
    material: "Premium Drifit",
    description: "Motoline running gear. Built for gritty street runs.",
    shortDescription: "Long sleeve drifit running gear.",
    status: "draft",
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
    basePrice: 1200,
    price: 1200,
    image: "/images/product_polo.png",
    colors: [
      { name: "Pink", value: "bg-[#FFC0CB]" },
      { name: "Navy Blue", value: "bg-blue-900" },
      { name: "Green", value: "bg-offgrid-green" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "S–5XL",
    cut: "short_sleeve",
    fabricType: "poly_blend",
    material: "Polo shirt material",
    description: "Premium golf polo with optimal stretch for the fairway.",
    shortDescription: "Premium golf polo.",
    status: "draft",
    sold: 210,
    tag: "Best Seller",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("og-golf", "SS", "POL", "Pink"),
      genVariant("og-golf", "SS", "POL", "Navy Blue"),
      genVariant("og-golf", "SS", "POL", "Green"),
    ],
  },
  {
    id: "og-pickleball-2-0",
    slug: "og-pickleball-2-0",
    name: "OG PICKLEBALL 2.0",
    category: "Pickleball",
    basePrice: 900,
    price: 900,
    image: "/images/product_tee_white.png",
    colors: [
      { name: "Green", value: "bg-offgrid-green" },
      { name: "Blue", value: "bg-blue-600" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "cotton",
    material: "Cotton",
    description: "Classic cotton pickleball tee for on and off the court.",
    shortDescription: "Classic cotton pickleball tee.",
    status: "draft",
    sold: 342,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      genVariant("og-pickleball-2-0", "SS", "COT", "Green"),
      genVariant("og-pickleball-2-0", "SS", "COT", "Blue"),
    ],
  },
  {
    id: "running-line",
    slug: "running-line",
    name: "RUNNING LINE",
    category: "Running",
    basePrice: 1000,
    price: 1000,
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_white.png",
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
    status: "draft",
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
    image: "/images/product_tee_white.png",
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
    status: "draft",
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
    image: "/images/product_tee_white.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
    sold: 310,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pickleball-lifestyle",
    slug: "pickleball-lifestyle",
    name: "PICKLEBALL LIFESTYLE",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product_tee_white.png",
    colors: [
      { name: "White", value: "bg-white" },
    ],
    sizes: ["S", "M", "L", "XL"],
    sizeRange: "S–XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Pickleball lifestyle wear.",
    shortDescription: "Pickleball lifestyle tee.",
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
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
    image: "/images/product_tee_graphic.png",
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
    status: "draft",
    sold: 215,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "og-pickleball-club",
    slug: "og-pickleball-club",
    name: "OG PICKLEBALL CLUB",
    category: "Pickleball",
    basePrice: 1100,
    price: 1100,
    image: "/images/product_tee_white.png",
    colors: [
      { name: "White", value: "bg-white" },
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS–3XL",
    cut: "short_sleeve",
    fabricType: "dri_fit",
    material: "Drifit or Running",
    description: "Join the OG pickleball club.",
    shortDescription: "Pickleball club tee.",
    status: "draft",
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
