import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Star, Quote, BadgeCheck, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import { siteContainer, sectionEyebrow, sectionEyebrowOnDark } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateSiteContentFromSupabase } from "@/src/services";

const FILLED_STARS = [0, 1, 2, 3, 4];

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {FILLED_STARS.map((i) => (
        <Star
          key={i}
          className={cn(iconClass, i < rating ? "fill-offgrid-lime text-offgrid-lime" : "text-offgrid-green/20")}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function TestimonialsPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const page = useSiteContentStore((s) => s.landingContent.testimonialsPage);
  const entries = useSiteContentStore((s) => s.testimonialWall);

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
  }, []);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.45, ease: "easeOut" as const },
      };

  const published = useMemo(
    () => entries.filter((entry) => entry.published).sort((a, b) => a.sortOrder - b.sortOrder),
    [entries],
  );

  const featured = useMemo(
    () => published.find((entry) => entry.featured) ?? published[0],
    [published],
  );

  const stats = useMemo(() => {
    const categories = new Set(published.map((t) => t.tag)).size;
    const cities = new Set(published.map((t) => t.location)).size;
    const avg =
      published.length > 0
        ? (published.reduce((sum, t) => sum + t.rating, 0) / published.length).toFixed(1)
        : "5.0";
    return [
      { value: avg, label: "Average rating" },
      { value: `${published.length}`, label: "Verified stories" },
      { value: `${categories}`, label: "Sport & lifestyle lines" },
      { value: `${cities}`, label: "Cities represented" },
    ];
  }, [published]);

  const tags = useMemo(() => {
    const unique = Array.from(new Set(published.map((t) => t.tag)));
    return ["All", ...unique];
  }, [published]);

  const [activeTag, setActiveTag] = useState<string>("All");

  const wall = useMemo(
    () =>
      published.filter(
        (t) => t.id !== featured?.id && (activeTag === "All" || t.tag === activeTag),
      ),
    [activeTag, featured?.id, published],
  );

  return (
    <>
      <section className="relative overflow-hidden bg-offgrid-green pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,10,255,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <Link
            to="/"
            className="mb-6 inline-flex items-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-cream/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {page.hero.backLabel}
          </Link>
          <span className={sectionEyebrowOnDark}>{page.hero.eyebrow}</span>
          <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.9] text-offgrid-cream md:text-7xl">
            {page.hero.titleLine1}
            <br />
            <span className="font-normal italic text-white">{page.hero.titleLine2Italic}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-offgrid-cream/75 md:text-lg">
            {page.hero.description}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-cream/15 bg-offgrid-cream/10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-offgrid-green/40 px-5 py-5 backdrop-blur-sm">
                <dt className="font-display text-3xl font-black tabular-nums text-offgrid-cream sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-cream/65">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-offgrid-green/8 bg-offgrid-cream py-12 sm:py-16">
        <div className={siteContainer}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={sectionEyebrow}>{page.showcase.eyebrow}</p>
              <h2 className="font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl">
                {page.showcase.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => followCmsCta(navigate, page.showcase.ctaHref)}
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green/60 transition-colors hover:text-offgrid-green"
            >
              {page.showcase.ctaLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {page.showcase.tiles.map((tile, index) => (
              <motion.div
                key={`${tile.image}-${index}`}
                {...fadeUp}
                transition={
                  reduceMotion ? undefined : { duration: 0.45, ease: "easeOut", delay: Math.min(index * 0.06, 0.24) }
                }
                className={cn(
                  "group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10",
                  index === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square",
                )}
              >
                <img
                  src={tile.image}
                  alt={tile.label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/30 to-transparent" aria-hidden />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-offgrid-green backdrop-blur">
                  {tile.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-offgrid-cream py-14 md:py-20">
        <div className={siteContainer}>
          {featured ? (
            <motion.article
              {...fadeUp}
              className="grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-offgrid-green/10 lg:grid-cols-[0.85fr_1fr]"
            >
              <div className="relative min-h-[260px] overflow-hidden bg-offgrid-green/5">
                <img
                  src={featured.image}
                  alt={`${featured.author} wearing OffGrid`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-offgrid-lime px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-green">
                  {featured.tag}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-9">
                <div className="flex items-center justify-between">
                  <p className={cn(sectionEyebrow, "mb-0")}>{page.wall.featuredEyebrow}</p>
                  <StarRow rating={featured.rating} size="md" />
                </div>
                <Quote className="mt-4 h-8 w-8 text-offgrid-green/15" aria-hidden />
                <blockquote className="mt-2 font-display text-xl font-bold leading-snug text-offgrid-green sm:text-2xl">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="flex items-center gap-1.5 font-display text-base font-bold text-offgrid-green">
                    {featured.author}
                    <BadgeCheck className="h-4 w-4 text-offgrid-lime" aria-label="Verified buyer" />
                  </p>
                  <p className="flex items-center gap-1 font-mono text-xs text-offgrid-green/55">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {featured.handle} · {featured.location}
                  </p>
                </div>
                {featured.outcome ? (
                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-offgrid-green/5 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.1em] text-offgrid-green/70">
                    <TrendingUp className="h-3.5 w-3.5 text-offgrid-lime" aria-hidden />
                    {featured.outcome}
                  </p>
                ) : null}
              </div>
            </motion.article>
          ) : null}

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionEyebrow}>{page.wall.filterEyebrow}</p>
              <h2 className="font-display text-3xl font-black tracking-tight text-offgrid-green md:text-4xl">
                {page.wall.filterTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter testimonials by category">
              {tags.map((tag) => {
                const active = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors",
                      active
                        ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
                        : "border-offgrid-green/20 text-offgrid-green/65 hover:border-offgrid-green/45 hover:text-offgrid-green",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {wall.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-offgrid-green/10 bg-white p-10 text-center text-base text-offgrid-green/55">
              {page.wall.emptyMessage}
            </p>
          ) : (
            <div className="mt-8 gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3">
              {wall.map((entry, index) => (
                <motion.figure
                  key={entry.id}
                  {...fadeUp}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 0.4, ease: "easeOut", delay: Math.min(index * 0.05, 0.2) }
                  }
                  className="mb-5 break-inside-avoid rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-offgrid-lime/40"
                >
                  <div className="flex items-center justify-between">
                    <StarRow rating={entry.rating} />
                    <span className="rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-offgrid-green">
                      {entry.tag}
                    </span>
                  </div>
                  <blockquote className="mt-4 text-base italic leading-relaxed text-offgrid-green/85">
                    &ldquo;{entry.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-offgrid-green/10 pt-4">
                    <p className="flex items-center gap-1.5 font-display text-sm font-bold text-offgrid-green">
                      {entry.author}
                      <BadgeCheck className="h-3.5 w-3.5 text-offgrid-lime" aria-label="Verified buyer" />
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-offgrid-green/50">
                      {entry.handle} · {entry.location}
                    </p>
                    {entry.outcome ? (
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-offgrid-green/60">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-offgrid-lime" aria-hidden />
                        {entry.outcome}
                      </p>
                    ) : null}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-offgrid-dark py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,10,255,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10 text-center")}>
          <span className={cn(sectionEyebrowOnDark, "mx-auto")}>{page.cta.eyebrow}</span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-black text-offgrid-cream md:text-4xl">
            {page.cta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-offgrid-cream/70 md:text-lg">
            {page.cta.description}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link to={page.cta.primaryHref}>
                {page.cta.primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
              asChild
            >
              <Link to={page.cta.secondaryHref}>{page.cta.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
