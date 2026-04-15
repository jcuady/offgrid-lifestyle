import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/src/store/store";
import { Button } from "./ui/Button";
import { formatPrice } from "@/src/data/products";
import { cn } from "@/src/lib/utils";

export function CartDrawer() {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, openCheckout, clearCart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 2000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleClose = () => toggleCart(false);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-offgrid-dark/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[90vw] max-w-md bg-offgrid-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-offgrid-green/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-offgrid-green">Your Cart</h2>
                <p className="text-xs sm:text-sm text-offgrid-green/50 mt-1">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-offgrid-green/5 flex items-center justify-center hover:bg-offgrid-green hover:text-offgrid-cream transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-offgrid-green/5 flex items-center justify-center mb-4 sm:mb-6">
                    <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-offgrid-green/30" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-offgrid-green mb-2">Your cart is empty</h3>
                  <p className="text-xs sm:text-sm text-offgrid-green/60 mb-6 sm:mb-8">Looks like you haven't added anything yet.</p>
                  <Button variant="default" size="lg" onClick={handleClose}>
                    Shop Now
                  </Button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Free Shipping Progress */}
                  {remainingForFreeShipping > 0 && (
                    <div className="bg-offgrid-green/5 rounded-xl p-3 sm:p-4">
                      <p className="text-[11px] sm:text-xs font-semibold text-offgrid-green mb-2">
                        Add {formatPrice(remainingForFreeShipping)} more for FREE shipping
                      </p>
                      <div className="w-full h-2 bg-offgrid-green/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                          className="h-full bg-offgrid-lime rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {remainingForFreeShipping === 0 && subtotal > 0 && (
                    <div className="bg-offgrid-lime/10 rounded-xl p-4 border border-offgrid-lime/20">
                      <p className="text-xs font-bold text-offgrid-green flex items-center gap-2">
                        <span className="text-lg">✓</span> You've unlocked FREE shipping!
                      </p>
                    </div>
                  )}

                  {/* Cart Items */}
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-offgrid-cream">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="font-display font-bold text-offgrid-green text-xs sm:text-sm mb-1 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-offgrid-green/50 truncate">
                            Size: {item.size} · Color: {item.color}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                              className="w-7 h-7 rounded-full border border-offgrid-green/20 flex items-center justify-center hover:bg-offgrid-green/10 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold text-offgrid-green w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                              className="w-7 h-7 rounded-full border border-offgrid-green/20 flex items-center justify-center hover:bg-offgrid-green/10 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="font-bold text-offgrid-green text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.productId, item.size, item.color)}
                              className="text-offgrid-green/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clear Cart */}
                  <button
                    onClick={clearCart}
                    className="text-xs text-offgrid-green/50 hover:text-offgrid-green underline transition-colors"
                  >
                    Clear entire cart
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            {cart.length > 0 && (
              <div className="border-t border-offgrid-green/10 p-4 sm:p-6 bg-offgrid-cream">
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm text-offgrid-green/60">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-offgrid-green/60">
                    <span>Shipping</span>
                    <span className={cn(
                      subtotal >= freeShippingThreshold ? "text-offgrid-lime font-semibold" : ""
                    )}>
                      {subtotal >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}
                    </span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-display font-bold text-offgrid-green pt-2 sm:pt-3 border-t border-offgrid-green/10">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  onClick={openCheckout}
                  className="w-full group h-12 sm:h-14"
                >
                  Checkout
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>

                <p className="text-[10px] sm:text-xs text-center text-offgrid-green/40 mt-3 sm:mt-4">
                  Secure checkout · Free returns within 14 days
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
