import { motion } from "motion/react";

export function BrandStory() {
  return (
    <section id="about" className="py-24 md:py-32 bg-offgrid-dark text-offgrid-cream relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-offgrid-green/20 skew-x-12 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-offgrid-lime/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
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
                src="/images/brand_story.png"
                alt="OffGrid Lifestyle - Athletes at sunset"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-10 bg-offgrid-lime text-offgrid-dark p-5 rounded-xl shadow-xl max-w-[180px] hidden sm:block">
              <p className="font-display font-black text-3xl mb-1">2026</p>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase">Est. Philippines</p>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight mb-8">
              We don't just <br />
              <span className="text-offgrid-lime italic font-normal">play the game.</span><br />
              We live it.
            </h2>
            
            <div className="space-y-5 text-base md:text-lg text-offgrid-cream/75 leading-relaxed">
              <p>
                OffGrid is for those who move differently — on and off the court.
              </p>
              <p>
                Born in the Philippines, shaped by the players who refuse to fit the mold. 
                Whether you're dinking on the pickleball court, dropping putts at sunrise, 
                or just living your most expressive life — this is your uniform.
              </p>
              <p className="font-medium text-offgrid-cream">
                Hindi kami brand lang. <span className="text-offgrid-lime">Kultura kami.</span>
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-offgrid-cream/10">
              <p className="font-display text-xl italic text-offgrid-cream/40">
                Play Different. Live Off Grid.
              </p>
            </div>

            {/* Badges */}
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">🎾</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">Sport-First</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">🇵🇭</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">Proudly Pinoy</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-offgrid-cream/5 flex items-center justify-center">
                  <span className="text-xl">♻️</span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-cream/50">Sustainable</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
