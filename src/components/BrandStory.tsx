import { motion } from "motion/react";
import { sectionEyebrowOnDark, sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

export function BrandStory() {
  const story = useSiteContentStore((s) => s.landingContent.brandStory);

  const values = [story.badgeGritty, story.badgeInMotion, story.badgeProudlyPinoy].filter(Boolean);

  return (
    <section
      id="about"
      className={cn(sectionPaddingDark, "relative overflow-hidden bg-offgrid-dark text-offgrid-cream")}
    >
      {/* Subtle, on-brand atmosphere (no decorative skew panels) */}
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-offgrid-lime/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-offgrid-cream) 1px, transparent 1px), linear-gradient(to bottom, var(--color-offgrid-cream) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-16">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/10 md:aspect-square">
              <img
                src={story.image}
                alt="OffGrid Lifestyle brand story"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/60 via-transparent to-transparent" />
            </div>

            {/* EST. badge — solid electric-blue block */}
            <div className="absolute -bottom-5 left-5 rounded-xl bg-offgrid-lime px-5 py-4 text-white shadow-xl sm:-bottom-6 sm:left-8">
              <p className="font-display text-3xl font-black leading-none">{story.badgeEst}</p>
              <p className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">
                {story.badgeLocality}
              </p>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="min-w-0 max-w-xl"
          >
            <span className={sectionEyebrowOnDark}>{story.eyebrow}</span>
            <h2 className={cn(sectionTitleOnDark, "mb-7 leading-[1.02]")}>
              {story.titleLine1}{" "}
              <span className="font-normal italic text-white">{story.titleLine2Italic}</span>
              {story.titleLine3 ? (
                <>
                  <br />
                  {story.titleLine3}
                </>
              ) : null}
            </h2>

            <div className="space-y-4 text-base leading-relaxed text-offgrid-cream/70 md:text-lg">
              <p>{story.paragraph1}</p>
              <p>{story.paragraph2}</p>
            </div>

            {/* Emphasized closing statement (the "highlight" now actually reads as one) */}
            {(story.paragraph3Prefix || story.paragraph3Highlight) && (
              <div className="mt-8 border-l-2 border-offgrid-lime pl-5">
                {story.paragraph3Prefix ? (
                  <p className="text-sm text-offgrid-cream/55">{story.paragraph3Prefix}</p>
                ) : null}
                {story.paragraph3Highlight ? (
                  <p className="mt-1 font-display text-xl font-bold leading-snug text-offgrid-cream sm:text-2xl">
                    {story.paragraph3Highlight}
                  </p>
                ) : null}
              </div>
            )}

            {story.closingQuote ? (
              <p className="mt-8 font-display text-lg italic text-offgrid-cream/40">{story.closingQuote}</p>
            ) : null}

            {/* Value trio — icon-free, accent-rule typographic system */}
            {values.length > 0 ? (
              <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-offgrid-cream/10 pt-8 sm:grid-cols-3 sm:gap-6">
                {values.map((value, index) => (
                  <div key={value} className="min-w-0">
                    <span className="block h-0.5 w-8 rounded-full bg-offgrid-lime" aria-hidden />
                    <dt className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/50">
                      {String(index + 1).padStart(2, "0")}
                    </dt>
                    <dd className="mt-1 font-display text-sm font-bold uppercase tracking-wide text-offgrid-cream sm:text-base">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
