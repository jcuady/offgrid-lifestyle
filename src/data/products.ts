export interface ProductColor {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  colors: ProductColor[];
  sizes: string[];
  description: string;
  material: string;
  fit: string;
  sold: number;
  tag?: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "OG Court Polo",
    category: "Pickleball",
    price: 1100,
    image: "/images/product_polo.png",
    colors: [
      { name: "Cream", value: "bg-offgrid-cream" },
      { name: "Forest Green", value: "bg-offgrid-green" },
      { name: "Lime", value: "bg-offgrid-lime" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description:
      "Engineered for the court, styled for the culture. The OG Court Polo features moisture-wicking fabric with a relaxed fit that moves with you during intense rallies. The classic polo silhouette gets an OffGrid upgrade with subtle branding and premium stitching.",
    material: "92% Polyester, 8% Spandex — Moisture-wicking, quick-dry fabric",
    fit: "Relaxed fit with dropped shoulders. Model is 5'10\" wearing size M.",
    sold: 312,
    tag: "Best Seller",
    stock: 45,
  },
  {
    id: "p2",
    name: "Fairway Tee",
    category: "Golf",
    price: 1100,
    image: "/images/product_tee_white.png",
    colors: [
      { name: "Charcoal", value: "bg-offgrid-dark" },
      { name: "Lime", value: "bg-offgrid-lime" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description:
      "Sunrise to sunset, the Fairway Tee keeps you looking sharp across all 18 holes. Crafted from ultra-soft, breathable fabric with just the right amount of stretch for your full swing. Minimal design, maximum performance.",
    material: "95% Micro Polyester, 5% Elastane — 4-way stretch, UV protection",
    fit: "Tailored fit with slightly longer back hem. Model is 6'0\" wearing size L.",
    sold: 248,
    tag: "New",
    stock: 38,
  },
  {
    id: "p3",
    name: "Pilipinas Drop Tee",
    category: "OG Pilipinas",
    price: 1100,
    image: "/images/product_tee_graphic.png",
    colors: [
      { name: "Cream", value: "bg-offgrid-cream" },
      { name: "Charcoal", value: "bg-offgrid-dark" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description:
      "Rep the nation with pride. The Pilipinas Drop Tee features an exclusive graphic design celebrating Filipino athletic culture. Limited edition drop — once it's gone, it's gone. Perfect for everyday wear or showing up to the courts.",
    material: "100% Premium Cotton — Heavyweight 220 GSM, pre-shrunk",
    fit: "Oversized drop-shoulder fit. Model is 5'8\" wearing size S.",
    sold: 189,
    tag: "PH Limited",
    stock: 22,
  },
  {
    id: "p4",
    name: "Off-Day Shorts",
    category: "Everyday Wear",
    price: 1100,
    image: "/images/product_shorts.png",
    colors: [
      { name: "Forest Green", value: "bg-offgrid-green" },
      { name: "Charcoal", value: "bg-offgrid-dark" },
      { name: "Cream", value: "bg-offgrid-cream" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description:
      "Your go-to shorts for rest days, errands, or spontaneous court sessions. The Off-Day Shorts combine comfort with clean aesthetics — featuring an elastic waistband, deep pockets, and that signature OffGrid minimal style.",
    material: "88% Nylon, 12% Spandex — Stretch woven, water-resistant",
    fit: "Relaxed fit with 7\" inseam. Model is 5'10\" wearing size M.",
    sold: 156,
    stock: 52,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH")}`;
}
