import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Instagram, Facebook, Truck, RefreshCcw, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { GLSLHills } from "@/src/components/ui/glsl-hills";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { cn } from "@/src/lib/utils";

export function CTASection() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const cta = useSiteContentStore((state) => state.landingContent.cta);
  const team = useSiteContentStore((state) => state.landingContent.teamCommunity);
  const tagline = useSiteContentStore((state) => state.landingContent.footer.taglineLine1);
  const typography = useSiteContentStore((state) => state.landingContent.typography.cta);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const socialLinks = [
    { label: "Instagram", href: team.instagramUrl, icon: <Instagram className="h-5 w-5" /> },
    { label: "Facebook", href: team.facebookUrl, icon: <Facebook className="h-5 w-5" /> },
  ];

  const trustBadges = [
    { label: cta.trustShipping, icon: <Truck className="h-6 w-6 text-offgrid-lime sm:h-7 sm:w-7" /> },
    { label: cta.trustReturns, icon: <RefreshCcw className="h-6 w-6 text-offgrid-lime sm:h-7 sm:w-7" /> },
    { label: cta.trustShips, icon: <MapPin className="h-6 w-6 text-offgrid-lime sm:h-7 sm:w-7" /> },
    { label: cta.trustCheckout, icon: <ShieldCheck className="h-6 w-6 text-offgrid-lime sm:h-7 sm:w-7" /> },
  ];

  const motionProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true } as const,
          transition: { duration: 0.6, delay } as const,
        };

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-offgrid-dark text-offgrid-cream sm:min-h-screen">
      <GLSLHills className="absolute inset-0 z-0" width="100%" height="100%" cameraZ={125} speed={0.45} />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-offgrid-dark/90 via-offgrid-dark/50 to-offgrid-dark/80"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 sm:min-h-screen sm:py-28">
        <div className="mx-auto w-full max-w-3xl text-center">
          <motion.span
            {...(reduceMotion
              ? {}
              : {
                  initial: { scaleX: 0, opacity: 0 },
                  whileInView: { scaleX: 1, opacity: 1 },
                  viewport: { once: true },
                  transition: { duration: 0.6 },
                })}
            className="mx-auto mb-8 block h-px w-16 bg-offgrid-lime"
          />

          <motion.h2
            {...motionProps(0.05)}
            className="font-display text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
            style={headingStyle}
          >
            {cta.titleLine1}
            <br />
            <span className="text-offgrid-cream">{cta.titleLine2}</span>
          </motion.h2>

          <motion.p
            {...motionProps(0.12)}
            className="mx-auto mt-6 max-w-md font-display text-lg italic text-offgrid-cream/75 sm:text-xl"
            style={bodyStyle}
          >
            {tagline}
          </motion.p>

          <motion.div
            {...motionProps(0.2)}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="group h-14 w-full px-10 text-base sm:w-auto"
              onClick={() => navigate("/shop")}
            >
              {cta.ctaShop}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "h-14 w-full border-offgrid-cream/50 bg-offgrid-cream/5 px-10 text-base text-offgrid-cream",
                "backdrop-blur-sm hover:border-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto",
              )}
              onClick={() => navigate("/about")}
            >
              {cta.ctaStory}
            </Button>
          </motion.div>

          <motion.div
            {...motionProps(0.35)}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 border-t border-offgrid-cream/10 pt-12 sm:mt-20 sm:grid-cols-4 sm:gap-4 sm:pt-14"
          >
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-2 text-center sm:gap-3">
                {badge.icon}
                <span className="font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-offgrid-cream/65 sm:text-xs">
                  {badge.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            {...motionProps(0.45)}
            className="mt-14 flex flex-col items-center gap-4 sm:mt-16"
          >
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-offgrid-cream/55">
              {team.socialHeading}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OffGrid Lifestyle on ${social.label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
