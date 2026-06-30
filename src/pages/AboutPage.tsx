import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Layers, Shirt, Users } from "lucide-react";
import { siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { hydrateSiteContentFromSupabase } from "@/src/services";
import { cn } from "@/src/lib/utils";

const VALUE_COPY: Record<string, string> = {
  Gritty:
    "Built for real conditions and real effort — pieces engineered to hold up wash after wash, session after session.",
  "In Motion":
    "Designed around movement first. Cuts, fabrics, and finishes that move with you on the court, the course, and the everyday.",
  "Proudly Pinoy":
    "Made for Filipino athletes and the way we play. Local pride, world-class standards, shipped nationwide.",
};

const PILLARS: {
  icon: typeof Shirt;
  title: string;
  description: string;
  to: string;
  cta: string;
}[] = [
  {
    icon: Shirt,
    title: "Everyday Sportswear",
    description: "Performance apparel and lifestyle staples for golf, pickleball, running, and rest day.",
    to: "/shop",
    cta: "Shop the collection",
  },
  {
    icon: Layers,
    title: "Custom Team Kits",
    description: "Full custom jerseys and team apparel — free design support, 8–15 day production.",
    to: "/custom",
    cta: "Start a custom order",
  },
  {
    icon: Users,
    title: "Community & Events",
    description: "More than a brand — gatherings and experiences that bring the movement together.",
    to: "/events",
    cta: "See what's on",
  },
];

const STATS: { value: string; label: string }[] = [
  { value: "EST. 2024", label: "Manila, PH" },
  { value: "Nationwide", label: "Shipping + tracking" },
  { value: "8–15 days", label: "Custom production" },
  { value: "Free", label: "Design support" },
];

export function AboutPage() {
  const story = useSiteContentStore((s) => s.landingContent.brandStory);

  const values = [story.badgeGritty, story.badgeInMotion, story.badgeProudlyPinoy]
    .filter(Boolean)
    .map((title) => ({
      title,
      description:
        VALUE_COPY[title] ??
        "Thoughtfully made apparel for athletes who play different and live off grid.",
    }));

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
    document.title = "About Us — OffGrid Lifestyle";
    return () => {
      document.title = "OffGrid Lifestyle";
    };
  }, []);

  return (
    <div className="bg-offgrid-cream">
      {/* Hero — editorial, oversized display type on black */}
      <section className="relative overflow-hidden bg-offgrid-dark text-offgrid-cream">
        <div
          className="pointer-events-none absolute -right-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-offgrid-lime/12 blur-[130px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-offgrid-cream) 1px, transparent 1px), linear-gradient(to bottom, var(--color-offgrid-cream) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div
          className={cn(
            siteContainer,
            "relative z-10 pb-16 pt-28 sm:pb-20 sm:pt-36 md:pb-24 md:pt-40",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-offgrid-lime" aria-hidden />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-lime">
                About Us
              </span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {story.titleLine1}{" "}
              <span className="font-normal italic normal-case text-offgrid-cream/80">
                {story.titleLine2Italic}
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-offgrid-cream/70 sm:text-lg">
              {story.paragraph1}
            </p>
          </motion.div>

          {/* Meta strip */}
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-cream/10 bg-offgrid-cream/10 sm:mt-16 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.value} className="bg-offgrid-dark px-4 py-5 sm:px-5 sm:py-6">
                <p className="font-display text-xl font-black tracking-tight text-offgrid-cream sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/55">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative + image */}
      <section className="relative overflow-hidden bg-offgrid-dark py-16 text-offgrid-cream sm:py-20 md:py-24">
        <div className={cn(siteContainer, "relative z-10")}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative order-1 lg:col-span-6"
            >
              <div
                className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.75rem] border border-offgrid-lime/25"
                aria-hidden
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] ring-1 ring-offgrid-cream/10 sm:aspect-square lg:aspect-[5/6]">
                <img
                  src={story.image}
                  alt="OffGrid Lifestyle"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/70 via-offgrid-dark/10 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-lime font-display text-sm font-black leading-none text-white">
                    OG
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-black leading-none text-white">{story.badgeEst}</p>
                    <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                      {story.badgeLocality}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-2 min-w-0 lg:col-span-6"
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-offgrid-lime" aria-hidden />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-lime">
                  {story.eyebrow}
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
                {story.titleLine1}{" "}
                <span className="font-normal italic">{story.titleLine2Italic}</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-offgrid-cream/65 sm:text-lg">
                <p>{story.paragraph1}</p>
                <p>{story.paragraph2}</p>
              </div>
              {(story.paragraph3Prefix || story.paragraph3Highlight) && (
                <div className="mt-8 rounded-2xl border border-offgrid-cream/10 bg-offgrid-cream/[0.03] p-5 sm:p-6">
                  <span className="block h-1 w-10 rounded-full bg-offgrid-lime" aria-hidden />
                  {story.paragraph3Prefix ? (
                    <p className="mt-4 text-sm text-offgrid-cream/55">{story.paragraph3Prefix}</p>
                  ) : null}
                  {story.paragraph3Highlight ? (
                    <p className="mt-1.5 font-display text-xl font-bold leading-snug text-offgrid-cream sm:text-2xl">
                      {story.paragraph3Highlight}
                    </p>
                  ) : null}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-offgrid-cream py-16 sm:py-20 md:py-24">
        <div className={siteContainer}>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-offgrid-lime" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-green/55">
              What we stand for
            </span>
          </div>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-black leading-[1.02] tracking-tight text-offgrid-green sm:text-4xl lg:text-5xl">
            Principles stitched into everything we make.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="rounded-2xl border border-offgrid-green/10 bg-white p-6 shadow-sm sm:p-7"
              >
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-lime">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-black uppercase tracking-tight text-offgrid-green sm:text-2xl">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-offgrid-green/65">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars — what we do */}
      <section className="bg-offgrid-cream pb-16 sm:pb-20 md:pb-24">
        <div className={siteContainer}>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-offgrid-lime" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-green/55">
              What we do
            </span>
          </div>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-black leading-[1.02] tracking-tight text-offgrid-green sm:text-4xl lg:text-5xl">
            From the rack to your roster.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-3 md:gap-6">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <Link
                  to={pillar.to}
                  className="group flex h-full flex-col rounded-2xl border border-offgrid-green/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:ring-1 hover:ring-offgrid-lime/40 sm:p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-offgrid-green text-offgrid-cream transition-colors group-hover:bg-offgrid-lime">
                    <pillar.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-offgrid-green">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-offgrid-green/65">
                    {pillar.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-green transition-colors group-hover:text-offgrid-lime">
                    {pillar.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statement band */}
      <section className="bg-offgrid-lime py-16 text-offgrid-cream sm:py-20 md:py-24">
        <div className={cn(siteContainer, "text-center")}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl font-display text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
          >
            {story.paragraph3Highlight || "It's found in the way we live, move, and make things our own."}
          </motion.p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-offgrid-dark py-16 text-offgrid-cream sm:py-20 md:py-24">
        <div className={cn(siteContainer, "text-center")}>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
            Find your movement.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-offgrid-cream/65 sm:text-lg">
            Shop the collection or build a custom kit for your team — designed for the way you play.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex w-full items-center justify-center rounded-full bg-offgrid-cream px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-green transition-colors hover:bg-white sm:w-auto"
            >
              Shop now
            </Link>
            <Link
              to="/custom"
              className="inline-flex w-full items-center justify-center rounded-full border border-offgrid-cream/30 px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-cream transition-colors hover:border-offgrid-cream hover:bg-offgrid-cream/10 sm:w-auto"
            >
              Start a custom order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
