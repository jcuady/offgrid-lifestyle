import { motion } from "motion/react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { sectionEyebrow, sectionTitle, siteContainer } from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

/** Compact community band — keeps page rhythm tight before FAQ. */
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
    <section className="border-y border-offgrid-green/10 bg-offgrid-cream py-12 sm:py-14">
      <div className={siteContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-5">
            <span className={sectionEyebrow} style={bodyStyle}>
              {team.badge}
            </span>
            <h2 className={cn(sectionTitle, "mt-2 text-balance")} style={headingStyle}>
              {team.headlineLine1}{" "}
              <span className="font-normal italic">{team.headlineLine2Italic}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:col-span-4">
            {team.teams.map((entry) => (
              <div
                key={entry.name}
                className="flex flex-col items-center justify-center rounded-xl border border-offgrid-green/10 bg-white px-2 py-4 text-center transition-colors hover:border-offgrid-lime/35 sm:px-3 sm:py-5"
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-offgrid-lime sm:text-[10px]">
                  {entry.sport}
                </span>
                <span className="mt-1.5 font-display text-xs font-black uppercase leading-tight tracking-tight text-offgrid-green sm:text-sm">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:col-span-3 lg:flex-col lg:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:w-full">
              <Button
                type="button"
                size="sm"
                className="group w-full sm:w-auto"
                onClick={() => navigate("/shop")}
              >
                {team.primaryCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => navigate("/custom")}
              >
                {team.secondaryCtaLabel}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OffGrid Lifestyle on ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-offgrid-green/20 text-offgrid-green transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-white"
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
