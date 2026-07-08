import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Editorial Swiss hero — full-bleed video, massive staggered type, stat strip.
 * Swiss 721 display · TG Frekuent Mono labels · black / white / electric blue.
 */
const DEFAULT_HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface WordsPullUpProps {
  text: string;
  className?: string;
  mark?: string;
  style?: CSSProperties;
  delay?: number;
}

export const WordsPullUp = ({ text, className = "", mark, style, delay = 0 }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: reduceMotion ? 0 : 28, opacity: reduceMotion ? 1 : 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.65, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.16em" }}
          >
            {word}
            {mark && isLast && (
              <span className="absolute top-[0.15em] -right-[0.45em] text-[0.28em]">{mark}</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

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
    <section className="relative h-[100svh] w-full overflow-hidden bg-offgrid-dark" aria-label="OFF GRID hero">
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

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] mix-blend-overlay"
        style={{ backgroundImage: NOISE_DATA_URI }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" />

      <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))] sm:px-6 md:px-10 md:pb-8">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          {badge ? (
            <motion.p
              initial={{ y: reduceMotion ? 0 : 12, opacity: reduceMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-offgrid-cream/75 md:text-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-lime shadow-[0_0_10px_var(--color-offgrid-lime)]" />
              {badge}
            </motion.p>
          ) : (
            <span />
          )}
          {locality ? (
            <motion.p
              initial={{ y: reduceMotion ? 0 : 12, opacity: reduceMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-offgrid-cream/55 sm:block"
            >
              {locality}
            </motion.p>
          ) : null}
        </div>

        {/* Main headline block */}
        <div className="flex flex-1 flex-col justify-end">
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <h1
                className="font-display font-black uppercase leading-[0.82] tracking-[-0.05em] text-offgrid-cream drop-shadow-[0_2px_40px_rgba(0,0,0,0.55)] text-[18vw] sm:text-[16vw] md:text-[13vw] lg:text-[11vw] xl:text-[10rem]"
                style={titleStyle}
              >
                <WordsPullUp text={title} mark={mark} delay={0.1} />
                {titleLine2 ? (
                  <span className="mt-1 block text-[0.55em] tracking-[-0.04em] text-white/95">
                    <WordsPullUp text={titleLine2} delay={0.35} />
                  </span>
                ) : null}
              </h1>
              {tagline ? (
                <motion.p
                  initial={{ y: reduceMotion ? 0 : 16, opacity: reduceMotion ? 1 : 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                  className="mt-4 max-w-xl font-display text-xl italic text-offgrid-cream/90 sm:text-2xl md:text-3xl"
                >
                  {tagline}
                </motion.p>
              ) : null}
            </div>

            <div className="flex flex-col gap-5 lg:col-span-4 lg:pb-2">
              <motion.p
                initial={{ y: reduceMotion ? 0 : 18, opacity: reduceMotion ? 1 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="max-w-md text-sm leading-relaxed text-offgrid-cream/75 sm:text-base"
                style={descriptionStyle}
              >
                {description}
              </motion.p>

              <motion.div
                initial={{ y: reduceMotion ? 0 : 18, opacity: reduceMotion ? 1 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.75 }}
                className="flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={primaryCta.onClick}
                  className="group inline-flex items-center gap-2 rounded-full bg-offgrid-lime py-2.5 pl-6 pr-2 text-sm font-bold uppercase tracking-[0.1em] text-offgrid-cream transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
                >
                  {primaryCta.label}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-offgrid-cream text-offgrid-lime transition-transform group-hover:translate-x-0.5 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>

                {secondaryCta ? (
                  <button
                    type="button"
                    onClick={secondaryCta.onClick}
                    className="inline-flex items-center rounded-full border border-offgrid-cream/40 bg-offgrid-cream/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-offgrid-cream backdrop-blur-sm transition-colors hover:border-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime sm:text-base"
                  >
                    {secondaryCta.label}
                  </button>
                ) : null}
              </motion.div>
            </div>
          </div>

          {stats ? (
            <motion.div
              initial={{ y: reduceMotion ? 0 : 20, opacity: reduceMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-cream/15 bg-offgrid-cream/10 backdrop-blur-md sm:grid-cols-3 md:mt-12"
            >
              <div className="bg-black/40 px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-display text-3xl font-black tabular-nums text-offgrid-cream sm:text-4xl">
                  <CountUp value={stats.itemsSold} />+
                </p>
                <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/55">
                  {stats.itemsSoldLabel}
                </p>
              </div>
              <div className="bg-black/40 px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-display text-3xl font-black tabular-nums text-offgrid-cream sm:text-4xl">
                  <CountUp value={stats.collectionsCount} />
                </p>
                <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-cream/55">
                  {stats.collectionsLabel}
                </p>
              </div>
              <div className="col-span-2 bg-black/40 px-5 py-4 sm:col-span-1 sm:px-6 sm:py-5">
                <p className="font-display text-lg font-bold uppercase tracking-tight text-offgrid-cream sm:text-xl">
                  {stats.localityLine}
                </p>
                <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-offgrid-lime">
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
