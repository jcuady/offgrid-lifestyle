/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeaturedCollections } from "./components/FeaturedCollections";
import { BestSellers } from "./components/BestSellers";
import { BrandStory } from "./components/BrandStory";
import { EventSection } from "./components/EventSection";
import { SocialProof } from "./components/SocialProof";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-offgrid-cream font-sans text-offgrid-green overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <EventSection />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
