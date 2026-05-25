import { useMemo } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/src/data/products";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { sectionPaddingDark, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export function CTASection() {
  const navigate = useNavigate();
  const products = useSiteContentStore((state) => state.products);
  const cta = useSiteContentStore((state) => state.landingContent.cta);
  const priceLine = useMemo(() => {
    if (products.length === 0) return cta.priceFallback;
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `Featured pieces ${formatPrice(min)}. Ships across the Philippines.`;
    return `From ${formatPrice(min)} to ${formatPrice(max)}. Ships across the Philippines.`;
  }, [products, cta.priceFallback]);

  const handleGoToAbout = () => {
    const about = document.getElementById("about");
    if (about) {
      about.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate("/");
  };

  return (
    <section className={cn(sectionPaddingDark, "relative overflow-hidden bg-offgrid-dark text-offgrid-cream")}>
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-offgrid-green/30 rounded-full blur-[120px] pointer-events-none" />
      
      <div className={cn(siteContainer, "relative z-10 text-center")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="mb-8 font-display text-4xl font-black leading-[0.88] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem]">
            {cta.titleLine1} <br />
            {cta.titleLine2}
          </h2>
          
          <p className="text-base md:text-lg text-offgrid-cream/70 mb-12 max-w-lg mx-auto leading-relaxed">
            {priceLine}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto group text-base h-14 px-10"
              onClick={() => navigate("/shop")}
            >
              {cta.ctaShop}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-offgrid-cream/60 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green text-base h-14 px-10 bg-offgrid-cream/10 backdrop-blur-sm"
              onClick={handleGoToAbout}
            >
              {cta.ctaStory}
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm font-medium text-offgrid-cream/50">
            <div className="flex items-center gap-2">
              <span>🚚</span> {cta.trustShipping}
            </div>
            <div className="flex items-center gap-2">
              <span>🔄</span> {cta.trustReturns}
            </div>
            <div className="flex items-center gap-2">
              <span>📦</span> {cta.trustShips}
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> {cta.trustCheckout}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
