import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, Product } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

type SortOption = "newest" | "price-asc" | "price-desc" | "bestselling" | "name-asc";

export function ShopPage() {
  const navigate = useNavigate();
  const products = useSiteContentStore((state) => state.products);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
            <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-lime mb-4">
              Shop All
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.9] mb-4">
              The Full<br />
              <span className="italic font-normal text-offgrid-lime">Collection</span>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm text-offgrid-green bg-white placeholder:text-offgrid-green/40"
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
                    <span className="ml-1.5 opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-offgrid-green/20 text-sm font-medium text-offgrid-green bg-white cursor-pointer hover:bg-offgrid-green/5 transition-colors outline-none focus:border-offgrid-green"
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
                    <span className="ml-1.5 opacity-60">({cat.count})</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white mb-4">
                    {product.tag && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                        {product.tag}
                      </span>
                    )}
                    
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50">
                        {product.category}
                      </p>
                      <p className="font-bold text-offgrid-green text-sm">{formatPrice(product.price)}</p>
                    </div>
                    <h3 className="text-base font-display font-bold text-offgrid-green mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex gap-1.5">
                      {product.colors.map((color, i) => (
                        <div 
                          key={i} 
                          className={`w-3.5 h-3.5 rounded-full border border-offgrid-green/20 ${color.value}`}
                        />
                      ))}
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5 disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white disabled:cursor-not-allowed transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-green"
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
                        "min-w-[2.5rem] h-10 px-3 rounded-xl flex items-center justify-center text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-green",
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5 disabled:opacity-40 disabled:hover:border-offgrid-green/20 disabled:hover:bg-white disabled:cursor-not-allowed transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-green"
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
