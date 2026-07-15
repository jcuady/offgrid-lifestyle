import type { Product } from "@/src/data/products";
import type { LandingFeaturedSpotlightContent } from "@/src/data/landingContent";

export interface FeaturedDisplayItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  price: number;
  tag?: string;
  image: string;
  /** When false, tile links to section CTA instead of a product page. */
  isProduct: boolean;
}

/**
 * Auto picks for featured spotlight when source is not manual.
 * Tagged products first (by sold), then top sellers backfill.
 */
export function selectFeaturedProducts(products: Product[], count = 3): Product[] {
  const live = products.filter((p) => p.status === "active");

  const tagged = live
    .filter((p) => typeof p.tag === "string" && p.tag.trim().length > 0)
    .sort((a, b) => b.sold - a.sold);

  if (tagged.length >= count) return tagged.slice(0, count);

  const taggedIds = new Set(tagged.map((p) => p.id));
  const backfill = live
    .filter((p) => !taggedIds.has(p.id))
    .sort((a, b) => b.sold - a.sold);

  return [...tagged, ...backfill].slice(0, count);
}

function selectBestSellers(products: Product[], count: number): Product[] {
  const ranked = [...products]
    .filter((p) => p.status === "active")
    .filter((p) => typeof p.homeBestSellerRank === "number" && p.homeBestSellerRank > 0)
    .sort((a, b) => (a.homeBestSellerRank ?? 0) - (b.homeBestSellerRank ?? 0));

  if (ranked.length >= count) return ranked.slice(0, count);
  return selectFeaturedProducts(products, count);
}

function toDisplayItem(product: Product, imageOverride = ""): FeaturedDisplayItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    basePrice: product.basePrice,
    price: product.price,
    tag: product.tag,
    image: imageOverride || product.image,
    isProduct: true,
  };
}

/**
 * Resolves featured spotlight tiles from CMS config + product catalog.
 */
export function resolveFeaturedSpotlightItems(
  products: Product[],
  config: LandingFeaturedSpotlightContent,
): FeaturedDisplayItem[] {
  const count = config.layout === "hero" ? 1 : 3;

  if (config.source === "manual") {
    const slots = config.layout === "hero" ? [config.slots[0]] : config.slots;
    const items: FeaturedDisplayItem[] = [];

    for (const [index, slot] of slots.entries()) {
      const product = slot.productId ? products.find((p) => p.id === slot.productId) : undefined;
      const image = slot.imageOverride.trim() || product?.image || "";

      if (!image) continue;

      if (product && product.status === "active") {
        items.push(toDisplayItem(product, slot.imageOverride.trim()));
        continue;
      }

      items.push({
        id: `featured-slot-${index}`,
        name: config.titleLine1,
        slug: "",
        category: config.eyebrow,
        basePrice: 0,
        price: 0,
        image,
        isProduct: false,
      });
    }

    return items;
  }

  return selectBestSellers(products, count).map((product) => toDisplayItem(product));
}
