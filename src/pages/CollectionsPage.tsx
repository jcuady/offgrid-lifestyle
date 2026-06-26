import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Footer } from "@/src/components/Footer";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import {
  siteContainer,
  sectionEyebrow,
  sectionEyebrowOnDark,
  sectionTitleOnDark,
} from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

function shopHref(category: string) {
  return `/shop?category=${encodeURIComponent(category)}`;
}

export function CollectionsPage() {
  const reduceMotion = useReducedMotion();
  const header = useSiteContentStore((s) => s.landingContent.collectionsHeader);
  const collections = useSiteContentStore((s) => s.landingContent.collections);
  const products = useSiteContentStore((s) => s.products);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);

  // Categories not already represented by a signature collection → "more lines".
  const moreLines = useMemo(() => {
    const curated = new Set(collections.map((c) => c.shopCategory));
    const seen = new Set<string>();
    const extra: { category: string; image: string; count: number }[] = [];
    for (const p of products) {
      if (curated.has(p.category) || seen.has(p.category)) continue;
      seen.add(p.category);
      extra.push({ category: p.category, image: p.image, count: countByCategory.get(p.category) ?? 0 });
    }
    return extra;
  }, [products, collections, countByCategory]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-offgrid-green pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,211,48,0.12),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <span className={sectionEyebrowOnDark}>{header.eyebrow}</span>
          <h1 className={cn(sectionTitleOnDark, "max-w-4xl")}>
            {header.titleLine1} <span className="font-normal italic text-white">{header.titleLine2Italic}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-offgrid-cream/70 md:text-base">
            {header.caption} One lifestyle, built for every court, fairway, run, and rest day.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="font-display text-3xl font-black tabular-nums text-offgrid-lime sm:text-4xl">
                {collections.length}
              </dt>
              <dd className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/65">
                Signature collections
              </dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-black tabular-nums text-offgrid-lime sm:text-4xl">
                {products.length}
              </dt>
              <dd className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/65">
                Pieces in catalog
              </dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-black tabular-nums text-offgrid-lime sm:text-4xl">
                {countByCategory.size}
              </dt>
              <dd className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/65">
                Lines to explore
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Signature collections — editorial alternating rows */}
      <section className="bg-offgrid-cream py-16 sm:py-20 md:py-24">
        <div className={cn(siteContainer, "space-y-16 sm:space-y-24")}>
          {collections.map((collection, index) => {
            const count = countByCategory.get(collection.shopCategory) ?? 0;
            const imageRight = index % 2 === 1;
            return (
              <motion.article
                key={collection.id}
                {...fadeUp}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <Link
                  to={shopHref(collection.shopCategory)}
                  aria-label={`Shop the ${collection.title} collection`}
                  className={cn(
                    "group relative block aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-offgrid-green/10",
                    imageRight && "lg:order-2",
                  )}
                >
                  <img
                    src={collection.image}
                    alt={collection.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/70 via-offgrid-dark/10 to-transparent"
                    aria-hidden
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-offgrid-cream/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green backdrop-blur">
                    {collection.tag}
                  </span>
                  <span className="absolute right-5 top-5 font-display text-5xl font-black tabular-nums text-offgrid-cream/80 mix-blend-overlay">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-offgrid-lime px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-offgrid-green opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                    Shop now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <div className={cn("min-w-0", imageRight && "lg:order-1")}>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
                    Collection {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-tight text-offgrid-green sm:text-5xl">
                    {collection.title}
                  </h2>
                  <p className="mt-3 font-display text-lg font-medium italic text-offgrid-green/70">
                    {collection.subtitle}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/55">
                    <span className="rounded-full bg-offgrid-green/5 px-3 py-1.5">{collection.tag}</span>
                    <span className="rounded-full bg-offgrid-green/5 px-3 py-1.5 tabular-nums">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                  <Button className="group mt-7" size="lg" asChild>
                    <Link to={shopHref(collection.shopCategory)}>
                      Shop {collection.title}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* More lines — dynamic categories not in the signature set */}
      {moreLines.length > 0 ? (
        <section className="border-t border-offgrid-green/8 bg-offgrid-cream pb-16 sm:pb-20 md:pb-24">
          <div className={siteContainer}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className={sectionEyebrow}>More lines</p>
                <h2 className="font-display text-3xl font-black tracking-tight text-offgrid-green sm:text-4xl">
                  Explore every line
                </h2>
              </div>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/60 transition-colors hover:text-offgrid-green"
              >
                View full catalog
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreLines.map((line, index) => (
                <motion.div key={line.category} {...fadeUp} transition={reduceMotion ? undefined : { duration: 0.45, ease: "easeOut", delay: Math.min(index * 0.06, 0.24) }}>
                  <Link
                    to={shopHref(line.category)}
                    aria-label={`Shop ${line.category}`}
                    className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10"
                  >
                    <img
                      src={line.image}
                      alt={line.category}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/80 via-offgrid-dark/20 to-transparent"
                      aria-hidden
                    />
                    <div className="relative z-10 flex items-end justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-bold text-offgrid-cream">{line.category}</h3>
                        <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/70 tabular-nums">
                          {line.count} {line.count === 1 ? "piece" : "pieces"}
                        </p>
                      </div>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-offgrid-cream/15 backdrop-blur-md transition-colors group-hover:bg-offgrid-lime">
                        <ArrowUpRight className="h-4 w-4 text-offgrid-cream transition-colors group-hover:text-offgrid-green" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="relative overflow-hidden bg-offgrid-dark py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(197,211,48,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10 text-center")}>
          <span className={cn(sectionEyebrowOnDark, "mx-auto")}>Make it yours</span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-black text-offgrid-cream md:text-4xl">
            Can&rsquo;t find your fit? Build it.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-offgrid-cream/65 md:text-base">
            Take any line further with custom team kits and personalized pieces — designed with you, produced by OffGrid.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link to="/custom">
                Start a custom order
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
              asChild
            >
              <Link to="/shop">Shop all products</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
