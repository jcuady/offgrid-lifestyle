import { useMemo } from "react";
import { motion } from "motion/react";
import { Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice, getProductSports, getProductTags } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { sectionEyebrow, sectionPaddingCream, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { ProductPrice } from "@/src/components/ProductPrice";

const MAX_HOME_BEST_SELLERS = 4;

/** Stagger offsets for editorial rhythm */
const cardOffsets = ["md:translate-y-0", "md:translate-y-6", "md:-translate-y-2", "md:translate-y-4"];

export function BestSellers() {
  const navigate = useNavigate();
  const products = useSiteContentStore((state) => state.products);
  const header = useSiteContentStore((state) => state.landingContent.bestSellersHeader);
  const shopLinkLabel = useSiteContentStore((state) => state.landingContent.bestSellersShopLink);
  const typography = useSiteContentStore((state) => state.landingContent.typography.bestSellers);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const crowdFavorites = useMemo(() => {
    return [...products]
      .filter((p) => p.status === "active")
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
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-offgrid-green/10 pb-8 sm:mb-14 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className={sectionEyebrow} style={bodyStyle}>
              {header.eyebrow}
            </span>
            <h2 className={sectionTitle} style={headingStyle}>
              {header.titleLine1} <br />
              <span className="font-normal italic">{header.titleLine2Italic}</span>
            </h2>
          </div>
          <div className="shrink-0 md:text-right">
            {priceCaption ? (
              <p className="mb-2 text-base text-offgrid-green/75">{priceCaption}</p>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="group inline-flex cursor-pointer items-center text-sm font-bold uppercase tracking-[0.15em] text-offgrid-green transition-colors hover:text-offgrid-lime"
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-4">
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
                className={cn(
                  "group flex w-full cursor-pointer flex-col text-left outline-none",
                  cardOffsets[index] ?? "",
                )}
                onClick={() => handleProductClick(product.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProductClick(product.slug);
                  }
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.08] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-offgrid-lime/40 group-focus-visible:ring-2 group-focus-visible:ring-offgrid-lime">
                  <span className="absolute left-0 top-0 z-10 h-full w-1 bg-offgrid-lime/0 transition-colors group-hover:bg-offgrid-lime" aria-hidden />

                  <span className="absolute left-4 top-3 z-10 font-mono text-4xl font-black tabular-nums leading-none text-offgrid-green/10 transition-colors group-hover:text-offgrid-lime/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {getProductTags(product)[0] ? (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-offgrid-lime px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                      {getProductTags(product)[0]}
                    </span>
                  ) : null}

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-offgrid-lime/95 px-4 py-3 text-center backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
                    <span className="inline-flex items-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                      View product
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

                <div className="mt-4 px-0.5">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate font-mono text-xs font-bold uppercase tracking-[0.18em] text-offgrid-green/60">
                      {getProductSports(product).join(" · ")}
                    </p>
                    <ProductPrice
                      product={product}
                      className="shrink-0 border-l-2 border-offgrid-lime pl-2"
                      priceClassName="text-base"
                      compareClassName="text-xs"
                    />
                  </div>
                  <h3 className="mb-3 font-display text-lg font-bold leading-tight text-offgrid-green transition-colors group-hover:text-offgrid-lime">
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
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-offgrid-green/65">
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
