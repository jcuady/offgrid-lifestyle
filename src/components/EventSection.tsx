import { useNavigate } from "react-router-dom";
import { CommunityEventsHero } from "@/src/components/CommunityEventsHero";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";

/** Evergreen community & events band — not tied to a single dated event. */
export function EventSection() {
  const navigate = useNavigate();
  const event = useSiteContentStore((s) => s.landingContent.event);
  const typography = useSiteContentStore((s) => s.landingContent.typography.event);

  return (
    <CommunityEventsHero
      id="events"
      badge={event.badge}
      titleLine1={event.titleLine1}
      titleLine2Italic={event.titleLine2Italic}
      description={event.description}
      image={event.backgroundImage}
      imageAlt="Off Grid community in motion"
      headingStyle={cmsTypographyStyle(typography, "heading")}
      bodyStyle={cmsTypographyStyle(typography, "body")}
      primaryCta={{ label: event.ctaPrimary, onClick: () => navigate("/events") }}
      secondaryCta={{ label: event.ctaSecondary, onClick: () => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" }) }}
      variant="section"
      className="scroll-mt-24"
    />
  );
}
