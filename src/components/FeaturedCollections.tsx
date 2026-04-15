import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: "pickleball",
    title: "Pickleball",
    subtitle: "Dink. Rally. Repeat.",
    image: "/images/collection_pickleball.png",
    colSpan: "md:col-span-2",
    tag: "New Drop",
  },
  {
    id: "golf",
    title: "Golf",
    subtitle: "Fairways & Fresh Fits.",
    image: "/images/collection_golf.png",
    colSpan: "md:col-span-2",
    tag: "Best Seller",
  },
  {
    id: "og-pilipinas",
    title: "OG Pilipinas",
    subtitle: "Rep the Nation.",
    image: "/images/collection_pilipinas.png",
    colSpan: "md:col-span-1",
    tag: "PH Limited",
  },
  {
    id: "everyday",
    title: "Everyday Wear",
    subtitle: "Move. Rest. Repeat.",
    image: "/images/collection_everyday.png",
    colSpan: "md:col-span-3",
    tag: "Staples",
  },
];

export function FeaturedCollections() {
  return (
    <section id="collections" className="py-20 md:py-24 bg-offgrid-cream">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3 block">
              Featured Collections
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-offgrid-green leading-[0.95] tracking-tight">
              Pick Your <br />
              <span className="italic font-normal">Sport.</span>
            </h2>
          </div>
          <p className="max-w-xs text-offgrid-green/70 text-sm leading-relaxed">
            Four collections. One lifestyle. Built for those who play different.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {collections.map((collection, index) => (
            <motion.a
              href={`#${collection.id}`}
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden block ${collection.colSpan} aspect-[4/3] md:aspect-auto md:min-h-[380px]`}
            >
              <div className="absolute inset-0 bg-offgrid-green/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark/80 via-offgrid-dark/10 to-transparent z-10" />
              
              <img
                src={collection.image}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="inline-block px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                    {collection.tag}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-offgrid-cream/15 backdrop-blur-md flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-offgrid-cream" />
                  </div>
                </div>
                
                <div>
                  <p className="text-offgrid-cream/70 text-xs font-medium tracking-[0.2em] uppercase mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {collection.subtitle}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-offgrid-cream">
                    {collection.title}
                  </h3>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
