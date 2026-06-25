import { motion } from "motion/react";
import { sectionEyebrowOnDark, sectionPaddingDark, sectionTitleOnDark, siteContainer } from "@/src/lib/brandLayout";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { cn } from "@/src/lib/utils";

export function BrandStory() {
  const story = useSiteContentStore((s) => s.landingContent.brandStory);
  return (
    <section id="about" className={cn(sectionPaddingDark, "relative overflow-hidden bg-offgrid-dark text-offgrid-cream")}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-offgrid-green/20 skew-x-12 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-offgrid-lime/5 rounded-full blur-3xl" />

      <div className={cn(siteContainer, "relative z-10")}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden">
              <img
                src={story.image}
                alt="OffGrid Lifestyle brand story"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 right-2 max-w-[min(180px,45vw)] rounded-xl bg-offgrid-lime p-4 text-offgrid-dark shadow-xl sm:-bottom-6 sm:-right-6 sm:p-5 md:bottom-8 md:-right-10">
              <p className="font-display font-black text-3xl mb-1">{story.badgeEst}</p>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase">{story.badgeLocality}</p>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl min-w-0"
          >
            <span className={sectionEyebrowOnDark}>{story.eyebrow}</span>
            <h2 className={cn(sectionTitleOnDark, "mb-8 leading-tight")}>
              {story.titleLine1} <br />
              <span className="text-offgrid-lime italic font-normal">{story.titleLine2Italic}</span>
              {story.titleLine3 ? (
                <>
                  <br />
                  {story.titleLine3}
                </>
              ) : null}
            </h2>
            
            <div className="space-y-5 text-base md:text-lg text-offgrid-cream/75 leading-relaxed">
              <p>{story.paragraph1}</p>
              <p>{story.paragraph2}</p>
              <p className="font-medium text-offgrid-cream">
                {story.paragraph3Prefix}{" "}
                <span className="text-offgrid-lime">{story.paragraph3Highlight}</span>
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-offgrid-cream/10">
              <p className="font-display text-xl italic text-offgrid-cream/40">{story.closingQuote}</p>
            </div>

            {/* Badges */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">{story.badgeGritty}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">🏃</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">{story.badgeInMotion}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">🇵🇭</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">{story.badgeProudlyPinoy}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
