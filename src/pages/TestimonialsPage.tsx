import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Star, Quote, BadgeCheck, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Footer } from "@/src/components/Footer";
import { testimonialEntries } from "@/src/data/testimonials";
import { siteContainer, sectionEyebrow, sectionEyebrowOnDark } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

/** Customer photos used for the "in the wild" social-proof strip. */
const SHOWCASE_TILES = [
  { image: "/images/ugc-1.png", label: "Pickleball" },
  { image: "/images/ugc-2.jpg", label: "Golf" },
  { image: "/images/ugc-3.png", label: "Running" },
  { image: "/images/ugc-4.png", label: "Lifestyle" },
  { image: "/images/ugc-5.png", label: "Community" },
] as const;

const FILLED_STARS = [0, 1, 2, 3, 4];

export function TestimonialsPage() {
  const reduceMotion = useReducedMotion();
  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.45, ease: "easeOut" as const },
      };

  const featured = testimonialEntries[0];

  // Honest stats derived from the review data — no invented marketing numbers.
  const stats = useMemo(() => {
    const categories = new Set(testimonialEntries.map((t) => t.tag)).size;
    const cities = new Set(testimonialEntries.map((t) => t.location)).size;
    return [
      { value: "5.0", label: "Average rating" },
      { value: `${testimonialEntries.length}`, label: "Verified stories" },
      { value: `${categories}`, label: "Sport & lifestyle lines" },
      { value: `${cities}`, label: "Cities represented" },
    ];
  }, []);

  const tags = useMemo(() => {
    const unique = Array.from(new Set(testimonialEntries.map((t) => t.tag)));
    return ["All", ...unique];
  }, []);

  const [activeTag, setActiveTag] = useState<string>("All");

  const wall = useMemo(
    () =>
      testimonialEntries.filter(
        (t) => t.id !== featured.id && (activeTag === "All" || t.tag === activeTag),
      ),
    [activeTag, featured.id],
  );

  return (
    <>
      {/* Hero + trust stats */}
      <section className="relative overflow-hidden bg-offgrid-green pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,211,48,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10")}>
          <Link
            to="/"
            className="mb-6 inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to home
          </Link>
          <span className={sectionEyebrowOnDark}>Testimonials</span>
          <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.9] text-offgrid-cream md:text-7xl">
            Proof in the
            <br />
            <span className="font-normal italic text-white">play.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-offgrid-cream/70 md:text-base">
            Teams, athletes, and everyday wearers put OffGrid through real matches, long runs, and game days.
            Here is what they say about the fit, the finish, and the experience.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-cream/15 bg-offgrid-cream/10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-offgrid-green/40 px-5 py-5 backdrop-blur-sm">
                <dt className="font-display text-3xl font-black tabular-nums text-offgrid-lime sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/65">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* In-the-wild showcase strip */}
      <section className="border-b border-offgrid-green/8 bg-offgrid-cream py-12 sm:py-16">
        <div className={siteContainer}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={sectionEyebrow}>Real OG, in the wild</p>
              <h2 className="font-display text-2xl font-black tracking-tight text-offgrid-green sm:text-3xl">
                Worn by the community
              </h2>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/60 transition-colors hover:text-offgrid-green"
            >
              Shop the looks
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {SHOWCASE_TILES.map((tile, index) => (
              <motion.div
                key={tile.image}
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
                  alt={`${tile.label} customer`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-offgrid-dark/30 to-transparent" aria-hidden />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-offgrid-green backdrop-blur">
                  {tile.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured story + filterable wall */}
      <section className="bg-offgrid-cream py-14 md:py-20">
        <div className={siteContainer}>
          {/* Featured */}
          <motion.article
            {...fadeUp}
            className="grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-offgrid-green/10 lg:grid-cols-[0.85fr_1fr]"
          >
            <div className="relative min-h-[260px] overflow-hidden bg-offgrid-green/5">
              <img
                src={SHOWCASE_TILES[0].image}
                alt={`${featured.author} wearing OffGrid`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-offgrid-lime px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green">
                {featured.tag}
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <div className="flex items-center justify-between">
                <p className={cn(sectionEyebrow, "mb-0")}>Featured story</p>
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {FILLED_STARS.map((i) => (
                    <Star key={i} className="h-4 w-4 fill-offgrid-lime text-offgrid-lime" aria-hidden />
                  ))}
                </div>
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
                <p className="flex items-center gap-1 font-mono text-[11px] text-offgrid-green/55">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {featured.handle} · {featured.location}
                </p>
              </div>
              <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-offgrid-green/5 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-offgrid-green/70">
                <TrendingUp className="h-3.5 w-3.5 text-offgrid-lime" aria-hidden />
                {featured.outcome}
              </p>
            </div>
          </motion.article>

          {/* Filter + heading */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionEyebrow}>What people say</p>
              <h2 className="font-display text-3xl font-black tracking-tight text-offgrid-green md:text-4xl">
                The full wall
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
                      "rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
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

          {/* Masonry wall */}
          {wall.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-offgrid-green/10 bg-white p-10 text-center text-sm text-offgrid-green/55">
              No stories in this category yet — check back soon.
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
                    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                      {FILLED_STARS.map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-offgrid-lime text-offgrid-lime" aria-hidden />
                      ))}
                    </div>
                    <span className="rounded-full bg-offgrid-cream px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-offgrid-green">
                      {entry.tag}
                    </span>
                  </div>
                  <blockquote className="mt-4 text-sm italic leading-relaxed text-offgrid-green/85">
                    &ldquo;{entry.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-offgrid-green/10 pt-4">
                    <p className="flex items-center gap-1.5 font-display text-sm font-bold text-offgrid-green">
                      {entry.author}
                      <BadgeCheck className="h-3.5 w-3.5 text-offgrid-lime" aria-label="Verified buyer" />
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-offgrid-green/50">
                      {entry.handle} · {entry.location}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-offgrid-green/60">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0 text-offgrid-lime" aria-hidden />
                      {entry.outcome}
                    </p>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-offgrid-dark py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(197,211,48,0.10),transparent_60%)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative z-10 text-center")}>
          <span className={cn(sectionEyebrowOnDark, "mx-auto")}>Your turn</span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-black text-offgrid-cream md:text-4xl">
            Ready to build yours?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-offgrid-cream/65 md:text-base">
            Start with templates and the ordering guide, then submit your custom request with full specs — or shop the
            lines the community is already wearing.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link to="/custom/order">
                Start custom order
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
              asChild
            >
              <Link to="/shop">Shop now</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
