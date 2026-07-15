import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { resolveFeaturedSpotlightItems, type FeaturedDisplayItem } from "@/src/lib/featuredProducts";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { ProductPrice } from "@/src/components/ProductPrice";

interface FeaturedSpotlightProps {
  placement: "home" | "shop";
  className?: string;
}

/**
 * Editorial featured band — asymmetric bento or hero banner with blue accent rules.
 */
export function FeaturedSpotlight({ placement, className }: FeaturedSpotlightProps) {
  const navigate = useNavigate();
  const products = useSiteContentStore((s) => s.products);
  const config = useSiteContentStore((s) => s.landingContent.featuredSpotlight);

  const visible = placement === "home" ? config.showOnHome : config.showOnShop;
  const featured = resolveFeaturedSpotlightItems(products, config);

  if (!visible || featured.length === 0) return null;

  const handleTileClick = (item: FeaturedDisplayItem) => {
    if (item.isProduct && item.slug) {
      navigate(`/shop/${item.slug}`);
      return;
    }
    navigate(config.ctaHref);
  };

  const [primary, ...secondary] = featured;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-offgrid-lime py-10 text-offgrid-cream sm:py-16 md:py-24",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[7rem] font-black leading-none tracking-tighter text-white/[0.07] sm:text-[10rem] md:text-[13rem]"
      >
        OG®
      </span>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-offgrid-cream/20" aria-hidden />

      <div className={cn(siteContainer, "relative")}>
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-offgrid-cream/15 pb-6 sm:mb-12 sm:gap-5 sm:pb-8 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/90">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-cream" />
              {config.eyebrow}
            </span>
            <h2 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-offgrid-cream sm:text-5xl md:text-6xl">
              {config.titleLine1}{" "}
              <span className="font-normal italic text-offgrid-cream/85">{config.titleLine2Italic}</span>
            </h2>
            {config.subtitle ? (
              <p className="mt-4 max-w-md text-base leading-relaxed text-offgrid-cream/85">{config.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => navigate(config.ctaHref)}
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-offgrid-cream/40 bg-offgrid-cream/10 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-offgrid-cream backdrop-blur-sm transition-colors hover:bg-offgrid-cream hover:text-offgrid-lime md:self-auto"
          >
            {config.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {config.layout === "hero" ? (
          <FeaturedHeroTile item={primary} onClick={() => handleTileClick(primary)} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-2">
            <FeaturedTile
              item={primary}
              large
              index={0}
              onClick={() => handleTileClick(primary)}
              className="col-span-2 md:row-span-2"
            />
            {secondary.map((item, i) => (
              <Fragment key={item.id}>
                <FeaturedTile item={item} index={i + 1} onClick={() => handleTileClick(item)} />
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface FeaturedTileProps {
  item: FeaturedDisplayItem;
  onClick: () => void;
  index: number;
  large?: boolean;
  className?: string;
}

function FeaturedHeroTile({ item, onClick }: { item: FeaturedDisplayItem; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={item.isProduct ? `View ${item.name}` : "View featured collection"}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className="group relative block w-full overflow-hidden rounded-2xl bg-offgrid-dark/40 text-left outline-none ring-1 ring-offgrid-cream/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-offgrid-dark/30 focus-visible:ring-2 focus-visible:ring-offgrid-cream sm:rounded-3xl"
    >
      <div className="absolute left-0 top-0 z-20 h-full w-1 bg-offgrid-cream/0 transition-colors group-hover:bg-offgrid-cream" aria-hidden />
      <div className="relative aspect-[21/9] min-h-[220px] sm:min-h-[280px] md:min-h-[360px]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-offgrid-dark/85 via-offgrid-dark/35 to-transparent" />

        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 md:max-w-xl md:justify-center">
          {item.tag ? (
            <span className="mb-3 inline-flex w-fit rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-offgrid-lime shadow-sm">
              {item.tag}
            </span>
          ) : null}
          {item.isProduct ? (
            <>
              <p className="mb-1 font-mono text-xs font-bold uppercase tracking-[0.18em] text-offgrid-cream/80">
                {item.category}
              </p>
              <h3 className="font-display text-3xl font-bold leading-tight text-offgrid-cream sm:text-4xl md:text-5xl">
                {item.name}
              </h3>
              <ProductPrice
                product={item}
                className="mt-3 border-l-2 border-offgrid-cream pl-3"
                priceClassName="text-xl text-offgrid-cream sm:text-2xl"
                compareClassName="text-sm text-offgrid-cream/65 sm:text-base"
              />
            </>
          ) : null}
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-offgrid-cream/35 bg-offgrid-cream/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-cream backdrop-blur-sm transition-colors group-hover:bg-offgrid-cream group-hover:text-offgrid-lime">
            Shop now
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <span className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-offgrid-cream/15 text-offgrid-cream backdrop-blur-md transition-all duration-300 group-hover:bg-offgrid-cream group-hover:text-offgrid-lime">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
}

function FeaturedTile({ item, onClick, index, large = false, className }: FeaturedTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={item.isProduct ? `View ${item.name}` : "View featured item"}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl bg-offgrid-dark/40 text-left outline-none ring-1 ring-offgrid-cream/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-offgrid-dark/30 focus-visible:ring-2 focus-visible:ring-offgrid-cream sm:rounded-3xl",
        large ? "min-h-[300px] sm:min-h-[440px] md:min-h-[576px]" : "min-h-[170px] sm:min-h-[220px] md:min-h-[280px]",
        className,
      )}
    >
      <span className="absolute left-3 top-3 z-20 font-mono text-3xl font-black tabular-nums text-offgrid-cream/20 transition-colors group-hover:text-offgrid-cream/40 sm:left-4 sm:top-4 sm:text-4xl">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="absolute left-0 top-0 z-20 h-full w-1 bg-offgrid-cream/0 transition-colors group-hover:bg-offgrid-cream" aria-hidden />

      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark via-offgrid-dark/30 to-transparent" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-5">
        {item.tag ? (
          <span className="rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-offgrid-lime shadow-sm">
            {item.tag}
          </span>
        ) : (
          <span />
        )}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-offgrid-cream/15 text-offgrid-cream backdrop-blur-md transition-all duration-300 group-hover:bg-offgrid-cream group-hover:text-offgrid-lime">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {item.isProduct ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 md:p-6">
          <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/80 sm:text-xs">
            {item.category}
          </p>
          <h3
            className={cn(
              "font-display font-bold leading-tight text-offgrid-cream",
              large ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl",
            )}
          >
            {item.name}
          </h3>
          <ProductPrice
            product={item}
            className="mt-2 border-l-2 border-offgrid-cream/60 pl-2 transition-colors group-hover:border-offgrid-cream"
            priceClassName={cn("text-offgrid-cream", large ? "text-xl sm:text-2xl" : "text-base sm:text-lg")}
            compareClassName="text-xs text-offgrid-cream/65"
          />
        </div>
      ) : null}
    </motion.button>
  );
}
