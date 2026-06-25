import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

export function Hero() {
  const products = useSiteContentStore((state) => state.products);
  const hero = useSiteContentStore((state) => state.landingContent.hero);
  const itemsSold = products.reduce((sum, item) => sum + item.sold, 0);
  const collections = new Set(products.map((entry) => entry.category)).size;

  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  
  // Scroll parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Mouse parallax for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgXOffset = useTransform(smoothX, [-0.5, 0.5], ["-2%", "2%"]);
  const bgYOffset = useTransform(smoothY, [-0.5, 0.5], ["-2%", "2%"]);
  
  const textXOffset = useTransform(smoothX, [-0.5, 0.5], ["1%", "-1%"]);
  const textYOffset = useTransform(smoothY, [-0.5, 0.5], ["1%", "-1%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleShopCollection = () => {
    navigate("/shop");
  };

  const handleExploreSports = () => {
    const collectionsSection = document.getElementById("collections");
    if (collectionsSection) {
      collectionsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-[100svh] min-h-[520px] max-h-[1200px] items-end overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Brand-safe background (no third-party photo dependency). */}
      <motion.div 
        style={{ y: scrollY }}
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
      >
        <motion.div
          style={{ x: bgXOffset, y: bgYOffset }}
          className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%]"
        >
          <div className="absolute inset-0 bg-offgrid-dark" />
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute -left-10 top-[-10%] h-[55%] w-[60%] rounded-full bg-offgrid-green/60 blur-[120px]" />
            <div className="absolute right-[-10%] top-[20%] h-[55%] w-[55%] rounded-full bg-offgrid-lime/15 blur-[120px]" />
            <div className="absolute left-[25%] bottom-[-15%] h-[60%] w-[65%] rounded-full bg-offgrid-green/45 blur-[140px]" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-offgrid-dark/40 via-offgrid-dark/25 to-offgrid-dark/85" />
        </motion.div>
      </motion.div>

      <div className={cn(siteContainer, "relative z-10 pb-32 sm:pb-36 md:pb-28 pointer-events-none")}>
        <motion.div 
          style={{ x: textXOffset, y: textYOffset }}
          className="max-w-5xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-offgrid-cream/15 backdrop-blur-md border border-offgrid-cream/20 text-offgrid-cream font-mono text-[10px] font-semibold tracking-[0.2em] uppercase mb-8 shadow-lg">
              {hero.badge}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[2.5rem] min-[400px]:text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] xl:text-[9rem] font-display font-black text-offgrid-cream leading-[0.88] tracking-tight mb-6 sm:mb-8 drop-shadow-2xl"
          >
            {hero.titleLine1}
            <br />
            {hero.titleLine2}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-offgrid-cream/85 font-light italic mb-3 max-w-md drop-shadow-lg font-display"
          >
            {hero.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-[10px] md:text-xs text-offgrid-cream/70 font-mono font-semibold tracking-[0.2em] uppercase mb-10 max-w-md drop-shadow-lg"
          >
            {hero.locality}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="secondary" size="lg" className="group" onClick={handleShopCollection}>
              {hero.ctaShopLabel}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-offgrid-cream/60 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10" onClick={handleExploreSports}>
              {hero.ctaExploreLabel}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator — minimal animated line, brand-clean */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-32 right-6 z-10 hidden md:block sm:right-12 pointer-events-none"
      >
        <div className="h-16 w-px overflow-hidden bg-offgrid-cream/20">
          <motion.div 
            animate={{ y: [-32, 64] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="h-1/2 w-full bg-offgrid-cream"
          />
        </div>
      </motion.div>

      {/* Stats — compact on mobile, full bar on md+ */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-offgrid-cream/15 bg-offgrid-dark/40 backdrop-blur-lg py-4 md:py-5">
        <div className={cn(siteContainer, "flex items-center justify-between gap-4 sm:gap-6 md:justify-start md:gap-14")}>
          <div className="min-w-0">
            <p className="text-lg font-display font-bold text-offgrid-cream tracking-tight sm:text-2xl">
              {itemsSold.toLocaleString("en-PH")}+
            </p>
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">{hero.statItemsSoldLabel}</p>
          </div>
          <div className="hidden h-10 w-px bg-offgrid-cream/15 sm:block" />
          <div className="min-w-0 shrink-0 text-right sm:text-left">
            <p className="text-lg font-display font-bold text-offgrid-cream tracking-tight sm:text-2xl">{collections} Sports</p>
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">{hero.statCollectionsLabel}</p>
          </div>
          <div className="hidden h-10 w-px bg-offgrid-cream/15 md:block" />
          <div className="hidden min-w-0 md:block">
            <p className="font-mono text-sm font-semibold tracking-[0.2em] text-offgrid-cream uppercase">{hero.statLocalityLine}</p>
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">{hero.statLocalitySub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
