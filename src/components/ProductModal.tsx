import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, ChevronUp, Minus, Plus, ShoppingBag } from "lucide-react";
import { useStore } from "@/src/store/store";
import { Product, formatPrice } from "@/src/data/products";
import { Button } from "./ui/Button";
import { cn } from "@/src/lib/utils";

export function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart, toggleCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const handleClose = () => {
    setSelectedProduct(null);
    resetSelections();
  };

  const resetSelections = () => {
    setSelectedSize("M");
    setSelectedColor("");
    setQuantity(1);
    setShowDetails(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const colorName = selectedProduct.colors.find(c => c.value === selectedColor)?.name || selectedProduct.colors[0].name;
    
    addToCart({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      image: selectedProduct.image,
      price: selectedProduct.price,
      size: selectedSize,
      color: colorName,
      quantity,
    });

    handleClose();
    toggleCart(true);
  };

  if (!selectedProduct) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-offgrid-dark/80 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-offgrid-cream rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-offgrid-cream/90 backdrop-blur-sm flex items-center justify-center hover:bg-offgrid-green hover:text-offgrid-cream transition-colors shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-y-auto">
            {/* Product Image */}
            <div className="relative aspect-square md:aspect-auto bg-white">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {selectedProduct.tag && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                  {selectedProduct.tag}
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8 md:p-10 flex flex-col">
              <div className="mb-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-2">
                  {selectedProduct.category}
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-black text-offgrid-green leading-tight mb-3">
                  {selectedProduct.name}
                </h2>
                <p className="text-2xl font-display font-bold text-offgrid-lime">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              <p className="text-sm text-offgrid-green/70 leading-relaxed mb-8">
                {selectedProduct.description}
              </p>

              {/* Color Selector */}
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-3 block">
                  Color — <span className="text-offgrid-green/60">{selectedProduct.colors.find(c => c.value === selectedColor)?.name || selectedProduct.colors[0].name}</span>
                </label>
                <div className="flex gap-3">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all duration-200",
                        selectedColor === color.value
                          ? "border-offgrid-green scale-110 shadow-md"
                          : "border-offgrid-green/20 hover:border-offgrid-green/40"
                      )}
                    >
                      <div className={cn("w-full h-full rounded-full", color.value)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-3 block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                        selectedSize === size
                          ? "bg-offgrid-green text-offgrid-cream border-offgrid-green"
                          : "bg-transparent text-offgrid-green border-offgrid-green/30 hover:border-offgrid-green"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-3 block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-offgrid-green/30 flex items-center justify-center hover:bg-offgrid-green/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-display font-bold text-offgrid-green w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="w-10 h-10 rounded-full border border-offgrid-green/30 flex items-center justify-center hover:bg-offgrid-green/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="default"
                size="lg"
                onClick={handleAddToCart}
                className="w-full mb-6 group"
              >
                <ShoppingBag className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Add to Cart — {formatPrice(selectedProduct.price * quantity)}
              </Button>

              {/* Material & Fit Accordion */}
              <div className="border-t border-offgrid-green/10 pt-6 mt-auto">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-offgrid-green hover:text-offgrid-lime transition-colors"
                >
                  <span>Material & Fit Details</span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-3 text-sm text-offgrid-green/70">
                        <div>
                          <p className="font-semibold text-offgrid-green mb-1">Material</p>
                          <p>{selectedProduct.material}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-offgrid-green mb-1">Fit</p>
                          <p>{selectedProduct.fit}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
