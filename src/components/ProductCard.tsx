import { Star, ArrowRight } from "lucide-react";
import { getProductSports, getProductTags, type Product } from "@/src/data/products";
import { cn } from "@/src/lib/utils";
import { ProductPrice } from "@/src/components/ProductPrice";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  className?: string;
}

/** Storefront product tile — used across the shop grid and featured rails. */
export function ProductCard({ product, onSelect, className }: ProductCardProps) {
  const extraColors = Math.max(0, product.colors.length - 4);
  const primaryTag = getProductTags(product)[0];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className={cn("group flex w-full cursor-pointer flex-col text-left outline-none", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.08] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-offgrid-lime/40 group-focus-visible:ring-2 group-focus-visible:ring-offgrid-lime sm:rounded-2xl">
        {primaryTag && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-offgrid-lime px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[9px]">
            {primaryTag}
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-offgrid-green/95 px-4 py-3 text-center backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span className="inline-flex items-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            View product
            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      <div className="mt-3 px-0.5 sm:mt-4">
        <div className="mb-1 flex items-baseline justify-between gap-2 sm:mb-1.5">
          <p className="min-w-0 truncate font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45 sm:text-[10px] sm:tracking-[0.18em]">
            {getProductSports(product).join(" · ")}
          </p>
          <ProductPrice
            product={product}
            className="shrink-0 justify-end"
            priceClassName="text-xs sm:text-sm"
            compareClassName="text-[10px] sm:text-xs"
          />
        </div>
        <h3 className="mb-2.5 line-clamp-2 font-display text-sm font-bold leading-tight text-offgrid-green transition-colors group-hover:text-offgrid-lime sm:mb-3 sm:text-base">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2 border-t border-offgrid-green/10 pt-2.5 sm:pt-3">
          <div className="flex gap-1 sm:gap-1.5">
            {product.colors.slice(0, 4).map((color, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full border border-offgrid-green/20 sm:h-3.5 sm:w-3.5 ${color.value}`}
              />
            ))}
            {extraColors > 0 && (
              <span className="font-mono text-[10px] text-offgrid-green/45">+{extraColors}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-offgrid-green/55 sm:text-[11px]">
            <Star className="h-3 w-3 fill-offgrid-green text-offgrid-green" />
            <span className="font-bold text-offgrid-green">{product.sold}</span> sold
          </div>
        </div>
      </div>
    </article>
  );
}
