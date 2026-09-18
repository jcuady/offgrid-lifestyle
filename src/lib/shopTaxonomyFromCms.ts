import type { Product } from "@/src/data/products";
import type { CatalogTerm } from "@/src/services/catalogTermsService";
import type { ShopTaxonomyLink } from "@/src/lib/shopTaxonomy";

export function shopCollectionHref(slug: string): string {
  return `/shop?collection=${encodeURIComponent(slug)}`;
}

export function shopSportHref(label: string): string {
  return `/shop?category=${encodeURIComponent(label)}`;
}

function sortPublishedTerms(terms: CatalogTerm[]): CatalogTerm[] {
  return [...terms]
    .filter((t) => t.published)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function catalogCollectionsToShopLinks(terms: CatalogTerm[]): ShopTaxonomyLink[] {
  return sortPublishedTerms(terms.filter((t) => t.kind === "collection")).map((t) => ({
    label: t.label,
    category: t.slug,
    href: shopCollectionHref(t.slug),
    description: t.description?.trim() || "",
  }));
}

export function catalogSportsToShopLinks(terms: CatalogTerm[]): ShopTaxonomyLink[] {
  return sortPublishedTerms(terms.filter((t) => t.kind === "sport")).map((t) => ({
    label: t.label,
    category: t.label,
    href: shopSportHref(t.label),
    description: t.description?.trim() || "",
  }));
}

/** Match product.collectionIds by slug (case-insensitive). */
export function productMatchesCollectionSlug(product: Product, slug: string): boolean {
  const needle = slug.trim().toLowerCase();
  if (!needle) return false;
  return (product.collectionIds ?? []).some((id) => id.trim().toLowerCase() === needle);
}

export function collectionTermImage(term: CatalogTerm, fallback = ""): string {
  return term.imageUrl?.trim() || fallback;
}
