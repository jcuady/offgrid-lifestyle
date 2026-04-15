import { motion } from "motion/react";
import { Plus, Star } from "lucide-react";
import { useStore } from "@/src/store/store";
import { products, formatPrice } from "@/src/data/products";

export function BestSellers() {
  const { setSelectedProduct, addToCart, toggleCart } = useStore();

  const handleProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleQuickAdd = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size: "M",
        color: product.colors[0].name,
        quantity: 1,
      });
      toggleCart(true);
    }
  };

  return (
    <section id="shop" className="py-20 md:py-24 bg-offgrid-cream">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3 block">
              Best Sellers
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-black text-offgrid-green leading-[0.95] tracking-tight">
              The Crowd <br />
              <span className="italic font-normal">Favorites.</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-offgrid-green/70 text-sm mb-2">All pieces {formatPrice(1100)}</p>
            <a href="#" className="inline-flex items-center text-sm font-bold uppercase tracking-[0.15em] text-offgrid-green hover:text-offgrid-lime transition-colors group">
              View All Products
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div 
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white mb-4 cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                {product.tag && (
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-offgrid-cream/90 backdrop-blur-sm text-offgrid-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-full">
                    {product.tag}
                  </span>
                )}
                
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Quick Add Button */}
                <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(product.id);
                    }}
                    className="w-full bg-offgrid-green text-offgrid-cream py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-offgrid-dark transition-colors shadow-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="px-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-offgrid-green/50">
                    {product.category}
                  </p>
                  <p className="font-bold text-offgrid-green text-sm">{formatPrice(product.price)}</p>
                </div>
                <h3 className="text-base font-display font-bold text-offgrid-green mb-3">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {product.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className={`w-3.5 h-3.5 rounded-full border border-offgrid-green/20 ${color.value}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-offgrid-green/60 font-medium">
                    <Star className="w-3 h-3 fill-offgrid-green text-offgrid-green" />
                    <span className="font-bold text-offgrid-green">{product.sold}</span> sold
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
