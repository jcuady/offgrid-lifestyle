import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { COMMUNITY_COLLECTIONS } from "@/src/lib/communityPhotos";
import {
  sectionEyebrow,
  sectionPaddingCream,
  sectionTitle,
  siteContainer,
} from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export interface CommunityEventsSectionProps {
  badge: string;
  titleLine1: string;
  titleLine2Italic: string;
  description?: string;
  imageCaption?: string;
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; onClick: () => void };
  headingStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  variant?: "section" | "page";
  className?: string;
  id?: string;
}

export function CommunityEventsSection({
  badge,
  titleLine1,
  titleLine2Italic,
  description,
  imageCaption,
  primaryCta,
  secondaryCta,
  headingStyle,
  bodyStyle,
  variant = "section",
  className,
  id,
}: CommunityEventsSectionProps) {
  const isPage = variant === "page";
  const reduceMotion = useReducedMotion();
  const [feature, ...tiles] = COMMUNITY_COLLECTIONS;

  return (
    <section
      id={id}
      className={cn(
        "border-t border-offgrid-green/[0.06] bg-offgrid-cream text-offgrid-green",
        isPage ? "pt-28 pb-16 sm:pt-36 sm:pb-20" : sectionPaddingCream,
        className,
      )}
    >
      <div className={siteContainer}>
        <div className="mb-10 flex flex-col justify-between gap-8 border-b border-offgrid-green/10 pb-10 md:mb-14 md:flex-row md:items-end md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className={sectionEyebrow} style={bodyStyle}>
              {badge}
            </span>
            <h2
              className={cn(sectionTitle, isPage && "md:text-6xl lg:text-7xl")}
              style={headingStyle}
            >
              {titleLine1}{" "}
              <span className="font-normal italic">{titleLine2Italic}</span>
            </h2>
            {description ? (
              <p
                className="mt-5 max-w-xl text-base leading-relaxed text-offgrid-green/75 md:text-lg"
                style={bodyStyle}
              >
                {description}
              </p>
            ) : null}
          </motion.div>

          {primaryCta || secondaryCta ? (
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row"
            >
              {primaryCta ? (
                <Button
                  size="lg"
                  className="group w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
                  onClick={secondaryCta.onClick}
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </motion.div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[minmax(168px,1fr)] sm:gap-4">
          <motion.figure
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="group relative col-span-2 row-span-2 min-h-[280px] overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10 sm:min-h-[360px]"
          >
            <img
              src={feature.image}
              alt={feature.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/85 via-offgrid-dark/25 to-transparent" />
            <div className="absolute left-0 top-0 h-full w-1 bg-offgrid-lime" aria-hidden />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <span className="mb-2 inline-block rounded-full bg-offgrid-cream/95 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-green">
                {feature.tag}
              </span>
              <p className="font-display text-2xl font-black text-offgrid-cream sm:text-3xl">
                {feature.label}
              </p>
            </figcaption>
          </motion.figure>

          {tiles.map((item, index) => (
            <motion.figure
              key={item.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.06 + index * 0.05 }}
              className="group relative min-h-[168px] overflow-hidden rounded-2xl ring-1 ring-offgrid-green/10"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/80 via-offgrid-dark/20 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4">
                <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-offgrid-lime sm:text-[11px]">
                  {item.tag}
                </span>
                <p className="font-display text-sm font-black leading-tight text-offgrid-cream sm:text-base">
                  {item.label}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {imageCaption ? (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-green/55"
          >
            {imageCaption}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
