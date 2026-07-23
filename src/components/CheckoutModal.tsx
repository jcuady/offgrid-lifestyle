import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Wallet, Banknote, Package, ChevronRight, ChevronDown, MapPin, Truck, Zap, Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "./ui/Button";
import { formatPrice } from "@/src/data/products";
import { validateShippingInfoFields, validateRetailCart, normalizeShippingInfo, sanitizeShippingInfo, formatPhilippinePhoneInput, type ShippingFieldErrors } from "@/src/lib/formValidation";
import { checkoutCartItemLabel, checkoutCartLineCount, shouldShowEmptyCartGate } from "@/src/lib/checkoutUi";
import { EMPTY_SHIPPING_INFO, type ShippingInfo } from "@/src/types/commerce";
import {
  checkoutPaymentConfigFromSettings,
  isRetailPaymentMethodSelectable,
  RETAIL_PAYMENT_METHODS,
  validateRetailPaymentMethod,
} from "@/src/types/payments";
import { persistCheckoutShipping } from "@/src/services/customerShippingService";
import { cn } from "@/src/lib/utils";
import { electricBluePill } from "@/src/lib/brandLayout";

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

/** 16px text prevents iOS zoom-on-focus; 44px min height for touch. */
const inputClass =
  "min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

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
  const [summaryOpen, setSummaryOpen] = useState(false);
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
  const itemCount = checkoutCartLineCount(cart);
  const itemLabel = checkoutCartItemLabel(itemCount);

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
    void persistCheckoutShipping(sanitized);
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

  // Only block when truly empty and no in-flight / placed order (PayMongo race).
  if (
    shouldShowEmptyCartGate({
      cartLength: cart.length,
      checkoutStep,
      orderId,
      placingOrder,
    })
  ) {
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
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-offgrid-dark/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-transparent sm:h-auto sm:max-h-[min(92dvh,880px)]"
        >
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-0 sm:py-0">
            <div className="mb-2 flex shrink-0 items-center justify-between sm:mb-4">
              <h1 className="font-display text-xl font-black text-offgrid-cream sm:text-3xl md:text-4xl">
                {checkoutStep === 3 ? "Order Confirmed" : "Checkout"}
              </h1>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close checkout"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-offgrid-cream/10 text-offgrid-cream transition-colors hover:bg-offgrid-cream/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicator */}
            {checkoutStep < 3 && (
              <div className="mb-2 shrink-0 sm:mb-4">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {[
                    { step: 1, label: "Shipping", icon: MapPin },
                    { step: 2, label: "Payment", icon: Wallet },
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center gap-2 sm:gap-4">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:py-2 sm:text-sm",
                          checkoutStep >= item.step
                            ? "bg-offgrid-lime text-white"
                            : "bg-offgrid-cream/10 text-offgrid-cream/40"
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{item.label}</span>
                      </div>
                      {index < 1 && (
                        <ChevronRight className="h-4 w-4 text-offgrid-cream/30 sm:h-5 sm:w-5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-3 lg:gap-6">
              {/* Mobile: compact order strip — keeps shipping form visible first */}
              {checkoutStep < 3 ? (
                <div className="shrink-0 lg:hidden">
                  <div className="overflow-hidden rounded-2xl bg-offgrid-cream">
                    <button
                      type="button"
                      onClick={() => setSummaryOpen((v) => !v)}
                      className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left"
                      aria-expanded={summaryOpen}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                          Order summary
                        </p>
                        <p className="truncate text-sm font-semibold text-offgrid-green">
                          {itemLabel}
                          {cart[0] ? ` · ${cart[0].name}` : ""}
                          {cart.length > 1 ? ` +${cart.length - 1}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-base font-bold text-offgrid-green">
                        {formatPrice(total)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-offgrid-green/45 transition-transform",
                          summaryOpen && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </button>
                    {summaryOpen ? (
                      <div className="space-y-2 border-t border-offgrid-green/10 px-4 py-3">
                        {cart.map((item) => (
                          <div
                            key={`${item.productId}-${item.size}-${item.color}`}
                            className="flex gap-3"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-offgrid-green">{item.name}</p>
                              <p className="truncate text-[10px] text-offgrid-green/50">
                                {item.size} · {item.color} · Qty {item.quantity}
                              </p>
                            </div>
                            <p className="shrink-0 text-xs font-semibold text-offgrid-green">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        <div className="space-y-1 border-t border-offgrid-green/10 pt-2 text-xs text-offgrid-green/65">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                          </div>
                          <div className="flex justify-between pt-1 font-display text-sm font-bold text-offgrid-green">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Main Content — scrolls inside the card, not the page */}
              <div className="flex min-h-0 flex-col overflow-hidden lg:col-span-2">
                <AnimatePresence mode="wait">
                  {/* Step 1: Shipping */}
                  {checkoutStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-offgrid-cream"
                    >
                      <div className="shrink-0 border-b border-offgrid-green/10 px-4 py-3 sm:px-6 sm:py-4">
                        <h2 className="text-lg font-display font-bold text-offgrid-green sm:text-xl">
                          Where should we deliver?
                        </h2>
                        <p className="mt-0.5 text-xs text-offgrid-green/55 sm:text-sm">
                          Complete the fields below, then continue to payment.
                        </p>
                      </div>
                      <form
                        ref={shippingFormRef}
                        onSubmit={handleShippingSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                        noValidate
                      >
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
                            <div className="md:col-span-2">
                              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:mb-2 sm:text-xs">
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
                              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:mb-2 sm:text-xs">
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
                              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:mb-2 sm:text-xs">
                                Phone *
                              </label>
                              <input
                                type="tel"
                                required
                                inputMode="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    phone: formatPhilippinePhoneInput(e.target.value),
                                  });
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

                          {shippingError ? (
                            <p
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
                              role="alert"
                            >
                              {shippingError}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-offgrid-green/10 bg-offgrid-cream px-4 py-3 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleBackFromShipping}
                            className="h-11 w-full border-offgrid-green text-offgrid-green sm:h-12 sm:flex-1"
                          >
                            Back to cart
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="h-11 w-full bg-offgrid-lime font-bold text-white hover:bg-offgrid-lime/90 sm:h-12 sm:flex-[1.2]"
                          >
                            Continue to Payment
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 2: Payment */}
                  {checkoutStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-offgrid-cream"
                    >
                      <div className="shrink-0 border-b border-offgrid-green/10 px-4 py-3 sm:px-6 sm:py-4">
                        <h2 className="text-lg font-display font-bold text-offgrid-green sm:text-xl">
                          How will you pay?
                        </h2>
                        <p className="mt-0.5 text-xs text-offgrid-green/55 sm:text-sm">
                          Choose a method, then place your order.
                        </p>
                      </div>
                      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4">
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
                                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all sm:gap-4 sm:p-5",
                                !selectable && "cursor-not-allowed opacity-60",
                                isSelected && selectable
                                  ? "border-offgrid-green bg-offgrid-green/5"
                                  : "border-offgrid-green/20",
                                selectable && !isSelected && "hover:border-offgrid-green/40",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12",
                                  isSelected && selectable
                                    ? "bg-offgrid-green text-offgrid-cream"
                                    : "bg-offgrid-green/10",
                                )}
                              >
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-bold text-offgrid-green sm:text-base">{method.label}</p>
                                  {method.comingSoon && !selectable ? (
                                    <span className="rounded-full bg-offgrid-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-offgrid-gold">
                                      Coming soon
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[10px] text-offgrid-green/60 sm:text-xs">{method.description}</p>
                              </div>
                            </button>
                          );
                        })}

                      {paymentMethod === "paymongo" && isRetailPaymentMethodSelectable("paymongo", checkoutPaymentConfig) ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="rounded-xl border border-offgrid-green/10 bg-white p-4 sm:p-6"
                        >
                          <p className="text-sm text-offgrid-green/70">{paymentSettings.paymongo.checkoutDescription}</p>
                          <p className="mt-2 text-xs text-offgrid-green/50">
                            After you place the order you will be redirected to PayMongo to scan a QR Ph code.
                            OFFGRID covers the processing fee.
                          </p>
                        </motion.div>
                      ) : null}

                      {paymentMethod === "gcash" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="rounded-xl border border-offgrid-green/10 bg-white p-4 sm:p-6"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
                            Scan to pay via GCash
                          </p>
                          <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <img
                              src={paymentSettings.gcashQrImageUrl}
                              alt="GCash QR code"
                              className="h-40 w-40 rounded-xl border border-offgrid-green/10 bg-offgrid-cream object-contain sm:h-48 sm:w-48"
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
                          className="rounded-xl border border-offgrid-green/10 bg-white p-4 sm:p-6"
                        >
                          <p className="text-sm text-offgrid-green/70">{paymentSettings.cod.checkoutDescription}</p>
                        </motion.div>
                      ) : null}

                      {checkoutError ? (
                        <p
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
                          role="alert"
                        >
                          {checkoutError}
                        </p>
                      ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-offgrid-green/10 bg-offgrid-cream px-4 py-3 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setCheckoutStep(1)}
                          className="h-11 w-full border-offgrid-green text-offgrid-green sm:h-12 sm:flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          size="lg"
                          disabled={placingOrder}
                          onClick={() => void handlePlaceOrder()}
                          className="h-11 w-full bg-offgrid-lime font-bold text-white hover:bg-offgrid-lime/90 disabled:opacity-70 sm:h-12 sm:flex-[1.2]"
                        >
                          {placingOrder ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Placing order…
                            </>
                          ) : (
                            <>Place Order — {formatPrice(total)}</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirmation */}
                  {checkoutStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-offgrid-cream p-5 text-center sm:p-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                        className={cn(
                          "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full sm:mb-6 sm:h-24 sm:w-24",
                          paymentMethod === "paymongo" && checkoutError
                            ? "bg-amber-500"
                            : "bg-offgrid-lime",
                        )}
                      >
                        <Check className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={3} />
                      </motion.div>

                      <h2 className="mb-2 font-display text-2xl font-black text-offgrid-green sm:mb-3 sm:text-3xl">
                        {paymentMethod === "paymongo" && checkoutError
                          ? "Order saved — payment needed"
                          : "Order Confirmed!"}
                      </h2>
                      <p className="mb-6 text-sm text-offgrid-green/60 sm:mb-8 sm:text-base">
                        {paymentMethod === "gcash"
                          ? "Your order is placed. Pay via GCash QR, then upload your screenshot so we can confirm payment."
                          : paymentMethod === "paymongo" && checkoutError
                            ? "Your order was saved, but PayMongo checkout did not start. Retry QR Ph payment below."
                            : paymentMethod === "paymongo"
                              ? "Your order is saved. Complete QR Ph payment to confirm — status updates automatically."
                              : "Thank you for your purchase. Your order has been placed successfully."}
                      </p>

                      {paymentMethod === "paymongo" && checkoutError ? (
                        <p
                          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900"
                          role="alert"
                        >
                          {checkoutError}
                        </p>
                      ) : null}

                      {orderId && (
                        <div className="mb-6 inline-block rounded-xl bg-white p-4 sm:mb-8 sm:p-6">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/50 sm:text-xs">
                            Order Number
                          </p>
                          <p className="font-display text-xl font-black text-offgrid-green sm:text-2xl">
                            {orderId}
                          </p>
                        </div>
                      )}

                      {paymentMethod === "gcash" && (
                        <div className="mb-6 rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/8 p-4 text-left sm:mb-8 sm:p-6">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-offgrid-green/60">
                            Next step — Send payment proof
                          </p>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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

                      {paymentMethod === "paymongo" && orderId ? (
                        <div className="mb-6 rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/8 p-4 text-left sm:mb-8 sm:p-6">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-offgrid-green/60">
                            PayMongo QR Ph
                          </p>
                          <p className="text-sm text-offgrid-green/75">
                            {checkoutError
                              ? "Continue to secure QR Ph payment — OFFGRID absorbs the fee."
                              : "Your order was saved. If checkout did not open automatically, continue to secure QR Ph payment — OFFGRID absorbs the fee."}
                          </p>
                          <a
                            href={`/checkout/paymongo/retry?order_id=${encodeURIComponent(orderId)}`}
                            className={cn(electricBluePill, "mt-4 inline-flex")}
                          >
                            {checkoutError ? "Retry QR Ph payment" : "Continue to PayMongo"}
                          </a>
                        </div>
                      ) : null}

                      <div className="mb-6 rounded-xl bg-offgrid-green/5 p-4 text-left sm:mb-8 sm:p-6">
                        <div className="mb-4 flex items-start gap-3">
                          <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-offgrid-lime sm:h-5 sm:w-5" />
                          <div>
                            <p className="text-sm font-bold text-offgrid-green">Estimated Delivery</p>
                            <p className="mt-1 text-xs text-offgrid-green/60">
                              3-5 business days via standard shipping
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-offgrid-lime sm:h-5 sm:w-5" />
                          <div>
                            <p className="text-sm font-bold text-offgrid-green">Tracking Information</p>
                            <p className="mt-1 text-xs text-offgrid-green/60">
                              Track this order anytime from My Orders after you sign in
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-3 sm:flex-row">
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
                            className="h-12 sm:h-14"
                          >
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
                      <p className="mt-4 text-xs text-offgrid-green/40">
                        Need custom team gear?{" "}
                        <a href="/custom" className="underline transition-colors hover:text-offgrid-green">
                          Start a custom order
                        </a>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop order summary sidebar */}
              {checkoutStep < 3 && (
                <div className="hidden min-h-0 flex-col overflow-hidden lg:flex lg:col-span-1">
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-offgrid-cream">
                    <h3 className="shrink-0 border-b border-offgrid-green/10 px-5 py-4 font-display text-lg font-bold text-offgrid-green">
                      Order Summary
                    </h3>

                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-3">
                      {cart.map((item) => (
                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-offgrid-green">{item.name}</p>
                            <p className="truncate text-xs text-offgrid-green/50">
                              {item.size} · {item.color} · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="shrink-0 space-y-2 border-t border-offgrid-green/10 px-5 py-4">
                      <div className="flex justify-between text-sm text-offgrid-green/60">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-offgrid-green/60">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="flex justify-between border-t border-offgrid-green/10 pt-3 font-display text-lg font-bold text-offgrid-green">
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
