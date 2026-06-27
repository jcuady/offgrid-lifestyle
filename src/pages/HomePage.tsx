import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { FeaturedSpotlight } from "@/src/components/FeaturedSpotlight";
import { BestSellers } from "@/src/components/BestSellers";
import { BrandStory } from "@/src/components/BrandStory";
import { EventSection } from "@/src/components/EventSection";
import { SocialProof } from "@/src/components/SocialProof";
import { CTASection } from "@/src/components/CTASection";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";

// Heavy WebGL hero (three + gsap) is code-split so it never blocks first paint.
const HorizonHero = lazy(() =>
  import("@/src/components/ui/horizon-hero-section").then((m) => ({ default: m.Component })),
);

function HeroFallback({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-offgrid-dark px-6 text-center">
      <div>
        <img
          src={LOGO_WORDMARK_WHITE}
          alt={title}
          className="mx-auto h-[clamp(2.75rem,9vw,8.5rem)] w-auto drop-shadow-[0_2px_40px_rgba(0,0,0,0.5)]"
        />
        <p className="mt-5 font-sans text-base font-light tracking-wide text-offgrid-cream/80">{tagline}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const hero = useSiteContentStore((state) => state.landingContent.hero);

  const scrollToCollections = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Suspense fallback={<HeroFallback title={hero.titleLine1} tagline={hero.tagline} />}>
        <HorizonHero
          logoSrc={LOGO_WORDMARK_WHITE}
          sideLabel={hero.locality}
          scenes={[
            { eyebrow: hero.badge, title: hero.titleLine1, tagline: hero.tagline },
            { eyebrow: "Built to move", title: "IN MOTION", tagline: "Engineered for the way you move." },
            { eyebrow: hero.locality, title: "EST. MANILA", tagline: "Progress over perfection." },
          ]}
          primaryCta={{ label: hero.ctaShopLabel, onClick: () => navigate("/shop") }}
          secondaryCta={{ label: hero.ctaExploreLabel, onClick: scrollToCollections }}
        />
      </Suspense>
      <main>
        <FeaturedCollections />
        <FeaturedSpotlight placement="home" />
        <BestSellers />
        <BrandStory />
        <EventSection />
        <SocialProof />
        <CTASection />
      </main>
    </>
  );
}
