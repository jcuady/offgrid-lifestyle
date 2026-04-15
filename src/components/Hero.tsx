import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight } from "lucide-react";

export function Hero() {
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
      className="relative h-screen min-h-[600px] flex items-end overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Background Image with 3D Parallax and Slow Zoom */}
      <motion.div 
        style={{ y: scrollY }}
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
      >
        <motion.div
          style={{ x: bgXOffset, y: bgYOffset }}
          className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%]"
        >
          <motion.img
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="https://images.unsplash.com/photo-1638943355304-3a6e3427dc79?q=80&w=2940&auto=format&fit=crop"
            alt="Golf course at golden hour - OffGrid Lifestyle"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-offgrid-dark/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-offgrid-dark/70 via-transparent to-offgrid-dark/60" />
        </motion.div>
      </motion.div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 pb-24 md:pb-28 pointer-events-none">
        <motion.div 
          style={{ x: textXOffset, y: textYOffset }}
          className="max-w-5xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-offgrid-cream/15 backdrop-blur-md border border-offgrid-cream/20 text-offgrid-cream text-[10px] font-semibold tracking-[0.2em] uppercase mb-8 shadow-lg">
              Premium Filipino Sportswear
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-[8rem] lg:text-[10rem] font-display font-black text-offgrid-cream leading-[0.85] tracking-tight mb-8 drop-shadow-2xl"
          >
            OFF GRID<br />LIFESTYLE
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-offgrid-cream/80 font-light italic mb-10 max-w-md drop-shadow-lg font-display"
          >
            Play Different. Live Off Grid.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="secondary" size="lg" className="group" onClick={handleShopCollection}>
              Shop Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-offgrid-cream/60 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green backdrop-blur-sm bg-offgrid-cream/10" onClick={handleExploreSports}>
              Explore Sports
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-2 z-10 pointer-events-none"
      >
        <span className="text-offgrid-cream/60 text-xs font-medium tracking-widest uppercase rotate-90 origin-right translate-x-3 mb-8 drop-shadow-md">Scroll</span>
        <div className="w-[1px] h-12 bg-offgrid-cream/30 overflow-hidden backdrop-blur-sm">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-offgrid-cream"
          />
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-offgrid-cream/15 bg-offgrid-dark/30 backdrop-blur-lg py-5 hidden md:block">
        <div className="container mx-auto px-12 flex items-center gap-14">
          <div>
            <p className="text-2xl font-display font-bold text-offgrid-cream tracking-tight">3,200+</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">Items Sold</p>
          </div>
          <div className="w-px h-10 bg-offgrid-cream/15" />
          <div>
            <p className="text-2xl font-display font-bold text-offgrid-cream tracking-tight">4 Sports</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">Collections</p>
          </div>
          <div className="w-px h-10 bg-offgrid-cream/15" />
          <div>
            <p className="text-2xl font-display font-bold text-offgrid-cream tracking-tight">PH</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-offgrid-cream/50 uppercase mt-0.5">Proudly Pinoy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
