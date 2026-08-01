import { getProductSports, getProductTags, type Product } from "@/src/data/products";

export type AdminStockFilter = "all" | "in" | "out";
export type AdminStatusFilter = "all" | NonNullable<Product["status"]>;

export interface AdminProductFilters {
  query: string;
  status: AdminStatusFilter;
  sport: string; // "all" or exact sport label
  tag: string; // "all" or exact tag label
  stock: AdminStockFilter;
}

function haystack(product: Product): string {
  return [
    product.name,
    product.slug,
    product.category,
    product.description,
    product.shortDescription ?? "",
    product.material,
    product.fit ?? "",
    ...(product.sizes ?? []),
    ...getProductSports(product),
    ...getProductTags(product),
    product.status ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function filterAdminProducts(
  products: readonly Product[],
  filters: AdminProductFilters,
): Product[] {
  const q = filters.query.trim().toLowerCase();
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return sorted.filter((product) => {
    if (filters.status !== "all" && (product.status ?? "draft") !== filters.status) return false;

    if (filters.sport !== "all") {
      const sports = getProductSports(product);
      if (!sports.some((sport) => sport.toLowerCase() === filters.sport.toLowerCase())) return false;
    }

    if (filters.tag !== "all") {
      const tags = getProductTags(product);
      if (!tags.some((tag) => tag.toLowerCase() === filters.tag.toLowerCase())) return false;
    }

    const stock = product.stock;
    if (filters.stock === "in") {
      // Unlimited (null/undefined) counts as in stock
      if (stock !== null && stock !== undefined && stock <= 0) return false;
    }
    if (filters.stock === "out") {
      if (stock === null || stock === undefined || stock > 0) return false;
    }

    if (q && !haystack(product).includes(q)) return false;
    return true;
  });
}
