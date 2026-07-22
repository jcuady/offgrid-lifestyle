import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import {
  electricBluePill,
  sectionEyebrow,
  sectionPaddingCream,
  sectionTitle,
  siteContainer,
} from "@/src/lib/brandLayout";
import { BRAND_LOCATION } from "@/src/lib/brandLocation";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

/** 2nd homepage section — markets OFFGRID story with brand-first contrast. */
export function WhoWeAre() {
  const story = useSiteContentStore((s) => s.landingContent.brandStory);
  const reduceMotion = useReducedMotion();

  return (
    <section id="who-we-are" className={cn(sectionPaddingCream, "bg-offgrid-cream")}>
      <div className={cn(siteContainer, "grid items-center gap-10 lg:grid-cols-12 lg:gap-14")}>
        <motion.div
          className="lg:col-span-5"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-80px" },
                transition: { duration: 0.5 },
              })}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10">
            <img
              src={story.image}
              alt="OFFGRID athletes in motion"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-offgrid-dark/80 to-transparent p-5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                {story.badgeEst} {story.badgeLocality}
              </p>
              <p className="mt-1 text-sm text-offgrid-cream/80">{BRAND_LOCATION.shortLabel}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-7"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 18 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-80px" },
                transition: { duration: 0.55, delay: 0.05 },
              })}
        >
          <span className={sectionEyebrow}>{story.eyebrow}</span>
          <h2 className={cn(sectionTitle, "mt-2 max-w-xl")}>
            {story.titleLine1}{" "}
            <span className="font-normal italic">{story.titleLine2Italic}</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-offgrid-green/80 md:text-lg">
            {story.paragraph1}
          </p>
          {story.paragraph2 ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-offgrid-green/70">
              {story.paragraph2}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {[story.badgeGritty, story.badgeInMotion, story.badgeProudlyPinoy].filter(Boolean).map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-offgrid-green/15 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-offgrid-green/70"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/about" className={cn(electricBluePill, "group justify-center px-5 py-2.5 text-xs")}>
              Our full story
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-offgrid-green/20 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-green transition-colors hover:border-offgrid-lime hover:text-offgrid-lime"
            >
              Shop the line
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
