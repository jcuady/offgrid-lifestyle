import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Instagram, Facebook, Truck, RefreshCcw, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
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
    { label: cta.trustShipping, icon: <Truck className="h-6 w-6" /> },
    { label: cta.trustReturns, icon: <RefreshCcw className="h-6 w-6" /> },
    { label: cta.trustShips, icon: <MapPin className="h-6 w-6" /> },
    { label: cta.trustCheckout, icon: <ShieldCheck className="h-6 w-6" /> },
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
    <section className="relative isolate overflow-hidden bg-offgrid-dark text-offgrid-cream">
      {/* Brand atmosphere — grid, electric-blue glow, wordmark watermark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute left-1/2 top-[22%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-offgrid-lime/30 blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-offgrid-dark to-transparent" />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-1.5%] -z-10 select-none text-center font-display text-[22vw] font-black leading-none tracking-tighter text-offgrid-cream/[0.04]"
      >
        OFF GRID®
      </span>

      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-screen sm:py-28">
        <motion.span
          {...(reduceMotion
            ? {}
            : {
                initial: { scaleX: 0, opacity: 0 },
                whileInView: { scaleX: 1, opacity: 1 },
                viewport: { once: true },
                transition: { duration: 0.6 },
              })}
          className="mb-8 block h-1 w-16 rounded-full bg-offgrid-lime"
        />

        <motion.h2
          {...motionProps(0.05)}
          className="font-display text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
          style={headingStyle}
        >
          {cta.titleLine1}
          <br />
          <span className="text-offgrid-cream">{cta.titleLine2}</span>
        </motion.h2>

        <motion.p
          {...motionProps(0.12)}
          className="mt-7 font-mono text-sm font-bold uppercase tracking-[0.22em] text-offgrid-cream/70"
          style={bodyStyle}
        >
          {tagline}
        </motion.p>

        <motion.div
          {...motionProps(0.2)}
          className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
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
            className="h-14 w-full border-offgrid-cream/40 bg-transparent px-10 text-base text-offgrid-cream backdrop-blur-sm hover:border-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
            onClick={() => navigate("/about")}
          >
            {cta.ctaStory}
          </Button>
        </motion.div>

        <motion.div
          {...motionProps(0.32)}
          className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-8 border-t border-offgrid-cream/10 pt-12 sm:mt-20 sm:grid-cols-4 sm:gap-4"
        >
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex flex-col items-center gap-2.5 text-center">
              <span className="text-offgrid-lime">{badge.icon}</span>
              <span className="font-mono text-[11px] font-bold uppercase leading-snug tracking-[0.14em] text-offgrid-cream/70 sm:text-xs">
                {badge.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div {...motionProps(0.42)} className="mt-14 flex flex-col items-center gap-4 sm:mt-16">
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
    </section>
  );
}
