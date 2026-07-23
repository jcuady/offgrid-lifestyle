import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localOrderService } from "@/src/services";
import type { ShippingInfo } from "@/src/types/commerce";
import { EMPTY_SHIPPING_INFO } from "@/src/types/commerce";
import type { RetailPaymentMethod } from "@/src/types/payments";

// Types
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export type { ShippingInfo };

export type PaymentMethod = RetailPaymentMethod;
export type CheckoutStep = 1 | 2 | 3;

interface StoreState {
  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;
  
  // Checkout State
  isCheckoutOpen: boolean;
  checkoutStep: CheckoutStep;
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  orderId: string | null;

  // Cart Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  
  // Checkout Actions
  openCheckout: () => void;
  closeCheckout: () => void;
  setCheckoutStep: (step: CheckoutStep) => void;
  setShippingInfo: (info: ShippingInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  placeOrder: () => Promise<string>;
  resetCheckout: () => void;
}

const generateOrderId = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OG-2026-${random}`;
};

export const useStore = create<StoreState>()(
  persist(
  (set, get) => ({
  // Initial State
  cart: [],
  isCartOpen: false,
  isCheckoutOpen: false,
  checkoutStep: 1,
  shippingInfo: EMPTY_SHIPPING_INFO,
  paymentMethod: "gcash",
  orderId: null,

  // Cart Actions
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existingItem) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.productId === item.productId &&
            cartItem.size === item.size &&
            cartItem.color === item.color
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          ),
        };
      }

      return { cart: [...state.cart, item] };
    }),

  removeFromCart: (productId, size, color) =>
    set((state) => ({
      cart: state.cart.filter(
        (item) =>
          !(item.productId === productId && item.size === size && item.color === color)
      ),
    })),

  updateQuantity: (productId, size, color, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  toggleCart: (open) =>
    set((state) => ({
      isCartOpen: typeof open === "boolean" ? open : !state.isCartOpen,
    })),

  // Checkout Actions
  openCheckout: () => {
    set({ isCheckoutOpen: true, checkoutStep: 1 });
    get().toggleCart(false);
  },

  closeCheckout: () => set({ isCheckoutOpen: false }),

  setCheckoutStep: (step) => set({ checkoutStep: step }),

  setShippingInfo: (info) => set({ shippingInfo: info }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  placeOrder: async () => {
    const state = get();
    if (!state.cart.length) {
      throw new Error("Your cart is empty.");
    }
    const orderId = generateOrderId();
    await localOrderService.submitRetailOrder({
      orderId,
      cart: state.cart,
      shippingInfo: state.shippingInfo,
      paymentMethod: state.paymentMethod,
    });

    // PayMongo QR Ph: keep cart until redirect so checkout UI never flashes "empty".
    if (state.paymentMethod === "paymongo") {
      const { createPayMongoCheckoutSession, redirectToPayMongoCheckout } = await import(
        "@/src/lib/paymongo"
      );
      set({
        orderId,
        checkoutStep: 3,
      });
      try {
        const session = await createPayMongoCheckoutSession({
          orderId,
          paymentKind: "full",
          email: state.shippingInfo.email,
        });
        if (session.alreadyPaid) {
          // ponytail: don't trust alreadyPaid for a freshly-placed order — throw a soft
          // error so step 3 shows the retry UI. Edge Function may return alreadyPaid on
          // a reused session; the retry page will reconcile the real payment status.
          throw new Error("This order may already be paid. Tap Retry QR Ph payment to confirm.");
        }
        if (!session.checkoutUrl) {
          throw new Error("PayMongo did not return a checkout URL.");
        }
        set({ cart: [] });
        redirectToPayMongoCheckout(session.checkoutUrl);
        return orderId;
      } catch (err) {
        // Order exists in DB — clear cart; keep order id for retry.
        set({ orderId, cart: [], checkoutStep: 3 });
        throw err instanceof Error
          ? err
          : new Error("Order saved, but PayMongo checkout could not start. Use Retry payment.");
      }
    }

    set({
      orderId,
      checkoutStep: 3,
      cart: [],
    });
    return orderId;
  },

  resetCheckout: () =>
    set({
      isCheckoutOpen: false,
      checkoutStep: 1,
      // Keep shipping for next checkout (DB is source of truth for signed-in customers).
      paymentMethod: "gcash",
      orderId: null,
      cart: [],
    }),
}),
    {
      name: "og-cart",
      version: 1,
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
