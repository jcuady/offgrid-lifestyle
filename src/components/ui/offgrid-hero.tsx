import { motion, useReducedMotion } from "motion/react";
import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import type { CSSProperties } from "react";
import { Button } from "@/src/components/ui/Button";

const DEFAULT_HERO_IMAGE = COMMUNITY_PHOTO_PATHS.ultimateCatch;

export interface OffgridHeroCta {
  label: string;
  onClick?: () => void;
}

export interface OffgridHeroProps {
  title: string;
  titleLine2?: string;
  mark?: string;
  badge?: string;
  tagline?: string;
  locality?: string;
  description: string;
  primaryCta: OffgridHeroCta;
  secondaryCta?: OffgridHeroCta;
  /** When set, plays as full-bleed background. Prefer sports still via imageSrc. */
  videoSrc?: string;
  imageSrc?: string;
  titleStyle?: CSSProperties;
  descriptionStyle?: CSSProperties;
}

export function OffgridHero({
  title,
  titleLine2,
  mark,
  badge,
  tagline,
  locality,
  description,
  primaryCta,
  secondaryCta,
  videoSrc = "",
  imageSrc = DEFAULT_HERO_IMAGE,
  titleStyle,
  descriptionStyle,
}: OffgridHeroProps) {
  const reduceMotion = useReducedMotion();
  const useVideo = Boolean(videoSrc?.trim());

  return (
    <section
      className="relative flex min-h-[max(100svh,32rem)] w-full flex-col overflow-hidden bg-offgrid-dark"
      aria-label="OFFGRID hero"
    >
      {useVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={imageSrc}
        />
      ) : (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/80" />

      <div className="relative z-10 flex min-h-[max(100svh,32rem)] flex-1 flex-col px-[clamp(1rem,4vw,2.5rem)] pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(var(--og-header-height,4.5rem)+0.85rem))] sm:pb-10">
        <div className="flex items-start justify-between gap-3">
          {badge ? (
            <motion.p
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex max-w-[min(72%,28rem)] items-center gap-2 font-mono text-[clamp(0.625rem,0.55rem+0.3vw,0.75rem)] font-bold uppercase leading-snug tracking-[0.18em] text-offgrid-cream/90 sm:tracking-[0.24em]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-offgrid-lime" />
              {badge}
            </motion.p>
          ) : (
            <span />
          )}
          {locality ? (
            <motion.p
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="shrink-0 font-mono text-[clamp(0.625rem,0.55rem+0.3vw,0.75rem)] font-bold uppercase tracking-[0.16em] text-offgrid-cream/70 sm:tracking-[0.22em]"
            >
              {locality}
            </motion.p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-6 pt-10 sm:gap-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="lg:col-span-7"
          >
            <h1
              className="font-display text-[clamp(2.75rem,13vw,3.5rem)] font-black uppercase leading-[0.9] tracking-tight text-offgrid-cream sm:text-6xl md:text-7xl lg:text-8xl"
              style={titleStyle}
            >
              {title}
              {mark ? <sup className="ml-0.5 text-[0.35em] font-bold">{mark}</sup> : null}
              {titleLine2 ? (
                <span className="mt-1.5 block text-[0.7em] font-black tracking-tight text-white sm:mt-2">
                  {titleLine2}
                </span>
              ) : null}
            </h1>
            {tagline ? (
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-offgrid-cream/80 sm:mt-4 sm:text-sm sm:tracking-[0.2em]">
                {tagline}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="flex flex-col gap-5 lg:col-span-5"
          >
            {description ? (
              <p
                className="max-w-md border-l-2 border-offgrid-lime pl-4 text-lg font-semibold leading-snug text-offgrid-cream sm:text-xl lg:max-w-sm"
                style={descriptionStyle}
              >
                {description}
              </p>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="accent"
                onClick={primaryCta.onClick}
                className="w-full text-sm font-bold uppercase tracking-[0.12em] focus-visible:ring-offgrid-lime focus-visible:ring-offset-offgrid-dark sm:w-auto"
              >
                {primaryCta.label}
              </Button>

              {secondaryCta ? (
                <Button
                  type="button"
                  variant="outlineInverse"
                  onClick={secondaryCta.onClick}
                  className="w-full text-sm font-bold uppercase tracking-[0.1em] focus-visible:ring-offgrid-lime focus-visible:ring-offset-offgrid-dark sm:w-auto"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default OffgridHero;
