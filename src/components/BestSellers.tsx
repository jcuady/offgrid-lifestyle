import { useMemo } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
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
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {crowdFavorites.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white/60 px-6 py-10 text-center text-sm text-offgrid-green/60">
            No homepage best sellers are configured yet. In Admin → Products, set a Crowd Favorites rank (1–4) on the
            items you want here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {crowdFavorites.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product.slug)}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white mb-4 ring-1 ring-offgrid-green/[0.06] shadow-sm">
                  {product.tag && (
                    <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                      {product.tag}
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-white p-6 sm:p-8">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="px-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50">
                      {product.category}
                    </p>
                    <p className="font-bold text-offgrid-green text-sm">{formatPrice(product.price)}</p>
                  </div>
                  <h3 className="text-base font-display font-bold text-offgrid-green mb-3">{product.name}</h3>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {product.colors.map((color, i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-3.5 rounded-full border border-offgrid-green/20 ${color.value}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-offgrid-green/60 font-medium">
                      <Star className="w-3 h-3 fill-offgrid-green text-offgrid-green" />
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
