import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, CreditCard, Wallet, Banknote, Package, ChevronRight, MapPin, Truck } from "lucide-react";
import { useStore } from "@/src/store/store";
import { Button } from "./ui/Button";
import { formatPrice } from "@/src/data/products";
import { cn } from "@/src/lib/utils";

export function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    checkoutStep,
    setCheckoutStep,
    shippingInfo,
    setShippingInfo,
    paymentMethod,
    setPaymentMethod,
    cart,
    placeOrder,
    orderId,
    resetCheckout,
  } = useStore();

  const [formData, setFormData] = useState(shippingInfo);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleClose = () => {
    closeCheckout();
    if (checkoutStep === 3) {
      resetCheckout();
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingInfo(formData);
    setCheckoutStep(2);
  };

  const handlePlaceOrder = () => {
    placeOrder();
  };

  const handleContinueShopping = () => {
    resetCheckout();
  };

  if (!isCheckoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-offgrid-dark/80 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="min-h-screen px-3 sm:px-4 py-6 sm:py-8 md:py-12"
        >
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-offgrid-cream">
                {checkoutStep === 3 ? "Order Confirmed" : "Checkout"}
              </h1>
              <button
                onClick={handleClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-offgrid-cream/10 flex items-center justify-center hover:bg-offgrid-cream/20 transition-colors text-offgrid-cream"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            {checkoutStep < 3 && (
              <div className="mb-6 sm:mb-10">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {[
                    { step: 1, label: "Shipping", icon: MapPin },
                    { step: 2, label: "Payment", icon: CreditCard },
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center gap-2 sm:gap-4">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all",
                          checkoutStep >= item.step
                            ? "bg-offgrid-lime text-offgrid-dark"
                            : "bg-offgrid-cream/10 text-offgrid-cream/40"
                        )}
                      >
                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </div>
                      {index < 1 && (
                        <ChevronRight className="w-5 h-5 text-offgrid-cream/30" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {/* Step 1: Shipping */}
                  {checkoutStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-offgrid-cream rounded-2xl p-5 sm:p-8"
                    >
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-5 sm:mb-6">
                        Shipping Information
                      </h2>
                      <form onSubmit={handleShippingSubmit} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="Juan Dela Cruz"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="juan@email.com"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Phone *
                            </label>
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="+63 917 123 4567"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Address *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="123 Rizal Street, Barangay 5"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="Taguig"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Province *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.province}
                              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="Metro Manila"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              ZIP Code *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.zip}
                              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-sm sm:text-base text-offgrid-green bg-white"
                              placeholder="1634"
                            />
                          </div>
                        </div>

                        <Button variant="default" size="lg" type="submit" className="w-full mt-6 sm:mt-8 h-12 sm:h-14">
                          Continue to Payment
                          <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 2: Payment */}
                  {checkoutStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-offgrid-cream rounded-2xl p-5 sm:p-8"
                    >
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-5 sm:mb-6">
                        Payment Method
                      </h2>

                      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                        {/* COD */}
                        <button
                          onClick={() => setPaymentMethod("cod")}
                          className={cn(
                            "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all",
                            paymentMethod === "cod"
                              ? "border-offgrid-green bg-offgrid-green/5"
                              : "border-offgrid-green/20 hover:border-offgrid-green/40"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                            paymentMethod === "cod" ? "bg-offgrid-green text-offgrid-cream" : "bg-offgrid-green/10"
                          )}>
                            <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-bold text-offgrid-green text-sm sm:text-base">Cash on Delivery</p>
                            <p className="text-[10px] sm:text-xs text-offgrid-green/60 truncate">Pay when you receive</p>
                          </div>
                        </button>

                        {/* GCash */}
                        <button
                          onClick={() => setPaymentMethod("gcash")}
                          className={cn(
                            "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all",
                            paymentMethod === "gcash"
                              ? "border-offgrid-green bg-offgrid-green/5"
                              : "border-offgrid-green/20 hover:border-offgrid-green/40"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                            paymentMethod === "gcash" ? "bg-offgrid-green text-offgrid-cream" : "bg-offgrid-green/10"
                          )}>
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-bold text-offgrid-green text-sm sm:text-base">GCash</p>
                            <p className="text-[10px] sm:text-xs text-offgrid-green/60 truncate">Pay via GCash mobile wallet</p>
                          </div>
                        </button>

                        {/* Card */}
                        <button
                          onClick={() => setPaymentMethod("card")}
                          className={cn(
                            "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all",
                            paymentMethod === "card"
                              ? "border-offgrid-green bg-offgrid-green/5"
                              : "border-offgrid-green/20 hover:border-offgrid-green/40"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                            paymentMethod === "card" ? "bg-offgrid-green text-offgrid-cream" : "bg-offgrid-green/10"
                          )}>
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-bold text-offgrid-green text-sm sm:text-base">Credit / Debit Card</p>
                            <p className="text-[10px] sm:text-xs text-offgrid-green/60 truncate">Visa, Mastercard</p>
                          </div>
                        </button>
                      </div>

                      {/* Card Details (if card selected) */}
                      {paymentMethod === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mb-8 p-6 bg-white rounded-xl border border-offgrid-green/10 space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-offgrid-green"
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-offgrid-green"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-offgrid-green mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-offgrid-green/20 focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 outline-none transition-all text-offgrid-green"
                                placeholder="123"
                                maxLength={3}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setCheckoutStep(1)}
                          className="w-full sm:flex-1 h-12 sm:h-14"
                        >
                          Back
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={handlePlaceOrder}
                          className="w-full sm:flex-1 group h-12 sm:h-14"
                        >
                          Place Order — {formatPrice(total)}
                          <Check className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirmation */}
                  {checkoutStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-offgrid-cream rounded-2xl p-6 sm:p-10 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-offgrid-lime flex items-center justify-center"
                      >
                        <Check className="w-10 h-10 sm:w-12 sm:h-12 text-offgrid-dark" strokeWidth={3} />
                      </motion.div>

                      <h2 className="text-2xl sm:text-3xl font-display font-black text-offgrid-green mb-2 sm:mb-3">
                        Order Confirmed!
                      </h2>
                      <p className="text-sm sm:text-base text-offgrid-green/60 mb-6 sm:mb-8">
                        Thank you for your purchase. Your order has been placed successfully.
                      </p>

                      {orderId && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 inline-block">
                          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-2">
                            Order Number
                          </p>
                          <p className="text-xl sm:text-2xl font-display font-black text-offgrid-green">
                            {orderId}
                          </p>
                        </div>
                      )}

                      <div className="bg-offgrid-green/5 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
                        <div className="flex items-start gap-3 mb-4">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-offgrid-lime flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-offgrid-green text-sm">Estimated Delivery</p>
                            <p className="text-xs text-offgrid-green/60 mt-1">
                              3-5 business days via standard shipping
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-offgrid-lime flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-offgrid-green text-sm">Tracking Information</p>
                            <p className="text-xs text-offgrid-green/60 mt-1">
                              You'll receive an email with tracking details once your order ships
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleContinueShopping}
                        className="w-full sm:w-auto sm:max-w-xs h-12 sm:h-14"
                      >
                        Continue Shopping
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary Sidebar */}
              {checkoutStep < 3 && (
                <div className="lg:col-span-1 order-first lg:order-last -mt-2 lg:mt-0">
                  <div className="bg-offgrid-cream rounded-2xl p-5 sm:p-6 lg:sticky lg:top-8">
                    <h3 className="text-base sm:text-lg font-display font-bold text-offgrid-green mb-4 sm:mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      {cart.map((item) => (
                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-offgrid-green text-xs sm:text-sm truncate">{item.name}</p>
                            <p className="text-[10px] sm:text-xs text-offgrid-green/50 truncate">
                              {item.size} · {item.color} · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-3 sm:pt-4 border-t border-offgrid-green/10">
                      <div className="flex justify-between text-xs sm:text-sm text-offgrid-green/60">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-offgrid-green/60">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg font-display font-bold text-offgrid-green pt-2 sm:pt-3 border-t border-offgrid-green/10">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
