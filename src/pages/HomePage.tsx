import { Hero } from "@/src/components/Hero";
import { FeaturedCollections } from "@/src/components/FeaturedCollections";
import { BestSellers } from "@/src/components/BestSellers";
import { BrandStory } from "@/src/components/BrandStory";
import { EventSection } from "@/src/components/EventSection";
import { SocialProof } from "@/src/components/SocialProof";
import { CTASection } from "@/src/components/CTASection";
import { Footer } from "@/src/components/Footer";

export function HomePage() {
  return (
    <>
      <Hero />
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
