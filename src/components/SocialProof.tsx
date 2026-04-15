import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Finally a brand that actually gets the pickleball vibe. The polo is lightweight, breathable, and people keep asking where I got it.",
    author: "Marcus Tolentino",
    handle: "@marcust.pkl",
    location: "Quezon City",
    tag: "Pickleball"
  },
  {
    id: 2,
    text: "Wore the Fairway Tee for 18 holes and it held up perfectly. The fit is clean, not too boxy. Feels premium for the price.",
    author: "Camille Reyes",
    handle: "@cam.onthefairway",
    location: "BGC, Taguig",
    tag: "Golf"
  },
  {
    id: 3,
    text: "OG Pilipinas collection hits different. It's sporty but you can wear it sa labas. Proud to rep.",
    author: "Enzo Dela Cruz",
    handle: "@enzo.dc",
    location: "Makati",
    tag: "Everyday"
  }
];

const ugcImages = [
  { src: "/images/ugc_1.png", label: "🎾 @carlos.plays", position: "left" },
  { src: "/images/ugc_2.png", label: null, position: null },
  { src: "/images/ugc_3.png", label: "⛳️ Team Fit", position: "right" },
  { src: "/images/ugc_4.png", label: "👟 Everyday", position: "left" },
  { src: "/images/ugc_5.png", label: "🇵🇭 OG Pilipinas", position: "left" },
];

export function SocialProof() {
  return (
    <section className="py-20 md:py-24 bg-offgrid-cream overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3 block">
            The Community
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-black text-offgrid-green leading-[0.95] tracking-tight">
            Off Grid. <br />
            <span className="italic font-normal">On Point.</span>
          </h2>
        </div>

        {/* UGC Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group"
          >
            <img src={ugcImages[0].src} alt="Community pickleball player" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-offgrid-lime flex items-center justify-center text-[10px]">🎾</span>
              @carlos.plays
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden relative group aspect-square"
          >
            <img src={ugcImages[1].src} alt="Community golfer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl overflow-hidden relative group aspect-square"
          >
            <img src={ugcImages[2].src} alt="Community team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green">
              ⛳️ Team Fit
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden relative group aspect-square"
          >
            <img src={ugcImages[3].src} alt="Community streetwear" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green">
              👟 Everyday
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl overflow-hidden relative group aspect-square"
          >
            <img src={ugcImages[4].src} alt="Community OG Pilipinas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-offgrid-green">
              🇵🇭 OG Pilipinas
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-7 rounded-2xl shadow-sm border border-offgrid-green/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-offgrid-green text-offgrid-green" />
                  ))}
                </div>
                <p className="text-offgrid-green/85 text-sm font-medium italic mb-7 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-offgrid-green/8 pt-5">
                <div>
                  <p className="font-bold text-offgrid-green text-sm">{testimonial.author}</p>
                  <p className="text-xs text-offgrid-green/50">{testimonial.handle} · {testimonial.location}</p>
                </div>
                <span className="px-3 py-1 bg-offgrid-cream rounded-full text-[10px] font-bold tracking-[0.15em] uppercase text-offgrid-green">
                  {testimonial.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
