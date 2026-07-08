import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

const DEFAULT_HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

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
  videoSrc?: string;
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
  videoSrc = DEFAULT_HERO_VIDEO,
  titleStyle,
  descriptionStyle,
}: OffgridHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative flex min-h-[max(100svh,32rem)] w-full flex-col overflow-hidden bg-offgrid-dark"
      aria-label="OFF GRID hero"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />

      <div className="relative z-10 flex min-h-[max(100svh,32rem)] flex-1 flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+3.5rem))] sm:px-6 sm:pb-10 md:px-10">
        <div className="flex items-start justify-between gap-3">
          {badge ? (
            <motion.p
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex max-w-[70%] items-center gap-2 font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.2em] text-offgrid-cream/90 sm:max-w-none sm:text-xs sm:tracking-[0.24em]"
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
              className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/70 sm:text-xs sm:tracking-[0.22em]"
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
              <button
                type="button"
                onClick={primaryCta.onClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-offgrid-lime px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-white hover:text-offgrid-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-offgrid-dark sm:w-auto sm:py-3"
              >
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </button>

              {secondaryCta ? (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="inline-flex w-full items-center justify-center rounded-full border border-offgrid-cream/35 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:border-offgrid-cream hover:bg-offgrid-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-offgrid-dark sm:w-auto sm:py-3"
                >
                  {secondaryCta.label}
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default OffgridHero;
