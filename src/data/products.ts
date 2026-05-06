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
  sizeRange: string;
  cut: string;
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
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS – 3XL",
    cut: "Short Sleeve",
    description:
      "Engineered for the court, styled for the culture. Moisture-wicking polo with relaxed fit — moves with you during intense rallies.",
    material: "92% Polyester, 8% Spandex — Moisture-wicking, quick-dry",
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
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    sizeRange: "XS – 5XL",
    cut: "Short Sleeve",
    description:
      "Sunrise to sunset across all 18 holes. Ultra-soft breathable fabric with 4-way stretch for your full swing. Minimal design, maximum performance.",
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
    sizeRange: "XS – 2XL",
    cut: "Short Sleeve",
    description:
      "Rep the nation with pride. Exclusive graphic celebrating Filipino athletic culture. Limited drop — once it's gone, it's gone.",
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
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeRange: "2XS – 3XL",
    cut: "Shorts",
    description:
      "Your go-to for rest days, errands, or spontaneous court sessions. Elastic waistband, deep pockets, signature OffGrid minimal style.",
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
