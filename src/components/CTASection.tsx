import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { sectionPaddingDark, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/offgridlifestyle.ph/", icon: <Instagram className="h-4 w-4" /> },
  { label: "Facebook", href: "https://www.facebook.com/offgridlifestyleph/", icon: <Facebook className="h-4 w-4" /> },
];

export function CTASection() {
  const navigate = useNavigate();
  const cta = useSiteContentStore((state) => state.landingContent.cta);
  const tagline = useSiteContentStore((state) => state.landingContent.footer.taglineLine1);
  const typography = useSiteContentStore((state) => state.landingContent.typography.cta);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  return (
    <section className={cn(sectionPaddingDark, "relative overflow-hidden bg-offgrid-dark text-offgrid-cream")}>
      {/* Electric-blue brand glow */}
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-offgrid-lime/15 blur-[140px]" />

      <div className={cn(siteContainer, "relative z-10")}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl text-center"
        >
          <span className="mx-auto mb-8 block h-px w-16 bg-offgrid-lime" />

          <h2 className="mb-7 font-display text-4xl font-black leading-[0.88] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem]" style={headingStyle}>
            {cta.titleLine1} <br />
            {cta.titleLine2}
          </h2>

          <p className="mx-auto mb-11 max-w-md font-display text-lg italic text-offgrid-cream/70 md:text-xl" style={bodyStyle}>
            {tagline}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
              className="h-14 w-full border-offgrid-cream/60 bg-offgrid-cream/10 px-10 text-base text-offgrid-cream backdrop-blur-sm hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
              onClick={() => navigate("/about")}
            >
              {cta.ctaStory}
            </Button>
          </div>

          {/* Follow the movement */}
          <div className="mt-16 flex flex-col items-center gap-5 border-t border-offgrid-cream/12 pt-12">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-offgrid-cream/55">
              Follow the movement
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OffGrid Lifestyle on ${social.label}`}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-offgrid-cream/40">
              @offgridlifestyle.ph
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
