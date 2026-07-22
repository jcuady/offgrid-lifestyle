import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { FocusRail, type FocusRailItem } from "@/src/components/ui/focus-rail";
import { sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import { COMMUNITY_FOCUS_RAIL } from "@/src/lib/communityPhotos";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

const BRAND_STRIPE = "OFFGRID ®";

const FOCUS_ITEMS: FocusRailItem[] = COMMUNITY_FOCUS_RAIL.map((item) => ({ ...item }));

type TeamEntry = {
  id: string;
  name: string;
  sport: string;
};

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

function TeamRosterCarousel({ teams }: { teams: TeamEntry[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanPrev(rail.scrollLeft > 2);
    setCanNext(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateControls();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateControls);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [teams.length, updateControls]);

  if (teams.length === 0) return null;

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-offgrid-cream/55">
          Events and Sports · {teams.length}
        </p>
        {teams.length > 1 ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canPrev}
              aria-label="Previous teams"
              className="grid h-9 w-9 place-items-center rounded-full border border-offgrid-cream/20 text-offgrid-cream transition hover:border-offgrid-lime hover:bg-offgrid-lime disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canNext}
              aria-label="Next teams"
              className="grid h-9 w-9 place-items-center rounded-full border border-offgrid-cream/20 text-offgrid-cream transition hover:border-offgrid-lime hover:bg-offgrid-lime disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={railRef}
        onScroll={updateControls}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="OFFGRID partner teams"
        tabIndex={0}
      >
        {teams.map((entry) => (
          <article
            key={entry.id}
            className="group flex min-h-[96px] min-w-[78%] snap-start flex-col justify-between rounded-2xl border border-offgrid-cream/15 bg-offgrid-cream/[0.04] p-4 transition-colors hover:border-offgrid-lime/50 hover:bg-offgrid-cream/[0.08] sm:min-w-[45%] lg:min-w-[31%]"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:text-[11px]">
              {entry.sport}
            </span>
            <span className="mt-2 font-display text-base font-black uppercase leading-tight tracking-tight text-offgrid-cream sm:text-lg">
              {entry.name}
            </span>
          </article>
        ))}
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
        >
          <div className="flex flex-col gap-8 border-b border-offgrid-cream/10 pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <span
                className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/60"
                style={bodyStyle}
              >
                {team.badge}
              </span>
              <h2 className={cn(sectionTitleOnDark, "mt-3 text-balance")} style={headingStyle}>
                {team.headlineLine1}{" "}
                <span className="font-normal italic text-white">{team.headlineLine2Italic}</span>
              </h2>
              <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/55">
                {team.metaLine}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-5 lg:items-end">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-offgrid-cream/60">
                {team.socialHeading}
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
                <Button
                  type="button"
                  className="group w-full border-offgrid-lime bg-offgrid-lime text-white hover:bg-offgrid-gold sm:w-auto"
                  onClick={() => followCmsCta(navigate, team.primaryCtaHref)}
                >
                  {team.primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green sm:w-auto"
                  onClick={() => followCmsCta(navigate, team.secondaryCtaHref)}
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
                    aria-label={`OFFGRID Lifestyle on ${social.label}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-offgrid-cream/25 text-offgrid-cream transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <TeamRosterCarousel teams={team.teams} />
        </motion.div>
      </div>

      <FocusRail
        items={FOCUS_ITEMS}
        loop
        autoPlay={false}
        exploreLabel="View story"
        className="border-y border-offgrid-cream/10"
      />

      <BrandStripe />
    </section>
  );
}
