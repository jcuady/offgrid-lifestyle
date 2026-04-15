import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-28 md:py-36 bg-offgrid-dark text-offgrid-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-offgrid-green/30 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-display font-black leading-[0.85] tracking-tight mb-8">
            READY TO GO <br />
            OFF GRID?
          </h2>
          
          <p className="text-base md:text-lg text-offgrid-cream/70 mb-12 max-w-lg mx-auto leading-relaxed">
            All pieces ₱1,100. Free shipping on orders over ₱2,000. Ships across the Philippines.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto group text-base h-14 px-10">
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-offgrid-cream/60 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green text-base h-14 px-10 bg-offgrid-cream/10 backdrop-blur-sm">
              Our Story
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm font-medium text-offgrid-cream/50">
            <div className="flex items-center gap-2">
              <span>🚚</span> Free shipping ₱2,000+
            </div>
            <div className="flex items-center gap-2">
              <span>🔄</span> 14-day returns
            </div>
            <div className="flex items-center gap-2">
              <span>📦</span> Ships nationwide
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Secure checkout
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
