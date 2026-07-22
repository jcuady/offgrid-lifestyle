import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Layers, Palette, Shirt } from "lucide-react";
import {
  electricBluePill,
  monoLabelOnDark,
  sectionPaddingDark,
  sectionTitleOnDark,
  siteContainer,
} from "@/src/lib/brandLayout";
import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import { cn } from "@/src/lib/utils";

const STEPS = [
  { icon: Shirt, label: "Pick cut & fabric", detail: "Tops, bottoms, and sport-ready builds." },
  { icon: Palette, label: "Lock the artwork", detail: "Templates + free design support." },
  { icon: Layers, label: "Kit the squad", detail: "10-piece minimum · ships nationwide." },
] as const;

/** Homepage band — custom team kits, placed under Our Story. */
export function CustomOrdersBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="custom-orders"
      aria-labelledby="custom-orders-heading"
      className="relative overflow-hidden bg-offgrid-dark text-offgrid-cream"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-offgrid-lime) 1px, transparent 1px), linear-gradient(90deg, var(--color-offgrid-lime) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-offgrid-lime/20 blur-[120px]"
      />

      <div className={cn(siteContainer, sectionPaddingDark, "relative")}>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            className="lg:col-span-6"
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 18 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-80px" },
                  transition: { duration: 0.55 },
                })}
          >
            <span className={cn(monoLabelOnDark, "text-offgrid-cream/60")}>Custom team orders</span>
            <h2
              id="custom-orders-heading"
              className={cn(sectionTitleOnDark, "mt-3 max-w-xl text-balance")}
            >
              Kit the squad.{" "}
              <span className="font-normal italic text-white">One run. Full identity.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-offgrid-cream/75 md:text-lg">
              OFFGRID custom kits for ultimate frisbee, pickleball, golf, and running — cut, color,
              and artwork built for how your team plays.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/custom/order" className={cn(electricBluePill, "group justify-center px-5 py-2.5 text-xs")}>
                Start a team order
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/custom"
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-offgrid-cream/30 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-cream transition-colors hover:border-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-dark"
              >
                Ordering guide
              </Link>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, label, detail }) => (
                <li
                  key={label}
                  className="rounded-2xl border border-offgrid-cream/12 bg-offgrid-cream/[0.04] p-4"
                >
                  <Icon className="h-4 w-4 text-offgrid-lime" strokeWidth={1.75} aria-hidden />
                  <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    {label}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-offgrid-cream/65">{detail}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="relative lg:col-span-6"
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-80px" },
                  transition: { duration: 0.6, delay: 0.08 },
                })}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/15 sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src={COMMUNITY_PHOTO_PATHS.towelsWalk}
                alt="OFFGRID custom team gear on the field"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/90 via-offgrid-dark/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-lime">
                  From 10 pieces
                </p>
                <p className="mt-2 max-w-sm font-display text-2xl font-black tracking-tight text-offgrid-cream sm:text-3xl">
                  Built for teams that show up in the same kit.
                </p>
              </div>
            </div>
            <p
              aria-hidden
              className="pointer-events-none absolute -left-2 top-6 hidden font-display text-[7rem] font-black leading-none text-offgrid-cream/[0.06] lg:block"
            >
              KIT
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
