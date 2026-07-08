import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { FeaturedSpotlight } from "@/src/components/FeaturedSpotlight";
import { BestSellers } from "@/src/components/BestSellers";
import { BrandBenefits } from "@/src/components/BrandBenefits";
import { EventSection } from "@/src/components/EventSection";
import { SocialProof } from "@/src/components/SocialProof";
import { TeamCommunity } from "@/src/components/TeamCommunity";
import { LandingFaq } from "@/src/components/LandingFaq";
import { CTASection } from "@/src/components/CTASection";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { OffgridHero } from "@/src/components/ui/offgrid-hero";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { hydrateProductsFromSupabase, hydrateSiteContentFromSupabase } from "@/src/services";

export function HomePage() {
  const navigate = useNavigate();
  const hero = useSiteContentStore((state) => state.landingContent.hero);
  const heroTypography = useSiteContentStore((state) => state.landingContent.typography.hero);

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
    void hydrateProductsFromSupabase();
  }, []);

  const scrollToCollections = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  const titleMark = hero.titleLine1.match(/[®™]+$/)?.[0];
  const titleText = titleMark ? hero.titleLine1.slice(0, -titleMark.length).trim() : hero.titleLine1;

  return (
    <>
      <OffgridHero
        badge={hero.badge}
        title={titleText}
        titleLine2={hero.titleLine2}
        mark={titleMark}
        tagline={hero.tagline}
        locality={hero.locality}
        description={hero.description}
        titleStyle={cmsTypographyStyle(heroTypography, "heading")}
        descriptionStyle={cmsTypographyStyle(heroTypography, "body")}
        primaryCta={{ label: hero.ctaShopLabel, onClick: () => navigate("/shop") }}
        secondaryCta={{ label: hero.ctaExploreLabel, onClick: scrollToCollections }}
      />
      <main>
        <FeaturedCollections />
        <FeaturedSpotlight placement="home" />
        <BestSellers />
        <BrandBenefits />
        <EventSection />
        <TeamCommunity />
        <SocialProof />
        <LandingFaq />
        <CTASection />
      </main>
    </>
  );
}
