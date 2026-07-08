import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

/** Gritty editorial still — brand imagery, not event-specific. */
const DEFAULT_HERO_IMAGE = "/images/brand-story-editorial.jpg";

function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}
    </span>
  );
}

export interface OffgridHeroCta {
  label: string;
  onClick?: () => void;
}

export interface OffgridHeroStats {
  itemsSold: number;
  collectionsCount: number;
  itemsSoldLabel: string;
  collectionsLabel: string;
  localityLine: string;
  localitySub: string;
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
  stats?: OffgridHeroStats;
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
  stats,
  imageSrc = DEFAULT_HERO_IMAGE,
  titleStyle,
  descriptionStyle,
}: OffgridHeroProps) {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <section
      className="relative min-h-[min(92svh,920px)] w-full overflow-hidden bg-offgrid-green text-offgrid-cream"
      aria-label="OFF GRID hero"
    >
      <img
        src={imageSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/25"
        aria-hidden
      />

      <div
        className={cn(
          siteContainer,
          "relative z-10 flex min-h-[min(92svh,920px)] flex-col justify-between py-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-8",
        )}
      >
        <motion.div {...fade} transition={{ duration: 0.55 }} className="flex items-center justify-between gap-4">
          {badge ? (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-cream/70">
              {badge}
            </p>
          ) : (
            <span />
          )}
          {locality ? (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-offgrid-cream/50">
              {locality}
            </p>
          ) : null}
        </motion.div>

        <div className="flex flex-1 flex-col justify-center py-10 md:py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <motion.div
              {...fade}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:col-span-7"
            >
              <h1
                className="font-display text-[2.75rem] font-black uppercase leading-[0.9] tracking-[-0.04em] text-offgrid-cream sm:text-6xl md:text-7xl lg:text-8xl"
                style={titleStyle}
              >
                {title}
                {mark ? <span className="align-super text-[0.35em]">{mark}</span> : null}
                {titleLine2 ? (
                  <span className="mt-1 block text-[0.72em] tracking-[-0.03em] text-white">{titleLine2}</span>
                ) : null}
              </h1>
              {tagline ? (
                <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-offgrid-lime sm:text-xs">
                  {tagline}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              {...fade}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="lg:col-span-5"
            >
              <p
                className="max-w-md text-sm leading-relaxed text-offgrid-cream/75 sm:text-base"
                style={descriptionStyle}
              >
                {description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={primaryCta.onClick}
                  className="inline-flex items-center gap-2 rounded-full bg-offgrid-lime px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-offgrid-cream transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </button>
                {secondaryCta ? (
                  <button
                    type="button"
                    onClick={secondaryCta.onClick}
                    className="inline-flex items-center rounded-full border border-offgrid-cream/35 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:bg-offgrid-cream hover:text-offgrid-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime sm:text-sm"
                  >
                    {secondaryCta.label}
                  </button>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>

        {stats ? (
          <motion.div
            {...fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-stretch gap-px border-t border-offgrid-cream/15 pt-6"
          >
            <div className="min-w-[40%] flex-1 py-1 pr-6 sm:min-w-0">
              <p className="font-display text-2xl font-black tabular-nums text-offgrid-cream sm:text-3xl">
                <CountUp value={stats.itemsSold} />+
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-cream/50">
                {stats.itemsSoldLabel}
              </p>
            </div>
            <div className="min-w-[40%] flex-1 border-l border-offgrid-cream/15 py-1 pl-6 sm:min-w-0">
              <p className="font-display text-2xl font-black tabular-nums text-offgrid-cream sm:text-3xl">
                <CountUp value={stats.collectionsCount} />
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-cream/50">
                {stats.collectionsLabel}
              </p>
            </div>
            <div className="w-full border-t border-offgrid-cream/15 pt-4 sm:mt-0 sm:w-auto sm:border-l sm:border-t-0 sm:pl-6 sm:pt-1">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-offgrid-cream sm:text-sm">
                {stats.localityLine}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-lime">
                {stats.localitySub}
              </p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

export default OffgridHero;
