import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/src/store/store";
import { formatPrice } from "@/src/data/products";
import { Button } from "./ui/Button";
import { cn } from "@/src/lib/utils";

export function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart, toggleCart } = useStore(
    useShallow((state) => ({
      selectedProduct: state.selectedProduct,
      setSelectedProduct: state.setSelectedProduct,
      addToCart: state.addToCart,
      toggleCart: state.toggleCart,
    })),
  );
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedSize("M");
    setSelectedColor("");
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const colorName =
      selectedProduct.colors.find((c) => c.value === selectedColor)?.name ||
      selectedProduct.colors[0].name;
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

  const activeColor =
    selectedProduct.colors.find((c) => c.value === selectedColor) ||
    selectedProduct.colors[0];

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-offgrid-dark/75 backdrop-blur-sm p-3 sm:p-5"
        onClick={handleClose}
      >
        <motion.div
          key="modal-panel"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-offgrid-cream rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-offgrid-green hover:text-offgrid-cream transition-colors shadow-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* ── Left: Image ── */}
            <div className="relative bg-white">
              {/* Tag */}
              {selectedProduct.tag && (
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-offgrid-dark/80 backdrop-blur-sm text-offgrid-cream text-[9px] font-bold tracking-[0.18em] uppercase rounded-full">
                  {selectedProduct.tag}
                </span>
              )}
              {/* Sold social proof */}
              <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[9px] font-semibold tracking-[0.15em] uppercase rounded-full">
                {selectedProduct.sold.toLocaleString("en-PH")} sold
              </span>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full aspect-square md:h-full md:aspect-auto object-cover"
              />
            </div>

            {/* ── Right: Details ── */}
            <div className="flex flex-col p-5 sm:p-6 gap-4">

              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-offgrid-green/45">
                    {selectedProduct.category}
                  </span>
                  {/* Cut badge */}
                  <span className="text-[9px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full bg-offgrid-green/8 text-offgrid-green/60">
                    {selectedProduct.cut}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-offgrid-green leading-tight">
                  {selectedProduct.name}
                </h2>
                <p className="text-xl font-display font-bold text-offgrid-lime mt-0.5">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              {/* Description — clamped to 2 lines */}
              <p className="text-sm text-offgrid-green/65 leading-relaxed line-clamp-2">
                {selectedProduct.description}
              </p>

              {/* Material + Fit row */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-medium text-offgrid-green/60 bg-offgrid-green/6 border border-offgrid-green/10 px-2.5 py-1 rounded-lg">
                  {selectedProduct.material}
                </span>
                <span className="text-[10px] font-medium text-offgrid-green/60 bg-offgrid-green/6 border border-offgrid-green/10 px-2.5 py-1 rounded-lg">
                  {selectedProduct.fit}
                </span>
              </div>

              {/* Color */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-offgrid-green mb-2">
                  Color —{" "}
                  <span className="font-semibold text-offgrid-green/60 normal-case tracking-normal">
                    {activeColor.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {selectedProduct.colors.map((color) => {
                    const isSelected =
                      selectedColor === color.value ||
                      (!selectedColor && color === selectedProduct.colors[0]);
                    return (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center",
                          isSelected
                            ? "border-offgrid-green scale-110 shadow"
                            : "border-offgrid-green/20 hover:border-offgrid-green/50",
                        )}
                      >
                        <div className={cn("w-full h-full rounded-full", color.value)} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-offgrid-green">
                    Size
                  </p>
                  <span className="text-[9px] text-offgrid-green/40 font-medium">
                    {selectedProduct.sizeRange}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border",
                        selectedSize === size
                          ? "bg-offgrid-green text-offgrid-cream border-offgrid-green"
                          : "bg-transparent text-offgrid-green border-offgrid-green/25 hover:border-offgrid-green",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + CTA row */}
              <div className="flex items-center gap-3 mt-auto">
                {/* Stepper */}
                <div className="flex items-center gap-2 border border-offgrid-green/20 rounded-full px-3 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-offgrid-green/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-display font-bold text-offgrid-green w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-offgrid-green/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 group h-11"
                >
                  <ShoppingBag className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add to Cart — {formatPrice(selectedProduct.price * quantity)}
                </Button>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
