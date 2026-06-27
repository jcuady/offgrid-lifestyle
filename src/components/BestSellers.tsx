import { useMemo } from "react";
import { motion } from "motion/react";
import { Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

const MAX_HOME_BEST_SELLERS = 4;

export function BestSellers() {
  const navigate = useNavigate();
  const products = useSiteContentStore((state) => state.products);
  const header = useSiteContentStore((state) => state.landingContent.bestSellersHeader);
  const shopLinkLabel = useSiteContentStore((state) => state.landingContent.bestSellersShopLink);

  const crowdFavorites = useMemo(() => {
    return [...products]
      .filter((p) => p.status !== "archived")
      .filter((p) => typeof p.homeBestSellerRank === "number" && p.homeBestSellerRank > 0)
      .sort((a, b) => (a.homeBestSellerRank ?? 0) - (b.homeBestSellerRank ?? 0))
      .slice(0, MAX_HOME_BEST_SELLERS);
  }, [products]);

  const priceCaption = useMemo(() => {
    if (crowdFavorites.length === 0) return null;
    const prices = crowdFavorites.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `Featured from ${formatPrice(min)}`;
    return `From ${formatPrice(min)} – ${formatPrice(max)}`;
  }, [crowdFavorites]);

  const handleProductClick = (slug: string) => {
    navigate(`/shop/${slug}`);
  };

  return (
    <section id="shop" className={cn(sectionPaddingCream, "border-t border-offgrid-green/[0.06] bg-offgrid-cream")}>
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className={sectionEyebrow}>{header.eyebrow}</span>
            <h2 className={sectionTitle}>
              {header.titleLine1} <br />
              <span className="italic font-normal">{header.titleLine2Italic}</span>
            </h2>
          </div>
          <div className="shrink-0 md:text-right">
            {priceCaption && (
              <p className="text-offgrid-green/70 text-sm mb-2">{priceCaption}</p>
            )}
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="inline-flex items-center text-sm font-bold uppercase tracking-[0.15em] text-offgrid-green hover:text-offgrid-lime transition-colors group cursor-pointer"
            >
              {shopLinkLabel}
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {crowdFavorites.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 px-6 py-10 text-center text-sm text-offgrid-green/60">
            No homepage best sellers are configured yet. In Admin → Products, set a Crowd Favorites rank (1–4) on the
            items you want here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8">
            {crowdFavorites.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                role="button"
                tabIndex={0}
                aria-label={`View ${product.name}`}
                className="group flex w-full cursor-pointer flex-col text-left outline-none"
                onClick={() => handleProductClick(product.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProductClick(product.slug);
                  }
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-offgrid-green/[0.08] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-offgrid-lime/40 group-focus-visible:ring-2 group-focus-visible:ring-offgrid-lime">
                  <span className="absolute top-3 left-3 z-10 font-mono text-[11px] font-bold tabular-nums tracking-[0.1em] text-offgrid-green/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {product.tag && (
                    <span className="absolute top-3 right-3 z-10 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
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
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

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
        )}
      </div>
    </section>
  );
}
