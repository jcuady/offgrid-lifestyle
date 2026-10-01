import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { formatPrice, getProductSports, getProductTags, type Product } from "@/src/data/products";
import { useStore } from "@/src/store/store";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { ProductPrice } from "@/src/components/ProductPrice";
import { SizeGuideModal } from "@/src/components/SizeGuideModal";
import { imagesFromProduct } from "@/src/lib/productGallery";

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { addToCart, openCheckout } = useStore(
    useShallow((state) => ({
      addToCart: state.addToCart,
      openCheckout: state.openCheckout,
    })),
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const galleryUrls = useMemo(
    () => (product ? imagesFromProduct(product.image, product.gallery) : []),
    [product],
  );
  const displayImage = activeImage && galleryUrls.includes(activeImage) ? activeImage : galleryUrls[0] ?? product?.image ?? "";

  const handleSelectColor = (colorValue: string) => {
    setSelectedColor(colorValue);
    if (!product) return;
    const colorObj = product.colors.find((c) => c.value === colorValue);
    if (!colorObj) return;
    const matchingVariant = product.variants?.find(
      (v) => (colorObj.variantSku && v.sku === colorObj.variantSku) || v.designName === colorObj.name,
    );
    if (matchingVariant?.imageUrl) {
      setActiveImage(matchingVariant.imageUrl);
    }
  };

  const handleSelectThumbnail = (url: string) => {
    setActiveImage(url);
    if (!product) return;
    const matchingVariant = product.variants?.find((v) => v.imageUrl === url);
    if (matchingVariant) {
      const matchingColor = product.colors.find(
        (c) => (c.variantSku && c.variantSku === matchingVariant.sku) || c.name === matchingVariant.designName,
      );
      if (matchingColor) {
        setSelectedColor(matchingColor.value);
      }
    }
  };

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0] ?? "");
    const initialColor = product.colors[0]?.value ?? "";
    setSelectedColor(initialColor);
    setQuantity(1);
    setError(null);
    setSizeGuideOpen(false);

    const colorObj = product.colors[0];
    if (colorObj) {
      const matchingVariant = product.variants?.find(
        (v) => (colorObj.variantSku && v.sku === colorObj.variantSku) || v.designName === colorObj.name,
      );
      setActiveImage(matchingVariant?.imageUrl ?? null);
    } else {
      setActiveImage(null);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sizeGuideOpen) {
        setSizeGuideOpen(false);
        return;
      }
      onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose, sizeGuideOpen]);

  const activeColor = product?.colors.find((c) => c.value === selectedColor) ?? product?.colors[0];
  const lineTotal = (product?.price ?? 0) * quantity;
  const primaryTag = product ? getProductTags(product)[0] : undefined;

  const buildCartItem = () => {
    if (!product) return null;
    if (!selectedSize) {
      setError("Select a size to continue.");
      return null;
    }
    return {
      productId: product.id,
      name: product.name,
      image: displayImage || product.image,
      price: product.price,
      size: selectedSize,
      color: activeColor?.name ?? "",
      quantity,
    };
  };

  const handleAddToCart = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    onClose();
  };

  const handleBuyNow = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    onClose();
    openCheckout();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.button
            type="button"
            aria-label="Close product preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-offgrid-dark/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-offgrid-cream shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(90dvh,820px)] sm:w-[min(100vw-2rem,56rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-offgrid-green/10 px-4 py-3 sm:px-6 sm:py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/50">
                Quick view
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-offgrid-green/5 text-offgrid-green transition-colors hover:bg-offgrid-green hover:text-offgrid-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-8 sm:p-6">
                {/* Large image + thumbnails — desktop */}
                <div className="hidden flex-col gap-3 sm:flex">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-offgrid-green/10">
                    {primaryTag ? (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                        {primaryTag}
                      </span>
                    ) : null}
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-all duration-300"
                    />
                  </div>
                  {galleryUrls.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {galleryUrls.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => handleSelectThumbnail(url)}
                          className={cn(
                            "h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                            displayImage === url
                              ? "border-offgrid-green ring-2 ring-offgrid-green/30"
                              : "border-transparent ring-1 ring-offgrid-green/15 hover:ring-offgrid-green/40",
                          )}
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-col">
                  {/* Compact header with thumbnail — mobile */}
                  <div className="flex gap-3.5 sm:hidden">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-offgrid-green/10">
                      {primaryTag ? (
                        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-offgrid-lime px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                          {primaryTag}
                        </span>
                      ) : null}
                      <img src={displayImage} alt={product.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/50">
                        {getProductSports(product).join(" · ")}
                      </span>
                      <h2
                        id="quick-view-title"
                        className="mt-1 font-display text-xl font-black leading-tight text-offgrid-green"
                      >
                        {product.name}
                      </h2>
                      <ProductPrice
                        product={product}
                        className="mt-auto"
                        priceClassName="text-lg text-offgrid-lime"
                        compareClassName="text-sm"
                      />
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-offgrid-green/60">
                        <Star className="h-3 w-3 fill-offgrid-green text-offgrid-green" />
                        <span className="font-bold text-offgrid-green">{product.sold}</span> sold
                      </div>
                    </div>
                  </div>

                  {/* Mobile thumbnails */}
                  {galleryUrls.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
                      {galleryUrls.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => handleSelectThumbnail(url)}
                          className={cn(
                            "h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                            displayImage === url
                              ? "border-offgrid-green ring-2 ring-offgrid-green/30"
                              : "border-transparent ring-1 ring-offgrid-green/15",
                          )}
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Header — desktop */}
                  <div className="hidden sm:block">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/50">
                        {getProductSports(product).join(" · ")}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-offgrid-green/20" aria-hidden />
                      <span className="rounded-full border border-offgrid-green/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/50">
                        {product.cut.replace("_", " ")}
                      </span>
                    </div>

                    <h2 className="font-display text-3xl font-black leading-tight text-offgrid-green">
                      {product.name}
                    </h2>

                    <div className="mt-3 flex items-end justify-between border-b border-offgrid-green/10 pb-4">
                      <ProductPrice
                        product={product}
                        priceClassName="text-2xl text-offgrid-lime"
                        compareClassName="text-base"
                        showSavings
                      />
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-offgrid-green/60">
                        <Star className="h-3.5 w-3.5 fill-offgrid-green text-offgrid-green" />
                        <span className="font-bold text-offgrid-green">{product.sold}</span> sold
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 hidden line-clamp-3 text-sm leading-relaxed text-offgrid-green/75 sm:block">
                    {product.shortDescription || product.description}
                  </p>

                  {/* Color */}
                  {product.colors.length > 0 ? (
                    <div className="mt-4 border-t border-offgrid-green/10 pt-4 sm:mt-5 sm:border-t-0 sm:pt-0">
                      <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green">
                        Color{" "}
                        <span className="font-semibold normal-case tracking-normal text-offgrid-green/50">
                          — {activeColor?.name}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {product.colors.map((color) => {
                          const isSelected = selectedColor === color.value;
                          return (
                            <button
                              key={color.value}
                              type="button"
                              title={color.name}
                              onClick={() => {
                                handleSelectColor(color.value);
                                setError(null);
                              }}
                              className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2",
                                isSelected
                                  ? "scale-110 border-offgrid-green shadow-md"
                                  : "border-offgrid-green/20 hover:border-offgrid-green/50",
                              )}
                            >
                              <span className={cn("h-full w-full rounded-full", color.value)} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Size */}
                  <div className="mt-5">
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green">
                        Size
                      </p>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="min-h-11 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-offgrid-green/50 underline-offset-2 transition-colors hover:text-offgrid-green hover:underline"
                      >
                        Sizing guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setError(null);
                          }}
                          className={cn(
                            "min-h-11 min-w-[2.75rem] rounded-xl px-3.5 text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2",
                            selectedSize === size
                              ? "bg-offgrid-green text-offgrid-cream shadow-md"
                              : "border border-offgrid-green/20 bg-white text-offgrid-green hover:border-offgrid-green/50 hover:bg-offgrid-green/5",
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-5">
                    <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green">
                      Quantity
                    </p>
                    <div className="inline-flex items-center gap-3 rounded-xl border border-offgrid-green/20 bg-white px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-11 w-11 items-center justify-center rounded-full text-offgrid-green transition-colors hover:bg-offgrid-green/5 disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-offgrid-green">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        disabled={quantity >= 10}
                        aria-label="Increase quantity"
                        className="flex h-11 w-11 items-center justify-center rounded-full text-offgrid-green transition-colors hover:bg-offgrid-green/5 disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <Link
                    to={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/55 transition-colors hover:text-offgrid-lime"
                  >
                    View full details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="shrink-0 border-t border-offgrid-green/10 bg-offgrid-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={handleAddToCart}
                  className="h-12 w-full text-sm font-semibold tracking-wide sm:h-14 sm:flex-[1.5]"
                >
                  <span className="truncate">Add to cart · {formatPrice(lineTotal)}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBuyNow}
                  className="h-12 w-full border-offgrid-green/30 sm:h-14 sm:flex-1"
                >
                  Buy now
                </Button>
              </div>
            </div>
          </motion.div>

          <SizeGuideModal
            open={sizeGuideOpen}
            onClose={() => setSizeGuideOpen(false)}
            productSizes={product.sizes}
            selectedSize={selectedSize}
          />
        </>
      )}
    </AnimatePresence>
  );
}
