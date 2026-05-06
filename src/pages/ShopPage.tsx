import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Filter, SlidersHorizontal, Grid3X3, List, Search, ChevronDown, Star } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/src/store/store";
import { formatPrice, Product } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

type SortOption = "newest" | "price-asc" | "price-desc" | "bestselling" | "name-asc";
type ViewMode = "grid" | "list";

export function ShopPage() {
  const navigate = useNavigate();
  const { setSelectedProduct, addToCart, toggleCart } = useStore(
    useShallow((state) => ({
      setSelectedProduct: state.setSelectedProduct,
      addToCart: state.addToCart,
      toggleCart: state.toggleCart,
    })),
  );
  const products = useSiteContentStore((state) => state.products);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: "all", label: "All Products", count: products.length },
    { value: "Pickleball", label: "Pickleball", count: products.filter(p => p.category === "Pickleball").length },
    { value: "Golf", label: "Golf", count: products.filter(p => p.category === "Golf").length },
    { value: "OG Pilipinas", label: "OG Pilipinas", count: products.filter(p => p.category === "OG Pilipinas").length },
    { value: "Everyday Wear", label: "Everyday Wear", count: products.filter(p => p.category === "Everyday Wear").length },
  ];

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
  }, [selectedCategory, sortBy, searchQuery]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: "M",
      color: product.colors[0].name,
      quantity: 1,
    });
    toggleCart(true);
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

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl border border-offgrid-green/10 bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "grid" ? "bg-offgrid-green text-offgrid-cream" : "text-offgrid-green/40 hover:text-offgrid-green"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "list" ? "bg-offgrid-green text-offgrid-cream" : "text-offgrid-green/40 hover:text-offgrid-green"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
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
          /* Product Grid */
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              : "flex flex-col gap-4"
          )}>
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {viewMode === "grid" ? (
                  /* Grid View */
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
                    
                    {/* Quick Add Button */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <button 
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="w-full bg-offgrid-green text-offgrid-cream py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-offgrid-dark transition-colors shadow-lg"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="flex gap-4 sm:gap-6 bg-white rounded-2xl p-4 sm:p-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-1">
                              {product.category}
                            </p>
                            <h3 className="text-lg font-display font-bold text-offgrid-green">
                              {product.name}
                            </h3>
                          </div>
                          {product.tag && (
                            <span className="px-3 py-1 bg-offgrid-cream/90 text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full flex-shrink-0">
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-offgrid-green/70 line-clamp-2 mb-3 hidden sm:block">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-display font-bold text-offgrid-lime">
                            {formatPrice(product.price)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-offgrid-green/60">
                            <Star className="w-3 h-3 fill-offgrid-green text-offgrid-green" />
                            <span className="font-bold text-offgrid-green">{product.sold}</span> sold
                          </div>
                        </div>
                        <button 
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="px-4 py-2 bg-offgrid-green text-offgrid-cream rounded-xl text-sm font-semibold hover:bg-offgrid-dark transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
