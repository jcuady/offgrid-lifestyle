import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { formatPrice, Product } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

type SortOption = "newest" | "price-asc" | "price-desc" | "bestselling" | "name-asc";

export function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const products = useSiteContentStore((state) => state.products);
  const initialCategoryParam = searchParams.get("category") ?? "all";
  
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, searchQuery]);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))].sort((a, b) =>
      a.localeCompare(b),
    );
    return [
      { value: "all", label: "All Products", count: products.length },
      ...unique.map((cat) => ({
        value: cat,
        label: cat,
        count: products.filter((p) => p.category === cat).length,
      })),
    ];
  }, [products]);

  useEffect(() => {
    if (categories.some((entry) => entry.value === selectedCategory)) return;
    setSelectedCategory("all");
  }, [categories, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
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
          return 0; // newest (default order)
      }
    });
  }, [products, selectedCategory, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const handleProductClick = (product: Product) => {
    navigate(`/shop/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-offgrid-cream">
      {/* Shop Header */}
      <div className="bg-offgrid-green text-offgrid-cream py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/80 mb-4">
              Shop All
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.9] mb-4">
              The Full<br />
              <span className="italic font-normal text-white">Collection</span>
            </h1>
            <p className="text-offgrid-cream/70 text-sm md:text-base max-w-lg">
              Premium Filipino sportswear for those who play different.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters & Controls Bar */}
      <div className="sticky top-[72px] z-30 bg-offgrid-cream/95 backdrop-blur-md border-b border-offgrid-green/10 py-4">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-offgrid-green/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-offgrid-green/20 focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25 outline-none transition-all text-sm text-offgrid-green bg-white placeholder:text-offgrid-green/40"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-offgrid-green/20 text-sm font-medium text-offgrid-green hover:bg-offgrid-green/5 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Category Filter - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                      selectedCategory === cat.value
                        ? "bg-offgrid-green text-offgrid-cream"
                        : "bg-white text-offgrid-green/60 hover:bg-offgrid-green/5 border border-offgrid-green/10"
                    )}
                  >
                    {cat.label}
                    <span className="ml-1.5 font-mono opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-offgrid-green/20 text-sm font-medium text-offgrid-green bg-white cursor-pointer hover:bg-offgrid-green/5 transition-colors outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-offgrid-green/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Category Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="md:hidden mt-4 pt-4 border-t border-offgrid-green/10"
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setShowFilters(false);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                      selectedCategory === cat.value
                        ? "bg-offgrid-green text-offgrid-cream"
                        : "bg-white text-offgrid-green/60 hover:bg-offgrid-green/5 border border-offgrid-green/10"
                    )}
                  >
                    {cat.label}
                    <span className="ml-1.5 font-mono opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Results Count */}
        <div className="mb-8">
          <p className="text-sm text-offgrid-green/60">
            Showing <span className="font-bold text-offgrid-green">{filteredAndSortedProducts.length}</span> products
            {selectedCategory !== "all" && (
              <span> in <span className="font-bold text-offgrid-green">{selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> for "<span className="font-bold text-offgrid-green">{searchQuery}</span>"</span>
            )}
          </p>
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-offgrid-green/5 flex items-center justify-center">
              <Search className="w-12 h-12 text-offgrid-green/30" />
            </div>
            <h3 className="text-2xl font-display font-bold text-offgrid-green mb-2">No products found</h3>
            <p className="text-offgrid-green/60 mb-6">Try adjusting your search or filters</p>
            <Button
              variant="default"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${product.name}`}
                  className="group flex w-full cursor-pointer flex-col text-left outline-none"
                  onClick={() => handleProductClick(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleProductClick(product);
                    }
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-offgrid-green/[0.08] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-offgrid-lime/40 group-focus-visible:ring-2 group-focus-visible:ring-offgrid-lime">
                    {product.tag && (
                      <span className="absolute top-3 left-3 z-10 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                        {product.tag}
                      </span>
                    )}

                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />

                    <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-offgrid-green/95 px-4 py-3 text-center backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
                      <span className="inline-flex items-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                        View product
                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-4 px-0.5">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/45">
                        {product.category}
                      </p>
                      <p className="shrink-0 font-display text-sm font-black tabular-nums tracking-tight text-offgrid-green">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <h3 className="mb-3 font-display text-base font-bold leading-tight text-offgrid-green transition-colors group-hover:text-offgrid-lime">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between border-t border-offgrid-green/10 pt-3">
                      <div className="flex gap-1.5">
                        {product.colors.map((color, i) => (
                          <span
                            key={i}
                            className={`h-3.5 w-3.5 rounded-full border border-offgrid-green/20 ${color.value}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-offgrid-green/55">
                        <Star className="h-3 w-3 fill-offgrid-green text-offgrid-green" />
                        <span className="font-bold text-offgrid-green">{product.sold}</span> sold
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16 pt-8 border-t border-offgrid-green/10">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5 disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white disabled:cursor-not-allowed transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-lime"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className={cn(
                        "min-w-[2.5rem] h-10 px-3 rounded-xl flex items-center justify-center font-mono text-sm font-bold tabular-nums transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-lime",
                        currentPage === i + 1
                          ? "bg-offgrid-green text-offgrid-cream border border-transparent shadow-md"
                          : "bg-white border border-offgrid-green/20 text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <div className="sm:hidden text-sm font-bold text-offgrid-green px-5 py-2.5 border border-offgrid-green/20 rounded-xl bg-white">
                  {currentPage} <span className="text-offgrid-green/50 font-semibold mx-1">/</span> {totalPages}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5 disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white disabled:cursor-not-allowed transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-lime"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-offgrid-green text-offgrid-cream py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">
              Free Shipping Over ₱2,000
            </h2>
            <p className="text-offgrid-cream/70 mb-8 max-w-lg mx-auto">
              Mix and match any pieces. Ships nationwide across the Philippines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/")}
              >
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
    </div>
  );
}
