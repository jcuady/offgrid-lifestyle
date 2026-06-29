import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Wallet, Banknote, Package, ChevronRight, ChevronLeft, MapPin, Truck, Zap, Upload, Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "./ui/Button";
import { formatPrice } from "@/src/data/products";
import { validateShippingInfoFields, validateRetailCart, normalizeShippingInfo, sanitizeShippingInfo, type ShippingFieldErrors } from "@/src/lib/formValidation";
import { EMPTY_SHIPPING_INFO, type ShippingInfo } from "@/src/types/commerce";
import {
  checkoutPaymentConfigFromSettings,
  isRetailPaymentMethodSelectable,
  RETAIL_PAYMENT_METHODS,
  validateRetailPaymentMethod,
} from "@/src/types/payments";
import { cn } from "@/src/lib/utils";

const PhilippinesAddressFields = lazy(() =>
  import("@/src/components/checkout/PhilippinesAddressFields").then((m) => ({
    default: m.PhilippinesAddressFields,
  })),
);

const PAYMENT_ICONS = {
  cod: Banknote,
  gcash: Wallet,
  paymongo: Zap,
} as const;

const inputClass =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-sm text-offgrid-green outline-none transition-all focus:border-offgrid-green focus:ring-2 focus:ring-offgrid-green/20 sm:px-4 sm:py-3 sm:text-base";

function contactInputClass(hasError: boolean) {
  return cn(
    inputClass,
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
  );
}

