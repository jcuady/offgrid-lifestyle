import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export interface CommunityEventsHeroProps {
  badge: string;
  titleLine1: string;
  titleLine2Italic: string;
  description?: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; onClick: () => void };
  headingStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  variant?: "section" | "page";
  className?: string;
  id?: string;
}

/** Evergreen gathering formats — kept general, never a single ongoing event. */
const EVENT_FORMATS = ["Tournaments", "Community Play", "Capsule Launches", "Workshops"];

export function CommunityEventsHero({
  badge,
  titleLine1,
  titleLine2Italic,
  description,
  image,
  imageAlt,
  imageCaption,
  primaryCta,
  secondaryCta,
  headingStyle,
  bodyStyle,
  variant = "section",
  className,
  id,
}: CommunityEventsHeroProps) {
  const isPage = variant === "page";
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden bg-offgrid-lime text-offgrid-cream",
        isPage ? "pt-28 pb-16 sm:pt-36 sm:pb-20" : sectionPaddingDark,
        className,
      )}
    >
      {/* Oversized brand watermark for editorial depth */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display text-[7rem] font-black leading-none tracking-tighter text-white/[0.06] sm:text-[10rem] md:text-[13rem]"
      >
        OG®
      </span>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-offgrid-cream/40 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-cream" aria-hidden />
              {badge}
            </div>

            <h2
              className={cn(
                sectionTitleOnDark,
                "mt-5",
                isPage ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl md:text-6xl",
              )}
              style={headingStyle}
            >
              <span className="block">{titleLine1}</span>
              <span className="mt-1 block font-normal italic text-white">{titleLine2Italic}</span>
            </h2>

            {description ? (
              <p
                className={cn(
                  "mt-5 max-w-md text-base leading-relaxed text-offgrid-cream/85 md:text-lg",
                  isPage && "md:max-w-lg",
                )}
                style={bodyStyle}
              >
                {description}
              </p>
            ) : null}

            <ul className="mt-7 flex flex-wrap gap-2">
              {EVENT_FORMATS.map((format) => (
                <li
                  key={format}
                  className="rounded-full border border-offgrid-cream/25 bg-offgrid-cream/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-offgrid-cream/80"
                >
                  {format}
                </li>
              ))}
            </ul>

            {primaryCta || secondaryCta ? (
              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                {primaryCta ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="group w-full border-offgrid-cream bg-offgrid-cream text-offgrid-green hover:bg-white sm:w-auto"
                    onClick={primaryCta.onClick}
                  >
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : null}
                {secondaryCta ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-offgrid-cream/50 bg-transparent text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
                    onClick={secondaryCta.onClick}
                  >
                    {secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="lg:col-span-7"
          >
            <div className="group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/15 sm:rounded-3xl">
              <div className="relative aspect-[4/3] lg:aspect-[16/11]">
                <img
                  src={image}
                  alt={imageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute left-0 top-0 h-full w-1 bg-offgrid-cream/70" aria-hidden />

                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-offgrid-cream/15 text-offgrid-cream backdrop-blur-md sm:right-5 sm:top-5">
                  <ArrowUpRight className="h-4 w-4" />
                </span>

                {imageCaption ? (
                  <p className="absolute inset-x-4 bottom-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/90 sm:inset-x-5 sm:bottom-5">
                    {imageCaption}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
