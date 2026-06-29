import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { FeaturedSpotlight } from "@/src/components/FeaturedSpotlight";
import { BestSellers } from "@/src/components/BestSellers";
import { BrandStory } from "@/src/components/BrandStory";
import { EventSection } from "@/src/components/EventSection";
import { SocialProof } from "@/src/components/SocialProof";
import { TeamCommunity } from "@/src/components/TeamCommunity";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { OffgridHero } from "@/src/components/ui/offgrid-hero";
import { hydrateProductsFromSupabase, hydrateSiteContentFromSupabase } from "@/src/services";

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
    void hydrateProductsFromSupabase();
  }, []);
  const hero = useSiteContentStore((state) => state.landingContent.hero);

  const scrollToCollections = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  // Split a trailing brand mark (®) off the title so it renders as a superscript.
  const titleMark = hero.titleLine1.match(/[®™]+$/)?.[0];
  const titleText = titleMark ? hero.titleLine1.slice(0, -titleMark.length).trim() : hero.titleLine1;

  return (
    <>
      <OffgridHero
        badge={hero.badge}
        title={titleText}
        mark={titleMark}
        description="Premium Filipino sportswear engineered for movement — on the court, on the course, and everywhere off the grid."
        primaryCta={{ label: hero.ctaShopLabel, onClick: () => navigate("/shop") }}
        secondaryCta={{ label: hero.ctaExploreLabel, onClick: scrollToCollections }}
      />
      <main>
        <FeaturedCollections />
        <FeaturedSpotlight placement="home" />
        <BestSellers />
        <BrandStory />
        <EventSection />
        <SocialProof />
        <TeamCommunity />
      </main>
    </>
  );
}
