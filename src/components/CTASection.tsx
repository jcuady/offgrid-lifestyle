import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Truck, RefreshCcw, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { COMMUNITY_PHOTO_PATHS } from "@/src/lib/communityPhotos";
import {
  monoLabelOnDark,
  sectionPaddingDark,
  sectionTitleOnDark,
  siteContainer,
} from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

/** UiUX Element 10 — photo-led closing CTA (Discfest, Greatest x OG, Towels). */
const CLOSING_PHOTOS = [
  {
    src: COMMUNITY_PHOTO_PATHS.ultimateSkyball,
    alt: "Off Grid community at Discfest",
    className: "col-span-7 row-span-2",
  },
  {
    src: COMMUNITY_PHOTO_PATHS.ogBackpack,
    alt: "OFF GRID Pilipinas backpack on the field",
    className: "col-span-5 row-span-1",
  },
  {
    src: COMMUNITY_PHOTO_PATHS.towelsWalk,
    alt: "Custom OG lifestyle towels on the pitch",
    className: "col-span-5 row-span-1",
  },
] as const;

export function CTASection() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const cta = useSiteContentStore((state) => state.landingContent.cta);
  const tagline = useSiteContentStore((state) => state.landingContent.footer.taglineLine1);
  const typography = useSiteContentStore((state) => state.landingContent.typography.cta);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const trustBadges = [
    { label: cta.trustShipping, icon: <Truck className="h-5 w-5" /> },
    { label: cta.trustReturns, icon: <RefreshCcw className="h-5 w-5" /> },
    { label: cta.trustShips, icon: <MapPin className="h-5 w-5" /> },
    { label: cta.trustCheckout, icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  const motionProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true, margin: "-60px" } as const,
          transition: { duration: 0.55, delay } as const,
        };

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-offgrid-dark text-offgrid-cream"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-offgrid-cream/10" />

      <div className={cn(siteContainer, sectionPaddingDark)}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div {...motionProps(0)} className="lg:col-span-5">
            <span className={cn(monoLabelOnDark, "text-offgrid-cream/60")}>Final call</span>

            <h2
              id="final-cta-heading"
              className={cn(sectionTitleOnDark, "mt-4")}
              style={headingStyle}
            >
              {cta.titleLine1}
              <br />
              <span className="text-white">{cta.titleLine2}</span>
            </h2>

            <p
              className="mt-5 max-w-md text-base leading-relaxed text-offgrid-cream/80 md:text-lg"
              style={bodyStyle}
            >
              {cta.priceFallback}
            </p>

            <p className="mt-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-offgrid-cream/65">
              {tagline}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="group h-16 w-full px-12 text-lg font-bold sm:w-auto"
                onClick={() => navigate("/shop")}
              >
                {cta.ctaShop}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-16 w-full border-offgrid-cream/40 bg-transparent px-12 text-lg text-offgrid-cream hover:border-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
                onClick={() => navigate("/about")}
              >
                {cta.ctaStory}
              </Button>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-offgrid-cream/10 pt-8 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <li key={badge.label} className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                  <span className="text-offgrid-lime">{badge.icon}</span>
                  <span className="font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-offgrid-cream/70 sm:text-xs">
                    {badge.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...motionProps(0.08)}
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-12 grid-rows-2 gap-3 sm:gap-4">
              {CLOSING_PHOTOS.map((photo) => (
                <div
                  key={photo.src}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl ring-1 ring-offgrid-cream/10",
                    photo.className,
                    "min-h-[140px] sm:min-h-[180px]",
                  )}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute left-0 top-0 h-full w-1 bg-offgrid-lime/80" aria-hidden />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-offgrid-cream/20 to-transparent" />
    </section>
  );
}
