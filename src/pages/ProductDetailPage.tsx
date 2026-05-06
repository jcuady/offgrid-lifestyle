import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingBag, Star, Minus, Plus, Check } from "lucide-react";
import { useStore } from "@/src/store/store";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { formatPrice } from "@/src/data/products";
import { Button } from "@/src/components/ui/Button";
import { Footer } from "@/src/components/Footer";
import { cn } from "@/src/lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const products = useSiteContentStore((state) => state.products);
  const product = products.find((p) => p.slug === slug);

  const { addToCart, toggleCart } = useStore(
    useShallow((state) => ({
      addToCart: state.addToCart,
      toggleCart: state.toggleCart,
    }))
  );

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]?.value || "");
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-offgrid-cream flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-display font-black text-offgrid-green mb-4">Product Not Found</h1>
        <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  const activeColor = product.colors.find((c) => c.value === selectedColor) || product.colors[0];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: selectedSize,
      color: activeColor?.name || "",
      quantity,
    });
    toggleCart(true);
  };

  return (
    <>
      <div className="bg-offgrid-cream min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <Link
            to="/shop"
            className="mb-8 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60 hover:text-offgrid-lime transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Imagery */}
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                {product.tag && (
                  <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-offgrid-dark/90 backdrop-blur-sm text-offgrid-cream text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                    {product.tag}
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-offgrid-green/50">
                    {product.category}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-offgrid-green/20" />
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-offgrid-green/50 px-2 py-0.5 rounded-full border border-offgrid-green/10">
                    {product.cut.replace("_", " ")}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-black text-offgrid-green leading-tight mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-end justify-between mb-6 pb-6 border-b border-offgrid-green/10">
                  <p className="text-2xl font-display font-bold text-offgrid-lime">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-offgrid-green/60 font-medium">
                    <Star className="w-3.5 h-3.5 fill-offgrid-green text-offgrid-green" />
                    <span className="font-bold text-offgrid-green">{product.sold.toLocaleString()}</span> sold
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1"
              >
                <p className="text-base text-offgrid-green/75 leading-relaxed mb-6">
                  {product.description}
                </p>

                <div className="flex flex-col gap-2 mb-8 p-4 bg-offgrid-green/5 rounded-xl border border-offgrid-green/10">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-offgrid-green/50 w-24 flex-shrink-0">Material</span>
                    <span className="text-sm font-medium text-offgrid-green text-right">{product.material}</span>
                  </div>
                  {product.fit && (
                    <div className="flex items-start justify-between mt-2 pt-2 border-t border-offgrid-green/10">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-offgrid-green/50 w-24 flex-shrink-0">Fit</span>
                      <span className="text-sm font-medium text-offgrid-green text-right">{product.fit}</span>
                    </div>
                  )}
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-offgrid-green mb-3">
                      Color <span className="font-semibold text-offgrid-green/50 normal-case tracking-normal">— {activeColor?.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => {
                        const isSelected = selectedColor === color.value;
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            title={color.name}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center relative outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-green",
                              isSelected
                                ? "border-offgrid-green scale-110 shadow-md"
                                : "border-offgrid-green/20 hover:border-offgrid-green/50 hover:scale-105"
                            )}
                          >
                            <div className={cn("w-full h-full rounded-full", color.value)} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div id="sizing" className="mb-8 scroll-mt-28">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-offgrid-green">
                      Size
                    </p>
                    <Link
                      to="/custom#sizing-chart"
                      className="text-[10px] font-semibold tracking-[0.1em] uppercase text-offgrid-green/50 underline hover:text-offgrid-green"
                    >
                      Sizing Guide
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[3rem] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offgrid-green",
                          selectedSize === size
                            ? "bg-offgrid-green text-offgrid-cream border-transparent shadow-md"
                            : "bg-white text-offgrid-green border border-offgrid-green/20 hover:border-offgrid-green/50 hover:bg-offgrid-green/5"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="flex items-center gap-4">
                  {/* Stepper */}
                  <div className="flex items-center gap-4 border-2 border-offgrid-green/20 rounded-xl px-4 py-3 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="text-offgrid-green hover:text-offgrid-lime disabled:opacity-30 disabled:cursor-not-allowed transition-colors outline-none"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-sans font-semibold text-offgrid-green w-6 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="text-offgrid-green hover:text-offgrid-lime disabled:opacity-30 disabled:cursor-not-allowed transition-colors outline-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="flex-1 group h-[52px]"
                  >
                    <ShoppingBag className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Add to Cart — {formatPrice(product.price * quantity)}
                  </Button>
                </div>

                {/* Shipping & returns — PDP trust pattern (structured like category leaders, OFF GRID tokens) */}
                <div
                  className={cn(
                    "mt-10 rounded-2xl border border-offgrid-green/30 bg-white",
                    "p-6 md:p-8 shadow-[0_1px_0_rgba(15,47,47,0.06)]",
                  )}
                  aria-labelledby="pdp-shipping-heading"
                >
                  <h2
                    id="pdp-shipping-heading"
                    className="text-center font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-offgrid-green mb-6 md:mb-7"
                  >
                    Shipping &amp; returns
                  </h2>
                  <ul className="space-y-3.5 mb-6 md:mb-7">
                    <li className="flex gap-3 text-left">
                      <Check
                        className="h-4 w-4 shrink-0 text-offgrid-lime mt-0.5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span className="text-sm font-sans leading-relaxed text-offgrid-green/85">
                        Free shipping on Metro Manila orders {formatPrice(2000)} and up.
                      </span>
                    </li>
                    <li className="flex gap-3 text-left">
                      <Check
                        className="h-4 w-4 shrink-0 text-offgrid-lime mt-0.5"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span className="text-sm font-sans leading-relaxed text-offgrid-green/85">
                        Free shipping on provincial orders {formatPrice(2500)} and up.
                      </span>
                    </li>
                  </ul>
                  <p className="border-t border-offgrid-green/10 pt-6 text-sm font-sans leading-relaxed text-offgrid-green/70">
                    <span className="font-semibold text-offgrid-green">Note:</span>{" "}
                    We don&apos;t exchange for sizing preference. Use the{" "}
                    <a href="#sizing" className="font-semibold text-offgrid-green underline decoration-offgrid-green/30 underline-offset-2 hover:text-offgrid-lime hover:decoration-offgrid-lime">
                      size options
                    </a>{" "}
                    and published range before you check out. If the garment is defective or doesn&apos;t match our listed specs, reach out — we&apos;ll make it right.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
