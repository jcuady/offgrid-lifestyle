import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef, type CSSProperties } from "react";

/**
 * OFF GRID® brand hero — full-bleed AI video background with a giant wordmark.
 * Colors/fonts pull from the Tailwind v4 @theme tokens in src/index.css
 * (Black / Electric Blue / near-white cream · Archivo display · Space Mono labels).
 *
 * NOTE: the default video is a third-party CloudFront asset; self-host it on your
 * own CDN before production so the hero never breaks if that URL goes away.
 */
const DEFAULT_HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

// Self-contained film grain (no global CSS class needed).
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  /** Small superscript brand mark on the last word (e.g. "®"). */
  mark?: string;
  style?: CSSProperties;
}

export const WordsPullUp = ({ text, className = "", mark, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 24, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.18em" }}
          >
            {word}
            {mark && isLast && (
              <span className="absolute top-[0.18em] -right-[0.42em] text-[0.26em]">{mark}</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- Hero ---------------- */
export interface OffgridHeroCta {
  label: string;
  onClick?: () => void;
}

export interface OffgridHeroProps {
  /** Big display word(s); rendered uppercase. */
  title: string;
  /** Superscript brand mark on the last title word (e.g. "®"). */
  mark?: string;
  /** Mono kicker, top-left. */
  badge?: string;
  /** Supporting paragraph, bottom-right. */
  description: string;
  primaryCta: OffgridHeroCta;
  secondaryCta?: OffgridHeroCta;
  /** Background video source. Defaults to the brand AI clip. */
  videoSrc?: string;
}

export function OffgridHero({
  title,
  mark,
  badge,
  description,
  primaryCta,
  secondaryCta,
  videoSrc = DEFAULT_HERO_VIDEO,
}: OffgridHeroProps) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-offgrid-dark" aria-label="OFF GRID hero">
      {/* Background video */}
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

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{ backgroundImage: NOISE_DATA_URI }}
        aria-hidden
      />

      {/* Legibility gradient — darker top (under nav) and bottom (under copy) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80" />

      {/* Top kicker */}
      {badge && (
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-[max(6rem,calc(env(safe-area-inset-top)+4.5rem))] z-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.34em] text-offgrid-cream/75 sm:left-6 md:left-10 md:text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-offgrid-lime shadow-[0_0_10px_var(--color-offgrid-lime)]" />
          {badge}
        </motion.p>
      )}

      {/* Hero content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pb-8">
        <div className="grid grid-cols-12 items-end gap-4">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-display font-black uppercase leading-[0.82] tracking-[-0.05em] text-offgrid-cream text-[24vw] drop-shadow-[0_2px_40px_rgba(0,0,0,0.6)] sm:text-[22vw] md:text-[20vw] lg:text-[16vw] xl:text-[15vw]">
              <WordsPullUp text={title} mark={mark} />
            </h1>
          </div>

          <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-10">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md font-sans text-sm font-light leading-snug text-offgrid-cream/80 sm:text-base"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={primaryCta.onClick}
                className="group inline-flex items-center gap-2 self-start rounded-full bg-offgrid-cream py-1 pl-5 pr-1 text-sm font-semibold text-offgrid-dark transition-all hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
              >
                {primaryCta.label}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-offgrid-lime transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-offgrid-cream" />
                </span>
              </button>

              {secondaryCta && (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="inline-flex items-center rounded-full border border-offgrid-cream/40 bg-offgrid-cream/5 px-5 py-2.5 text-sm font-semibold text-offgrid-cream backdrop-blur-sm transition-colors hover:bg-offgrid-cream hover:text-offgrid-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
                >
                  {secondaryCta.label}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OffgridHero;
