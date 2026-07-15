import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WhoWeAre } from "@/src/components/WhoWeAre";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { FeaturedSpotlight } from "@/src/components/FeaturedSpotlight";
import { ShopByCollection } from "@/src/components/ShopByCollection";
import { TeamCommunity } from "@/src/components/TeamCommunity";
import { LandingFaq } from "@/src/components/LandingFaq";
import { CTASection } from "@/src/components/CTASection";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { OffgridHero } from "@/src/components/ui/offgrid-hero";
import { cmsTypographyStyle } from "@/src/lib/cmsTypography";
import { followCmsCta } from "@/src/lib/cmsNavigation";
import { faqPageJsonLd, upsertJsonLd, websiteJsonLd } from "@/src/lib/siteSeo";
import { hydrateProductsFromSupabase, hydrateSiteContentFromSupabase } from "@/src/services";

/**
 * Owner IA: who we are + promo · shop by sport · shop by collection · community · FAQ.
 * Less fluff — no gallery / social-proof / best-seller essay strips.
 */
export function HomePage() {
  const navigate = useNavigate();
  const hero = useSiteContentStore((state) => state.landingContent.hero);
  const faqItems = useSiteContentStore((state) => state.landingContent.faq.items);
  const heroTypography = useSiteContentStore((state) => state.landingContent.typography.hero);

  useEffect(() => {
    upsertJsonLd("jsonld-website", websiteJsonLd());
    upsertJsonLd("jsonld-faq", faqPageJsonLd([...faqItems]));
    return () => {
      upsertJsonLd("jsonld-website", null);
      upsertJsonLd("jsonld-faq", null);
    };
  }, [faqItems]);

  useEffect(() => {
    void hydrateSiteContentFromSupabase();
    void hydrateProductsFromSupabase();
  }, []);

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
        videoSrc={hero.videoSrc}
        imageSrc={hero.imageSrc}
        primaryCta={{ label: hero.ctaShopLabel, onClick: () => followCmsCta(navigate, hero.ctaShopHref) }}
        secondaryCta={{
          label: hero.ctaExploreLabel,
          onClick: () => followCmsCta(navigate, hero.ctaExploreHref),
        }}
      />
      <main id="main">
        <WhoWeAre />
        <FeaturedSpotlight placement="home" />
        <FeaturedCollections />
        <ShopByCollection />
        <TeamCommunity />
        <LandingFaq />
        <CTASection />
      </main>
    </>
  );
}
