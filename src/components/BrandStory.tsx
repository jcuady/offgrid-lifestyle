import { motion } from "motion/react";
import { sectionPaddingDark, siteContainer } from "@/src/lib/brandLayout";
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
      {/* Refined atmosphere — a single soft accent glow + faint grid, nothing harsh */}
      <div
        className="pointer-events-none absolute -right-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-offgrid-lime/12 blur-[120px]"
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

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="order-2 min-w-0 lg:order-1 lg:col-span-6 xl:col-span-5"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-offgrid-lime" aria-hidden />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-lime">
                {story.eyebrow}
              </span>
            </div>

            <h2 className="mt-5 font-display text-4xl font-black leading-[1.0] tracking-tight text-offgrid-cream sm:text-5xl lg:text-6xl">
              {story.titleLine1}{" "}
              <span className="font-normal italic text-offgrid-cream/80">{story.titleLine2Italic}</span>
              {story.titleLine3 ? (
                <>
                  <br />
                  {story.titleLine3}
                </>
              ) : null}
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

            {story.closingQuote ? (
              <p className="mt-8 font-display text-lg italic text-offgrid-cream/40">{story.closingQuote}</p>
            ) : null}

            {/* Value trio — clean strip with vertical dividers */}
            {values.length > 0 ? (
              <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-offgrid-cream/10 bg-offgrid-cream/10 sm:grid-cols-3">
                {values.map((value, index) => (
                  <div key={value} className="bg-offgrid-dark px-4 py-5">
                    <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
                      {String(index + 1).padStart(2, "0")}
                    </dt>
                    <dd className="mt-2 font-display text-sm font-bold uppercase tracking-wide text-offgrid-cream sm:text-base">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative order-1 lg:order-2 lg:col-span-6 xl:col-span-7"
          >
            {/* Accent frame offset behind the image */}
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.75rem] border border-offgrid-lime/25"
              aria-hidden
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] ring-1 ring-offgrid-cream/10 sm:aspect-square lg:aspect-[5/6]">
              <img
                src={story.image}
                alt="OffGrid Lifestyle brand story"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/70 via-offgrid-dark/10 to-transparent" />

              {/* Sleek glass credential chip */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-lime font-display text-sm font-black leading-none text-white">
                  {(story.badgeEst || "EST").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "EST"}
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
        </div>
      </div>
    </section>
  );
}