function scrollToFirstFieldError(container: HTMLElement | null) {
  if (!container) return;
  requestAnimationFrame(() => {
    const target =
      container.querySelector<HTMLElement>("[data-field-error]") ??
      container.querySelector<HTMLElement>("[aria-invalid='true']");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

export function CheckoutModal() {
  const navigate = useNavigate();
  const currentUser = usePortalStore((s) => s.currentUser);
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
    toggleCart,
  } = useStore(
    useShallow((state) => ({
      isCheckoutOpen: state.isCheckoutOpen,
      closeCheckout: state.closeCheckout,
      checkoutStep: state.checkoutStep,
      setCheckoutStep: state.setCheckoutStep,
      shippingInfo: state.shippingInfo,
      setShippingInfo: state.setShippingInfo,
      paymentMethod: state.paymentMethod,
      setPaymentMethod: state.setPaymentMethod,
      cart: state.cart,
      placeOrder: state.placeOrder,
      orderId: state.orderId,
      resetCheckout: state.resetCheckout,
      toggleCart: state.toggleCart,
    })),
  );

  const [formData, setFormData] = useState<ShippingInfo>(() => normalizeShippingInfo(shippingInfo));
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ShippingFieldErrors>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const shippingFormRef = useRef<HTMLFormElement>(null);
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const checkoutPaymentConfig = useMemo(
    () => checkoutPaymentConfigFromSettings(paymentSettings),
    [paymentSettings.cod, paymentSettings.paymongo],
  );

  useEffect(() => {
    if (!isCheckoutOpen) return;
    setFormData(normalizeShippingInfo(shippingInfo));
    setFieldErrors({});
    setShippingError(null);
    setCheckoutError(null);
  }, [isCheckoutOpen, shippingInfo]);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    if (currentUser?.role === "customer") {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name,
        email: currentUser.email,
      }));
    }
  }, [isCheckoutOpen, currentUser]);

  useEffect(() => {
    if (checkoutStep !== 2) return;
    if (!isRetailPaymentMethodSelectable(paymentMethod, checkoutPaymentConfig)) {
      setPaymentMethod("gcash");
    }
  }, [checkoutStep, paymentMethod, checkoutPaymentConfig, setPaymentMethod]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleClose = () => {
    closeCheckout();
    if (checkoutStep === 3) {
      resetCheckout();
    }
  };

  const handleBackFromShipping = () => {
    closeCheckout();
    toggleCart(true);
  };

  const clearFieldError = (field: keyof ShippingFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setShippingError(null);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeShippingInfo(normalizeShippingInfo(formData));
    const errors = validateShippingInfoFields(sanitized);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShippingError(Object.values(errors)[0] ?? "Please complete all required fields.");
      scrollToFirstFieldError(shippingFormRef.current);
      return;
    }
    setFieldErrors({});
    setShippingError(null);
    setCheckoutError(null);
    setFormData(sanitized);
    setShippingInfo(sanitized);
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) return;

    const cartError = validateRetailCart(cart);
    if (cartError) {
      setCheckoutError(cartError);
      return;
    }

    const normalizedShipping = sanitizeShippingInfo(normalizeShippingInfo(shippingInfo));
    const shippingFieldErrors = validateShippingInfoFields(normalizedShipping);
    if (Object.keys(shippingFieldErrors).length > 0) {
      setCheckoutError(Object.values(shippingFieldErrors)[0] ?? "Complete your shipping details.");
      setFieldErrors(shippingFieldErrors);
      setFormData(normalizedShipping);
      setCheckoutStep(1);
      scrollToFirstFieldError(shippingFormRef.current);
      return;
    }

    const paymentError = validateRetailPaymentMethod(paymentMethod, checkoutPaymentConfig);
    if (paymentError) {
      setCheckoutError(paymentError);
      return;
    }

    try {
      setPlacingOrder(true);
      setCheckoutError(null);
      setShippingInfo(normalizedShipping);
      await placeOrder();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not place order.";
      setCheckoutError(message);
      if (message.toLowerCase().includes("shipping") || message.toLowerCase().includes("region")) {
        const retryErrors = validateShippingInfoFields(normalizedShipping);
        setFieldErrors(retryErrors);
        setFormData(normalizedShipping);
        setCheckoutStep(1);
        scrollToFirstFieldError(shippingFormRef.current);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleContinueShopping = () => {
    resetCheckout();
  };

  if (!isCheckoutOpen) return null;

  if (!cart.length && checkoutStep < 3) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-offgrid-dark/80 backdrop-blur-sm px-4"
        >
          <div className="max-w-md rounded-2xl bg-offgrid-cream p-8 text-center">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Cart is empty</h2>
            <p className="mt-2 text-sm text-offgrid-green/60">Add products from the shop before checking out.</p>
            <Button variant="default" size="lg" className="mt-6" onClick={closeCheckout}>
              Continue shopping
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          className="min-h-[100dvh] px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-4 sm:py-8 md:py-12"
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
                    { step: 2, label: "Payment", icon: Wallet },
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center gap-2 sm:gap-4">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all",
                          checkoutStep >= item.step
                            ? "bg-offgrid-lime text-white"
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
                      <form ref={shippingFormRef} onSubmit={handleShippingSubmit} className="flex min-h-0 flex-col">
                        <div className="space-y-4 sm:space-y-5">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => {
                                  setFormData({ ...formData, fullName: e.target.value });
                                  clearFieldError("fullName");
                                }}
                                className={contactInputClass(Boolean(fieldErrors.fullName))}
                                placeholder="Juan Dela Cruz"
                                autoComplete="name"
                                aria-invalid={Boolean(fieldErrors.fullName)}
                              />
                              {fieldErrors.fullName ? (
                                <p className="mt-1 text-xs text-red-600" role="alert" data-field-error="fullName">
                                  {fieldErrors.fullName}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
                                Email *
                              </label>
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value });
                                  clearFieldError("email");
                                }}
                                className={contactInputClass(Boolean(fieldErrors.email))}
                                placeholder="juan@email.com"
                                autoComplete="email"
                                aria-invalid={Boolean(fieldErrors.email)}
                              />
                              {fieldErrors.email ? (
                                <p className="mt-1 text-xs text-red-600" role="alert" data-field-error="email">
                                  {fieldErrors.email}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green">
                                Phone *
                              </label>
                              <input
                                type="tel"
                                required
                                inputMode="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                  setFormData({ ...formData, phone: e.target.value });
                                  clearFieldError("phone");
                                }}
                                className={contactInputClass(Boolean(fieldErrors.phone))}
                                placeholder="+63 917 123 4567"
                                autoComplete="tel"
                                aria-invalid={Boolean(fieldErrors.phone)}
                              />
                              {fieldErrors.phone ? (
                                <p className="mt-1 text-xs text-red-600" role="alert" data-field-error="phone">
                                  {fieldErrors.phone}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Suspense
                            fallback={
                              <p className="rounded-xl border border-offgrid-green/15 bg-white px-4 py-6 text-sm text-offgrid-green/60">
                                Loading Philippines address options…
                              </p>
                            }
                          >
                            <PhilippinesAddressFields
                              value={formData}
                              onChange={setFormData}
                              errors={fieldErrors}
                              onClearError={clearFieldError}
                            />
                          </Suspense>
                        </div>

                        {shippingError ? (
                          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                            {shippingError}
                          </p>
                        ) : null}

                        <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-offgrid-green/10 bg-offgrid-cream/95 px-5 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:mt-8 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleBackFromShipping}
                            className="h-12 w-full border-offgrid-green text-offgrid-green sm:h-14 sm:flex-1"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Back to cart
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full bg-offgrid-lime font-bold text-offgrid-green hover:bg-offgrid-lime/90 sm:h-14 sm:flex-[1.2]"
                          >
                            Continue to Payment
                            <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
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
                        {RETAIL_PAYMENT_METHODS.map((method) => {
                          const Icon = PAYMENT_ICONS[method.id];
                          const selectable = isRetailPaymentMethodSelectable(method.id, checkoutPaymentConfig);
                          const isSelected = paymentMethod === method.id;

                          return (
                            <button
                              key={method.id}
                              type="button"
                              disabled={!selectable}
                              onClick={() => selectable && setPaymentMethod(method.id)}
                              className={cn(
                                "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all text-left",
                                !selectable && "cursor-not-allowed opacity-60",
                                isSelected && selectable
                                  ? "border-offgrid-green bg-offgrid-green/5"
                                  : "border-offgrid-green/20",
                                selectable && !isSelected && "hover:border-offgrid-green/40",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                  isSelected && selectable
                                    ? "bg-offgrid-green text-offgrid-cream"
                                    : "bg-offgrid-green/10",
                                )}
                              >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-offgrid-green text-sm sm:text-base">{method.label}</p>
                                  {method.comingSoon && !selectable ? (
                                    <span className="rounded-full bg-offgrid-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-offgrid-gold">
                                      Coming soon
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[10px] sm:text-xs text-offgrid-green/60 truncate">{method.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {paymentMethod === "paymongo" && isRetailPaymentMethodSelectable("paymongo", checkoutPaymentConfig) ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mb-8 rounded-xl border border-offgrid-green/10 bg-white p-6"
                        >
                          <p className="text-sm text-offgrid-green/70">{paymentSettings.paymongo.checkoutDescription}</p>
                          <p className="mt-2 text-xs text-offgrid-green/50">
                            You will be redirected to PayMongo to complete payment after placing your order.
                          </p>
                        </motion.div>
                      ) : null}

                      {/* GCash QR */}
                      {paymentMethod === "gcash" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mb-8 rounded-xl border border-offgrid-green/10 bg-white p-6"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
                            Scan to pay via GCash
                          </p>
                          <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <img
                              src={paymentSettings.gcashQrImageUrl}
                              alt="GCash QR code"
                              className="h-48 w-48 rounded-xl border border-offgrid-green/10 bg-offgrid-cream object-contain"
                            />
                            <p className="max-w-md text-sm leading-relaxed text-offgrid-green/70">
                              {paymentSettings.gcashInstructions}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === "cod" && isRetailPaymentMethodSelectable("cod", checkoutPaymentConfig) ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mb-8 rounded-xl border border-offgrid-green/10 bg-white p-6"
                        >
                          <p className="text-sm text-offgrid-green/70">{paymentSettings.cod.checkoutDescription}</p>
                        </motion.div>
                      ) : null}

                      {checkoutError ? (
                        <p className="mb-4 text-sm font-medium text-red-600" role="alert">
                          {checkoutError}
                        </p>
                      ) : null}

                      <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-offgrid-green/10 bg-offgrid-cream/95 px-5 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:mt-8 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setCheckoutStep(1)}
                          className="h-12 w-full border-offgrid-green text-offgrid-green sm:h-14 sm:flex-1"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Back
                        </Button>
                        <Button
                          size="lg"
                          disabled={placingOrder}
                          onClick={() => void handlePlaceOrder()}
                          className="h-12 w-full bg-offgrid-lime font-bold text-offgrid-green hover:bg-offgrid-lime/90 disabled:opacity-70 sm:h-14 sm:flex-[1.2]"
                        >
                          {placingOrder ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Placing order…
                            </>
                          ) : (
                            <>
                              Place Order — {formatPrice(total)}
                              <Check className="ml-2 h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                            </>
                          )}
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
                        <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={3} />
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

                      {/* GCash payment next steps */}
                      {paymentMethod === "gcash" && (
                        <div className="mb-6 sm:mb-8 rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/8 p-4 sm:p-6 text-left">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-offgrid-green/60 mb-3">
                            Next step — Send payment proof
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            <img
                              src={paymentSettings.gcashQrImageUrl}
                              alt="GCash QR"
                              className="h-36 w-36 shrink-0 rounded-xl border border-offgrid-green/10 bg-white object-contain"
                            />
                            <div className="space-y-2">
                              <p className="text-sm leading-relaxed text-offgrid-green/75">
                                {paymentSettings.gcashInstructions}
                              </p>
                              <p className="text-sm font-semibold text-offgrid-green">
                                After paying, upload your GCash screenshot from your order page so our team can confirm.
                              </p>
                            </div>
                          </div>
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

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {paymentMethod === "gcash" && orderId ? (
                          <Button
                            variant="default"
                            size="lg"
                            onClick={() => {
                              handleContinueShopping();
                              const proofPath = `/account/orders/${orderId}`;
                              if (currentUser?.role === "customer") {
                                navigate(proofPath);
                              } else {
                                navigate("/account/sign-in", { state: { from: proofPath } });
                              }
                            }}
                            className="h-12 sm:h-14 gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Payment Proof
                          </Button>
                        ) : null}
                        <Button
                          variant={paymentMethod === "gcash" ? "outline" : "default"}
                          size="lg"
                          onClick={handleContinueShopping}
                          className="h-12 sm:h-14"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                      <p className="text-xs text-offgrid-green/40 mt-4">
                        Need custom team gear?{" "}
                        <a href="/custom" className="underline hover:text-offgrid-green transition-colors">
                          Start a custom order
                        </a>
                      </p>
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
