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
import { ProductModal } from "./components/ProductModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";

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
      
      {/* E-Commerce Modals */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
