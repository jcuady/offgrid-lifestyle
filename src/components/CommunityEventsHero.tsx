import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export interface CommunityEventsHeroProps {
  badge: string;
  date?: string;
  titleLine1: string;
  titleLine2Italic: string;
  description?: string;
  image: string;
  imageAlt: string;
  location?: string;
  category?: string;
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; onClick: () => void };
  headingStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  /** Homepage band vs full-page hero */
  variant?: "section" | "page";
  className?: string;
  id?: string;
}

export function CommunityEventsHero({
  badge,
  date,
  titleLine1,
  titleLine2Italic,
  description,
  image,
  imageAlt,
  location,
  category,
  primaryCta,
  secondaryCta,
  headingStyle,
  bodyStyle,
  variant = "section",
  className,
  id,
}: CommunityEventsHeroProps) {
  const isPage = variant === "page";

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden bg-offgrid-lime text-offgrid-cream",
        isPage ? "pt-28 pb-16 sm:pt-36 sm:pb-20" : sectionPaddingDark,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-[15%] top-0 h-[130%] w-[65%] rotate-[-14deg] bg-gradient-to-b from-white/30 via-white/10 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,transparent_45%)]" aria-hidden />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-offgrid-cream/40 bg-offgrid-cream/10 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-cream" aria-hidden />
              {badge}
            </div>

            {date ? (
              <p className="mb-4 font-mono text-5xl font-black tabular-nums leading-none tracking-tight text-offgrid-cream sm:text-6xl md:text-7xl">
                {date}
              </p>
            ) : null}

            <h2
              className={cn(
                sectionTitleOnDark,
                isPage ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl" : "mb-4",
              )}
              style={headingStyle}
            >
              {titleLine1}{" "}
              <span className="block font-normal italic text-white sm:inline">{titleLine2Italic}</span>
            </h2>

            {description ? (
              <p
                className={cn(
                  "max-w-md whitespace-pre-line leading-relaxed text-offgrid-cream/80",
                  isPage ? "mt-6 text-base md:text-lg" : "mt-4 text-sm md:text-base",
                )}
                style={bodyStyle}
              >
                {description}
              </p>
            ) : null}

            {primaryCta || secondaryCta ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl bg-offgrid-cream p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-4 md:p-5">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={image}
                  alt={imageAlt}
                  className="aspect-[4/3] w-full object-cover object-center lg:aspect-[16/10]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {location || category ? (
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-cream/90">
                {location ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-offgrid-cream/30 px-3 py-1.5">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                ) : null}
                {category ? (
                  <span className="rounded-full border border-offgrid-cream/30 px-3 py-1.5">{category}</span>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
