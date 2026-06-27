import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { resolveFeaturedSpotlightItems, type FeaturedDisplayItem } from "@/src/lib/featuredProducts";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

interface FeaturedSpotlightProps {
  placement: "home" | "shop";
  className?: string;
}

/**
 * Editorial featured band — CMS-driven layout (bento or hero banner) and
 * product source (best sellers or manual picks with image overrides).
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
      className={cn("relative overflow-hidden bg-offgrid-lime py-10 text-offgrid-cream sm:py-16 md:py-24", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[7rem] font-black leading-none tracking-tighter text-white/[0.07] sm:text-[10rem] md:text-[13rem]"
      >
        OG®
      </span>

      <div className={cn(siteContainer, "relative")}>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-12 sm:gap-5 md:flex-row md:items-end">
          <div className="min-w-0">
            <span className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-cream" />
              {config.eyebrow}
            </span>
            <h2 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-offgrid-cream sm:text-5xl md:text-6xl">
              {config.titleLine1}{" "}
              <span className="italic font-normal text-offgrid-cream/85">{config.titleLine2Italic}</span>
            </h2>
            {config.subtitle ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-offgrid-cream/75">{config.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => navigate(config.ctaHref)}
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-offgrid-cream/40 bg-offgrid-cream/10 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-offgrid-cream backdrop-blur-sm transition-colors hover:bg-offgrid-cream hover:text-offgrid-lime md:self-auto"
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
      className="group relative block w-full overflow-hidden rounded-2xl bg-offgrid-dark/40 text-left outline-none ring-1 ring-offgrid-cream/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-offgrid-dark/30 focus-visible:ring-2 focus-visible:ring-offgrid-cream sm:rounded-3xl"
    >
      <div className="relative aspect-[21/9] min-h-[220px] sm:min-h-[280px] md:min-h-[360px]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-offgrid-dark/85 via-offgrid-dark/35 to-transparent" />

        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 md:max-w-xl md:justify-center">
          {item.tag ? (
            <span className="mb-3 inline-flex w-fit rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-offgrid-lime shadow-sm">
              {item.tag}
            </span>
          ) : null}
          {item.isProduct ? (
            <>
              <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/65">
                {item.category}
              </p>
              <h3 className="font-display text-3xl font-bold leading-tight text-offgrid-cream sm:text-4xl md:text-5xl">
                {item.name}
              </h3>
              <p className="mt-3 font-display text-xl font-black tabular-nums tracking-tight text-offgrid-cream sm:text-2xl">
                {formatPrice(item.price)}
              </p>
            </>
          ) : null}
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-offgrid-cream/35 bg-offgrid-cream/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-cream backdrop-blur-sm transition-colors group-hover:bg-offgrid-cream group-hover:text-offgrid-lime">
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
        "group relative block w-full overflow-hidden rounded-2xl bg-offgrid-dark/40 text-left outline-none ring-1 ring-offgrid-cream/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-offgrid-dark/30 focus-visible:ring-2 focus-visible:ring-offgrid-cream sm:rounded-3xl",
        large ? "min-h-[300px] sm:min-h-[440px] md:min-h-[576px]" : "min-h-[170px] sm:min-h-[220px] md:min-h-[280px]",
        className,
      )}
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark via-offgrid-dark/30 to-transparent" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-5">
        {item.tag ? (
          <span className="rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-offgrid-lime shadow-sm">
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
          <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/65 sm:text-[10px]">
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
          <p
            className={cn(
              "mt-2 font-display font-black tabular-nums tracking-tight text-offgrid-cream",
              large ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
            )}
          >
            {formatPrice(item.price)}
          </p>
        </div>
      ) : null}
    </motion.button>
  );
}
