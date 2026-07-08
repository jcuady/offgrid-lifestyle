import { motion } from "motion/react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

const BRAND_STRIPE = "OFF GRID ®";

function BrandStripe() {
  const repeat = Array.from({ length: 12 }, (_, i) => (
    <span key={i} className="mx-6">
      {BRAND_STRIPE}
    </span>
  ));
  return (
    <div className="overflow-hidden border-b border-offgrid-cream/10 py-2.5" aria-hidden>
      <div className="flex whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-offgrid-cream/45">
        {repeat}
        {repeat}
      </div>
    </div>
  );
}

export function TeamCommunity() {
  const navigate = useNavigate();
  const team = useSiteContentStore((s) => s.landingContent.teamCommunity);
  const typography = useSiteContentStore((s) => s.landingContent.typography.teamCommunity);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const socialLinks = [
    { label: "Instagram", href: team.instagramUrl, icon: <Instagram className="h-4 w-4" /> },
    { label: "Facebook", href: team.facebookUrl, icon: <Facebook className="h-4 w-4" /> },
  ];

  return (
    <section id="community" className="bg-offgrid-green text-offgrid-cream">
      <BrandStripe />

      <div className={cn(siteContainer, "py-14 sm:py-16 md:py-20")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/60" style={bodyStyle}>
              {team.badge}
            </span>
            <h2 className={cn(sectionTitleOnDark, "mt-3 text-balance")} style={headingStyle}>
              {team.headlineLine1}{" "}
              <span className="font-normal italic text-white">{team.headlineLine2Italic}</span>
            </h2>
            <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/55">
              EST. MANILA, PH — GRITTY · IN MOTION · PRODUCT-FOCUSED
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:col-span-5">
            {team.teams.map((entry) => (
              <div
                key={entry.name}
                className="group flex min-h-[88px] flex-col justify-between rounded-xl border border-offgrid-cream/15 bg-offgrid-cream/[0.04] p-4 transition-colors hover:border-offgrid-lime/50 hover:bg-offgrid-cream/[0.08] sm:min-h-[96px] sm:p-5"
              >
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-offgrid-lime sm:text-xs">
                  {entry.sport}
                </span>
                <span className="mt-3 font-display text-base font-black uppercase leading-tight tracking-tight text-offgrid-cream sm:text-lg">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5 lg:col-span-3 lg:items-end lg:text-right">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-offgrid-cream/60">
              {team.socialHeading}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
              <Button
                type="button"
                size="sm"
                className="group w-full border-offgrid-cream bg-offgrid-cream text-offgrid-green hover:bg-white sm:w-auto lg:w-full"
                onClick={() => navigate("/events")}
              >
                {team.primaryCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto lg:w-full"
                onClick={() => navigate("/custom")}
              >
                {team.secondaryCtaLabel}
              </Button>
            </div>

            <div className="flex items-center gap-3 lg:justify-end">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OffGrid Lifestyle on ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <BrandStripe />
    </section>
  );
}
