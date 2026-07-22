import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Instagram, Facebook, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  monoLabelOnDark,
  sectionPaddingDark,
  sectionTitleOnDark,
  siteContainer,
} from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import { cn } from "@/src/lib/utils";

/** UiUX Element 10 — minimal closing band: typography, contact, socials. */
export function CTASection() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const cta = useSiteContentStore((state) => state.landingContent.cta);
  const footer = useSiteContentStore((state) => state.landingContent.footer);
  const team = useSiteContentStore((state) => state.landingContent.teamCommunity);
  const typography = useSiteContentStore((state) => state.landingContent.typography.cta);
  const headingStyle = cmsTypographyStyle(typography, "heading");
  const bodyStyle = cmsTypographyStyle(typography, "body");

  const socials = [
    { label: "Instagram", href: team.instagramUrl, icon: Instagram },
    { label: "Facebook", href: team.facebookUrl, icon: Facebook },
  ] as const;

  const motionProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: { once: true, margin: "-60px" } as const,
          transition: { duration: 0.5, delay } as const,
        };

  return (
    <section
      id="connect"
      aria-labelledby="connect-heading"
      className="relative border-t border-offgrid-cream/10 bg-offgrid-dark text-offgrid-cream"
    >
      <div className={cn(siteContainer, sectionPaddingDark, "pb-14 sm:pb-16 md:pb-20")}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <motion.div {...motionProps(0)} className="lg:col-span-7">
            <span className={cn(monoLabelOnDark, "text-offgrid-cream/55")}>{cta.eyebrow}</span>

            <h2
              id="connect-heading"
              className={cn(sectionTitleOnDark, "mt-4")}
              style={headingStyle}
            >
              {cta.titleLine1}
              <br />
              <span className="text-white">{cta.titleLine2}</span>
            </h2>

            <p
              className="mt-5 max-w-lg text-base leading-relaxed text-offgrid-cream/75 md:text-lg"
              style={bodyStyle}
            >
              {cta.priceFallback}
            </p>

            <p className="mt-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-offgrid-cream/60">
              {footer.taglineLine1}
            </p>
          </motion.div>

          <motion.div
            {...motionProps(0.06)}
            className="flex flex-col gap-10 sm:flex-row sm:gap-12 lg:col-span-5 lg:flex-col lg:items-end lg:gap-10 lg:text-right"
          >
            <div className="min-w-0">
              <p className={cn(monoLabelOnDark, "mb-4 text-offgrid-cream/50")}>Contact</p>
              <a
                href={`mailto:${cta.contactEmail}`}
                className="group inline-flex items-center gap-2 font-display text-xl font-black tracking-tight text-offgrid-cream transition-colors hover:text-white sm:text-2xl"
              >
                <Mail className="h-5 w-5 shrink-0 text-offgrid-lime" strokeWidth={1.75} aria-hidden />
                {cta.contactEmail}
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <Link
                to={cta.contactHref}
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-offgrid-cream/60 transition-colors hover:text-offgrid-lime"
              >
                {cta.contactLinkLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div>
              <p className={cn(monoLabelOnDark, "mb-4 text-offgrid-cream/50")}>
                {team.socialHeading}
              </p>
              <ul className="flex flex-wrap gap-3 lg:justify-end">
                {socials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in new tab)`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-cream/20 text-offgrid-cream/80 transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime/10 hover:text-offgrid-lime"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...motionProps(0.1)}
          className="mt-14 flex flex-col gap-6 border-t border-offgrid-cream/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-offgrid-cream/45">
            {cta.localityLine}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={() => followCmsCta(navigate, cta.ctaShopHref)}
              className="inline-flex items-center justify-center rounded-full bg-offgrid-lime px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:bg-white hover:text-offgrid-green"
            >
              {cta.ctaShop}
            </button>
            <button
              type="button"
              onClick={() => followCmsCta(navigate, cta.ctaStoryHref)}
              className="inline-flex items-center justify-center rounded-full border border-offgrid-cream/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-offgrid-cream transition-colors hover:border-offgrid-cream hover:text-white"
            >
              {cta.ctaStory}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
