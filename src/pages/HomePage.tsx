import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { BestSellers } from "@/src/components/BestSellers";
import { BrandStory } from "@/src/components/BrandStory";
import { EventSection } from "@/src/components/EventSection";
import { SocialProof } from "@/src/components/SocialProof";
import { CTASection } from "@/src/components/CTASection";
import { Footer } from "@/src/components/Footer";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

// Heavy WebGL hero (three + gsap) is code-split so it never blocks first paint.
const HorizonHero = lazy(() =>
  import("@/src/components/ui/horizon-hero-section").then((m) => ({ default: m.Component })),
);

function HeroFallback({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-offgrid-dark px-6 text-center">
      <div>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.85] tracking-tight text-offgrid-cream sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p className="mt-4 font-display text-lg italic text-offgrid-cream/75">{tagline}</p>
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
          sideLabel={hero.locality}
          scenes={[
            { title: hero.titleLine1, lines: [hero.tagline, hero.badge] },
            { title: "IN MOTION", lines: ["Gritty. Product-focused.", "Engineered for the way you move."] },
            { title: "EST. MANILA", lines: ["Progress over perfection.", "Premium Filipino sportswear."] },
          ]}
          primaryCta={{ label: hero.ctaShopLabel, onClick: () => navigate("/shop") }}
          secondaryCta={{ label: hero.ctaExploreLabel, onClick: scrollToCollections }}
        />
      </Suspense>
      <main>
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <EventSection />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
