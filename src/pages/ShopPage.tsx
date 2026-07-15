import { useState, useMemo, useEffect, useRef, Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { compareSports, formatPrice, getProductSports, getProductTags, Product } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/input";
import { ProductCard } from "@/src/components/ProductCard";
import { ProductQuickViewModal } from "@/src/components/ProductQuickViewModal";
import { FeaturedSpotlight } from "@/src/components/FeaturedSpotlight";
import { cn } from "@/src/lib/utils";
import { marketingPageHero, siteContainer, stickyBelowNav } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateProductsFromSupabase } from "@/src/services";

type SortOption = "newest" | "price-asc" | "price-desc" | "bestselling" | "name-asc";

const ITEMS_PER_PAGE = 12;

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  bestselling: "Best Selling",
  "name-asc": "Name A–Z",
};

export function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const allProducts = useSiteContentStore((state) => state.products);
  const initialCategoryParam = searchParams.get("category") ?? "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [priceBucket, setPriceBucket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const gridTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void hydrateProductsFromSupabase();
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") ?? "all");
  }, [searchParams]);

  // Storefront only lists purchasable active items (DB rejects draft/archived at checkout).
  const products = useMemo(
    () => allProducts.filter((p) => p.status === "active"),
    [allProducts],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTag, priceBucket, sortBy, searchQuery]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const categories = useMemo(() => {
    const unique = [...new Set(products.flatMap(getProductSports))].sort(compareSports);
    return [
      { value: "all", label: "All Products", count: products.length },
      ...unique.map((cat) => ({
        value: cat,
        label: cat,
        count: products.filter((p) => getProductSports(p).includes(cat)).length,
      })),
    ];
  }, [products]);

  const tags = useMemo(() => {
    const unique = [...new Set(products.flatMap(getProductTags))];
    return unique.sort((a, b) => String(a).localeCompare(String(b)));
  }, [products]);

  // Dynamic price buckets (tertiles) so the filter adapts to the catalog.
  const priceBuckets = useMemo(() => {
    if (products.length === 0) return [];
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (max <= min) return [];
    const lowMax = Math.round((min + (max - min) / 3) / 10) * 10;
    const midMax = Math.round((min + (2 * (max - min)) / 3) / 10) * 10;
    return [
      { value: "low", label: `Under ${formatPrice(lowMax)}`, test: (p: Product) => p.price <= lowMax },
      {
        value: "mid",
        label: `${formatPrice(lowMax)} – ${formatPrice(midMax)}`,
        test: (p: Product) => p.price > lowMax && p.price <= midMax,
      },
      { value: "high", label: `Over ${formatPrice(midMax)}`, test: (p: Product) => p.price > midMax },
    ];
  }, [products]);

  useEffect(() => {
    if (categories.some((entry) => entry.value === selectedCategory)) return;
    setSelectedCategory("all");
  }, [categories, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => getProductSports(p).includes(selectedCategory));
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((p) => getProductTags(p).includes(selectedTag));
    }

    if (priceBucket !== "all") {
      const bucket = priceBuckets.find((b) => b.value === priceBucket);
      if (bucket) filtered = filtered.filter(bucket.test);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          getProductSports(p).some((sport) => sport.toLowerCase().includes(query)) ||
          getProductTags(p).some((tag) => tag.toLowerCase().includes(query)) ||
          p.description.toLowerCase().includes(query),
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "bestselling":
          return b.sold - a.sold;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [products, selectedCategory, selectedTag, priceBucket, priceBuckets, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = Math.min(pageStart + ITEMS_PER_PAGE, filteredAndSortedProducts.length);
  const paginatedProducts = useMemo(
    () => filteredAndSortedProducts.slice(pageStart, pageStart + ITEMS_PER_PAGE),
    [filteredAndSortedProducts, pageStart],
  );

  const pageNumbers = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const advancedFilterCount = (selectedTag !== "all" ? 1 : 0) + (priceBucket !== "all" ? 1 : 0);
  const hasActiveFilters =
    selectedCategory !== "all" || selectedTag !== "all" || priceBucket !== "all" || searchQuery.trim().length > 0;

  const clearAll = () => {
    setSelectedCategory("all");
    setSelectedTag("all");
    setPriceBucket("all");
    setSearchQuery("");
  };

  const handleProductClick = (product: Product) => {
    setQuickViewProduct(product);
  };

  const priceBucketLabel = priceBuckets.find((b) => b.value === priceBucket)?.label;

  const isCategoryView = selectedCategory !== "all";
  const activeCategoryLabel = isCategoryView
    ? categories.find((c) => c.value === selectedCategory)?.label ?? selectedCategory
    : "";

  return (
    <div id="main" className="min-h-screen bg-offgrid-cream">
      {/* Shop Header — category-aware so deep links feel intentional */}
      <div className={marketingPageHero}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-offgrid-lime/10 blur-3xl" />
        <div className={cn(siteContainer, "relative")}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80 sm:mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
              {isCategoryView ? "Shop By Sport" : "Shop All"} · {filteredAndSortedProducts.length} Pieces
            </span>
            <h1 className="mb-3 font-display text-3xl font-black leading-[0.9] sm:mb-4 sm:text-5xl md:text-6xl lg:text-7xl">
              {isCategoryView ? (
                <>
                  {activeCategoryLabel}
                  <span className="block italic font-normal text-white sm:inline sm:ml-3">Collection</span>
                </>
              ) : (
                <>
                  The Full <span className="italic font-normal text-white sm:hidden">Collection</span>
                  <span className="hidden sm:inline">
                    <br />
                    <span className="italic font-normal text-white">Collection</span>
                  </span>
                </>
              )}
            </h1>
            <p className="max-w-lg text-sm text-offgrid-cream/70 md:text-base">
              Premium Filipino sportswear for those who play different. Filter by sport, drop, or price — find your fit.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Featured spotlight */}
      <FeaturedSpotlight placement="shop" />

      {/* Filters & Controls Bar */}
      <div className={cn("z-30 border-b border-offgrid-green/10 bg-offgrid-cream/95 py-3 backdrop-blur-md sm:py-4", stickyBelowNav)}>
        <div className={siteContainer}>
          <div className="flex items-center gap-2 sm:gap-3 md:justify-between md:gap-6">
            {/* Search */}
            <div className="relative min-w-0 flex-1 md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-11"
                aria-label="Search products"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-offgrid-green/40 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-label="Filters"
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                  showFilters || advancedFilterCount > 0
                    ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                    : "border-offgrid-green/20 text-offgrid-green hover:bg-offgrid-green/5",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {advancedFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-offgrid-lime px-1 font-mono text-[10px] font-bold text-white">
                    {advancedFilterCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort products"
                  className="min-h-11 cursor-pointer appearance-none rounded-xl border border-offgrid-green/20 bg-white py-2.5 pl-3 pr-9 text-base font-medium text-offgrid-green outline-none transition-colors hover:bg-offgrid-green/5 focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 sm:pl-4 sm:pr-10 sm:text-sm"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((value) => (
                    <option key={value} value={value}>
                      {SORT_LABELS[value]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-offgrid-green/40 sm:right-3" />
              </div>
            </div>
          </div>

          {/* Sport chips are derived from live admin product assignments. */}
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "min-h-11 rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:px-4",
                  selectedCategory === cat.value
                    ? "bg-offgrid-green text-offgrid-cream"
                    : "border border-offgrid-green/10 bg-white text-offgrid-green/60 hover:bg-offgrid-green/5",
                )}
              >
                {cat.label}
                <span className="ml-1.5 font-mono opacity-60">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 grid gap-5 overflow-hidden border-t border-offgrid-green/10 pt-4 sm:grid-cols-2"
            >
              {tags.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/50">
                    Promos & Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={selectedTag === "all"} onClick={() => setSelectedTag("all")}>
                      All
                    </FilterChip>
                    {tags.map((tag) => (
                      <Fragment key={tag}>
                        <FilterChip active={selectedTag === tag} onClick={() => setSelectedTag(tag)}>
                          {tag}
                        </FilterChip>
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}

              {priceBuckets.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/50">
                    Price range
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={priceBucket === "all"} onClick={() => setPriceBucket("all")}>
                      Any price
                    </FilterChip>
                    {priceBuckets.map((bucket) => (
                      <Fragment key={bucket.value}>
                        <FilterChip
                          active={priceBucket === bucket.value}
                          onClick={() => setPriceBucket(bucket.value)}
                        >
                          {bucket.label}
                        </FilterChip>
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-offgrid-green/10 pt-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
                Active
              </span>
              {selectedCategory !== "all" && (
                <ActiveChip label={selectedCategory} onRemove={() => setSelectedCategory("all")} />
              )}
              {selectedTag !== "all" && <ActiveChip label={selectedTag} onRemove={() => setSelectedTag("all")} />}
              {priceBucket !== "all" && priceBucketLabel && (
                <ActiveChip label={priceBucketLabel} onRemove={() => setPriceBucket("all")} />
              )}
              {searchQuery.trim() && (
                <ActiveChip label={`"${searchQuery.trim()}"`} onRemove={() => setSearchQuery("")} />
              )}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-offgrid-green/60 underline-offset-4 hover:text-offgrid-green hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div
        ref={gridTopRef}
        className={cn(siteContainer, "scroll-mt-40 py-10 sm:py-12 md:py-16")}
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 sm:mb-8">
          <p className="text-sm text-offgrid-green/60">
            Showing{" "}
            <span className="font-bold text-offgrid-green">
              {filteredAndSortedProducts.length === 0 ? 0 : pageStart + 1}–{pageEnd}
            </span>{" "}
            of <span className="font-bold text-offgrid-green">{filteredAndSortedProducts.length}</span> products
          </p>
          {totalPages > 1 && (
            <p className="font-mono text-xs text-offgrid-green/45">
              Page {currentPage} / {totalPages}
            </p>
          )}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-offgrid-green/5">
              <Search className="h-12 w-12 text-offgrid-green/30" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-bold text-offgrid-green">No products found</h3>
            <p className="mb-6 text-offgrid-green/60">Try adjusting your search or filters</p>
            <Button variant="default" onClick={clearAll}>
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10 md:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
                >
                  <ProductCard product={product} onSelect={handleProductClick} />
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-center gap-2 border-t border-offgrid-green/10 pt-8 sm:mt-16 sm:gap-3"
              >
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-offgrid-green/20 bg-white text-offgrid-green outline-none transition-all hover:border-offgrid-green/50 hover:bg-offgrid-green/5 focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {pageNumbers.map((page, i) =>
                    page === "ellipsis" ? (
                      <span
                        key={`gap-${i}`}
                        className="select-none px-1 font-mono text-sm text-offgrid-green/40"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={cn(
                          "flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl px-3 font-mono text-sm font-bold tabular-nums outline-none transition-all focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2",
                          currentPage === page
                            ? "border border-transparent bg-offgrid-green text-offgrid-cream shadow-md"
                            : "border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-offgrid-green/20 bg-white text-offgrid-green outline-none transition-all hover:border-offgrid-green/50 hover:bg-offgrid-green/5 focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-offgrid-green py-16 text-offgrid-cream md:py-20">
        <div className={cn(siteContainer, "text-center")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-display text-3xl font-black md:text-5xl">Free Shipping Over ₱2,000</h2>
            <p className="mx-auto mb-8 max-w-lg text-offgrid-cream/70">
              Mix and match any pieces. Ships nationwide across the Philippines.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="secondary" size="lg" onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-offgrid-cream/50 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
                onClick={() => navigate("/custom")}
              >
                Need Custom Team Gear?
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <ProductQuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-offgrid-green text-offgrid-cream"
          : "border border-offgrid-green/15 bg-white text-offgrid-green/65 hover:bg-offgrid-green/5",
      )}
    >
      {children}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-offgrid-green/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-offgrid-green">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-offgrid-green/60 hover:bg-offgrid-green hover:text-offgrid-cream"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
