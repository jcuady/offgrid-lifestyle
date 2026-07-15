import { formatPrice, getDiscountPercent, isProductDiscounted, type Product } from "@/src/data/products";
import { cn } from "@/src/lib/utils";

type ProductPriceProps = {
  product: Pick<Product, "basePrice" | "price">;
  className?: string;
  priceClassName?: string;
  compareClassName?: string;
  showSavings?: boolean;
};

/** One price treatment across cards, quick view, and product detail. */
export function ProductPrice({
  product,
  className,
  priceClassName,
  compareClassName,
  showSavings = false,
}: ProductPriceProps) {
  const discounted = isProductDiscounted(product);

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {discounted ? (
        <span
          className={cn(
            "font-display tabular-nums text-offgrid-green/45 line-through decoration-1",
            compareClassName,
          )}
        >
          {formatPrice(product.basePrice)}
        </span>
      ) : null}
      <span className={cn("font-display font-black tabular-nums text-offgrid-green", priceClassName)}>
        {formatPrice(product.price)}
      </span>
      {discounted && showSavings ? (
        <span className="rounded-full bg-offgrid-lime/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-offgrid-green">
          Save {getDiscountPercent(product)}%
        </span>
      ) : null}
    </span>
  );
}
