import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const DEFAULT_HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

function CountUp({ value, duration = 1.4 }: { value: number; duration?: number }) {
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
  stats,
  videoSrc = DEFAULT_HERO_VIDEO,
  titleStyle,
  descriptionStyle,
}: OffgridHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[32rem] w-full overflow-hidden bg-offgrid-dark" aria-label="OFF GRID hero">
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/80" />

      <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+3.5rem))] sm:px-6 md:px-10 md:pb-6">
        <div className="flex items-start justify-between gap-4">
          {badge ? (
            <motion.p
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-offgrid-cream/80"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
              {badge}
            </motion.p>
          ) : (
            <span />
          )}
          {locality ? (
            <motion.p
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-offgrid-cream/50 sm:block"
            >
              {locality}
            </motion.p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7"
            >
              <h1
                className="font-display font-black uppercase leading-[0.92] tracking-tight text-offgrid-cream text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                style={titleStyle}
              >
                {title}
                {mark ? <sup className="ml-0.5 text-[0.35em] font-bold">{mark}</sup> : null}
                {titleLine2 ? (
                  <span className="mt-2 block text-[0.72em] font-black tracking-tight text-white">{titleLine2}</span>
                ) : null}
              </h1>
              {tagline ? (
                <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/65 sm:text-xs">
                  {tagline}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col gap-5 lg:col-span-5 lg:pb-1"
            >
              <p
                className="max-w-md text-sm leading-relaxed text-offgrid-cream/75 sm:text-[15px]"
                style={descriptionStyle}
              >
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={primaryCta.onClick}
                  className="inline-flex items-center gap-2 rounded-full bg-offgrid-lime px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-white hover:text-offgrid-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime sm:text-sm"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </button>

                {secondaryCta ? (
                  <button
                    type="button"
                    onClick={secondaryCta.onClick}
                    className="inline-flex items-center rounded-full border border-offgrid-cream/35 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:border-offgrid-cream hover:bg-offgrid-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime sm:text-sm"
                  >
                    {secondaryCta.label}
                  </button>
                ) : null}
              </div>
            </motion.div>
          </div>

          {stats ? (
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-offgrid-cream/10 bg-offgrid-cream/5 sm:grid-cols-3 md:mt-10"
            >
              <div className="bg-black/35 px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="font-display text-2xl font-black tabular-nums text-offgrid-cream sm:text-3xl">
                  <CountUp value={stats.itemsSold} />+
                </p>
                <p className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-cream/50 sm:text-[10px]">
                  {stats.itemsSoldLabel}
                </p>
              </div>
              <div className="bg-black/35 px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="font-display text-2xl font-black tabular-nums text-offgrid-cream sm:text-3xl">
                  <CountUp value={stats.collectionsCount} />
                </p>
                <p className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-cream/50 sm:text-[10px]">
                  {stats.collectionsLabel}
                </p>
              </div>
              <div className="col-span-2 bg-black/35 px-4 py-3.5 sm:col-span-1 sm:px-5 sm:py-4">
                <p className="font-display text-base font-bold uppercase tracking-tight text-offgrid-cream sm:text-lg">
                  {stats.localityLine}
                </p>
                <p className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-offgrid-lime sm:text-[10px]">
                  {stats.localitySub}
                </p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default OffgridHero;
