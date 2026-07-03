import { motion } from "motion/react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import {
  sectionEyebrow,
  sectionHeaderCenter,
  sectionPaddingCream,
  sectionTitle,
  siteContainer,
} from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

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
    <section className={cn(sectionPaddingCream, "bg-offgrid-cream")}>
      <div className={siteContainer}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className={cn(sectionHeaderCenter, "mb-12 sm:mb-14")}>
            <span className={cn(sectionEyebrow, "mx-auto")} style={bodyStyle}>
              {team.badge}
            </span>
            <h2 className={cn(sectionTitle, "max-w-4xl text-balance")} style={headingStyle}>
              {team.headlineLine1} <br />
              <span className="font-normal italic">{team.headlineLine2Italic}</span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {team.teams.map((entry) => (
              <div
                key={entry.name}
                className="flex flex-col items-center justify-center rounded-2xl border border-offgrid-green/10 bg-white px-3 py-6 text-center transition-colors hover:border-offgrid-lime/35 sm:px-4"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-offgrid-lime">
                  {entry.sport}
                </span>
                <span className="mt-2 font-display text-sm font-black uppercase leading-tight tracking-tight text-offgrid-green sm:text-base">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="group h-14 w-full px-8 text-base sm:w-auto"
              onClick={() => navigate("/shop")}
            >
              {team.primaryCtaLabel}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 w-full px-8 text-base sm:w-auto"
              onClick={() => navigate("/custom")}
            >
              {team.secondaryCtaLabel}
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <p
              className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-offgrid-green/45"
              style={bodyStyle}
            >
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-green/20 text-offgrid-green transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
