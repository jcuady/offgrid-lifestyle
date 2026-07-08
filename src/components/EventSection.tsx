import { useNavigate } from "react-router-dom";
import { CommunityEventsSection } from "@/src/components/CommunityEventsSection";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";

export function EventSection() {
  const navigate = useNavigate();
  const event = useSiteContentStore((s) => s.landingContent.event);
  const typography = useSiteContentStore((s) => s.landingContent.typography.event);

  return (
    <CommunityEventsSection
      id="events"
      badge={event.badge}
      titleLine1={event.titleLine1}
      titleLine2Italic={event.titleLine2Italic}
      description={event.description}
      imageCaption={event.imageCaption}
      headingStyle={cmsTypographyStyle(typography, "heading")}
      bodyStyle={cmsTypographyStyle(typography, "body")}
      primaryCta={{ label: event.ctaPrimary, onClick: () => navigate("/events") }}
      secondaryCta={{ label: event.ctaSecondary, onClick: () => navigate("/#community") }}
      variant="section"
      className="scroll-mt-24"
    />
  );
}
