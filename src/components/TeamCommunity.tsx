import { motion } from "motion/react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { sectionPaddingCream, siteContainer } from "@/src/lib/brandLayout";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

function FaceChip({
  face,
}: {
  face: {
    image: string;
    alt: string;
    quote: string;
    name: string;
  };
}) {
  return (
    <span className="group relative mx-1.5 inline-block align-middle">
      <span className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:w-28 sm:h-14 sm:w-14">
        <img src={face.image} alt={face.alt} loading="lazy" className="h-full w-full object-cover" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 translate-y-1 rounded-2xl border border-offgrid-green/10 bg-white p-4 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="block text-sm font-medium leading-relaxed text-offgrid-green/85">&ldquo;{face.quote}&rdquo;</span>
        <span className="mt-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-offgrid-green/55">
          {face.name}
        </span>
      </span>
    </span>
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
    <section className={cn(sectionPaddingCream, "overflow-hidden bg-offgrid-cream")}>
      <div className={siteContainer}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-8 flex justify-center">
            <span
              className="rounded-full bg-offgrid-green/[0.06] px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/70"
              style={bodyStyle}
            >
              {team.badge}
            </span>
          </div>

          <h2
            className="mx-auto max-w-4xl text-center font-display text-3xl font-black leading-[1.05] tracking-tight text-offgrid-green sm:text-4xl lg:text-5xl"
            style={headingStyle}
          >
            {team.headlinePart1}{" "}
            <FaceChip face={team.faces[0]} />{" "}
            {team.headlinePart2}{" "}
            <FaceChip face={team.faces[1]} />{" "}
            {team.headlinePart3}
          </h2>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-green/10 bg-offgrid-green/10 sm:grid-cols-4">
            {team.teams.map((entry) => (
              <div key={entry.name} className="group relative h-24 overflow-hidden bg-white">
                <div className="absolute inset-0 flex items-center justify-center px-4 transition-all duration-300 ease-out group-hover:-translate-y-10 group-hover:opacity-0">
                  <span className="text-center font-display text-base font-black uppercase tracking-tight text-offgrid-green/35">
                    {entry.name}
                  </span>
                </div>
                <div className="absolute inset-0 flex translate-y-10 flex-col items-center justify-center px-4 text-center opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-offgrid-lime">
                    {entry.sport}
                  </span>
                  <span className="mt-1 font-display text-sm font-bold text-offgrid-green">{entry.name}</span>
                </div>
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
