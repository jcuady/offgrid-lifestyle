import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { formatPrice, type Product } from "@/src/data/products";
import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import { SHOP_BY_COLLECTION } from "@/src/lib/shopTaxonomy";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import {
  electricBluePill,
  monoLabelOnDark,
  siteContainer,
  sectionEyebrow,
  sectionEyebrowOnDark,
  sectionTitleOnDark,
} from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { hydrateProductsFromSupabase } from "@/src/services";

const COLLECTION_IMAGES: Record<string, string> = {
  Discfest: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
  Solar: "/images/product-solar-shortsleeve.jpg",
  Primal: "/images/product-primal-shortsleeve.jpg",
  "OG Vibe": "/images/product-og-vibe.jpg",
};

function belongsToCollection(product: Product, label: string, category: string): boolean {
  if (label === "Discfest") return product.collectionIds?.includes("discfest") ?? false;
  return product.category === category;
}

export function CollectionsPage() {
  const reduceMotion = useReducedMotion();
  const products = useSiteContentStore((s) => s.products);

  useEffect(() => {
    void hydrateProductsFromSupabase();
  }, []);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  const collections = useMemo(
    () =>
      SHOP_BY_COLLECTION.map((collection) => {
        const collectionProducts = products.filter(
          (product) =>
            product.status === "active" &&
            belongsToCollection(product, collection.label, collection.category),
        );
        return {
          ...collection,
          image: COLLECTION_IMAGES[collection.label] ?? collectionProducts[0]?.image ?? "",
          products: collectionProducts,
          fromPrice:
            collectionProducts.length > 0
              ? Math.min(...collectionProducts.map((product) => product.price))
              : null,
        };
      }),
    [products],
  );

  return (
    <>
      <section className="relative overflow-hidden bg-offgrid-dark pb-16 pt-28 text-offgrid-cream sm:pb-20 sm:pt-36">
        <img
          src={COLLECTION_IMAGES.Discfest}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-offgrid-dark via-offgrid-dark/95 to-offgrid-dark/55" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,10,255,0.20),transparent_55%)]" />
        <div className={cn(siteContainer, "relative z-10")}>
          <span className={sectionEyebrowOnDark}>Shop By Collection</span>
          <h1 className={cn(sectionTitleOnDark, "max-w-4xl")}>
            Every drop. <span className="font-normal italic text-white">Its own point of view.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-offgrid-cream/70 md:text-lg">
            Discover OFFGRID collections shaped by events, sunlight, performance, and everyday movement.
            Each line has a distinct visual language; every piece keeps the same play-ready standard.
          </p>

          {collections.length > 0 ? (
            <nav aria-label="Jump to a collection" className="mt-10 flex flex-wrap gap-2.5">
              {collections.map((collection) => (
                <a
                  key={collection.label}
                  href={`#${collection.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-full border border-offgrid-cream/25 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-offgrid-cream/80 transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-white"
                >
                  {collection.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="bg-offgrid-cream py-16 sm:py-20 md:py-24">
        <div className={cn(siteContainer, "space-y-16 sm:space-y-24")}>
          {collections.map((collection, index) => {
            const imageRight = index % 2 === 1;
            const previewProducts = collection.products.slice(0, 3);
            return (
              <motion.article
                key={collection.label}
                id={collection.label.toLowerCase().replace(/\s+/g, "-")}
                {...fadeUp}
                className="scroll-mt-28 grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
              >
                <Link
                  to={collection.href}
                  aria-label={`Shop ${collection.label} collection`}
                  className={cn(
                    "group relative block aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-offgrid-green/10 lg:col-span-7",
                    imageRight && "lg:order-2 lg:col-start-6",
                  )}
                >
                  <img
                    src={collection.image}
                    alt={`${collection.label} collection`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/70 via-offgrid-dark/10 to-transparent"
                    aria-hidden
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green backdrop-blur">
                    Collection {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-offgrid-lime px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors group-hover:bg-offgrid-gold">
                    Shop {collection.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <div className={cn("min-w-0 lg:col-span-5", imageRight && "lg:order-1")}>
                  <p className={sectionEyebrow}>OFFGRID collection</p>
                  <h2 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-offgrid-green sm:text-5xl">
                    {collection.label}
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-offgrid-green/70">
                    {collection.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green/50">
                    <span>{collection.products.length} products</span>
                    {collection.fromPrice !== null ? <span>From {formatPrice(collection.fromPrice)}</span> : null}
                  </div>

                  {previewProducts.length > 0 ? (
                    <div className="mt-6 flex gap-2" aria-label={`${collection.label} product preview`}>
                      {previewProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/shop/${product.slug}`}
                          className="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-offgrid-green/10 transition hover:ring-offgrid-lime"
                          aria-label={product.name}
                        >
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <Link to={collection.href} className={cn(electricBluePill, "group mt-7")}>
                    Shop {collection.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-offgrid-dark py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,10,255,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10 text-center")}>
          <span className={cn(monoLabelOnDark, "text-offgrid-cream/55")}>Beyond the collection</span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-black text-offgrid-cream md:text-4xl">
            Need your team&rsquo;s own visual identity?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-offgrid-cream/65 md:text-base">
            Start a custom run with free design support, sport-ready cuts, and a 10-piece minimum.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/custom/order" className={cn(electricBluePill, "group px-5 py-2.5 text-xs")}>
              Start a team order
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-offgrid-cream/35 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-cream transition hover:bg-offgrid-cream hover:text-offgrid-dark"
            >
              Shop all products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
