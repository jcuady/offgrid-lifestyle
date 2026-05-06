import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localOrderService } from "@/src/services";

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

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
}

export type PaymentMethod = "cod" | "gcash" | "card";
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
  placeOrder: () => string;
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
  shippingInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    zip: "",
  },
  paymentMethod: "cod",
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

  placeOrder: () => {
    const orderId = generateOrderId();
    const state = get();
    localOrderService.submitRetailOrder({
      orderId,
      cart: state.cart,
      shippingInfo: state.shippingInfo,
      paymentMethod: state.paymentMethod,
    });

    set({
      orderId,
      checkoutStep: 3,
    });
    return orderId;
  },

  resetCheckout: () =>
    set({
      isCheckoutOpen: false,
      checkoutStep: 1,
      shippingInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        zip: "",
      },
      paymentMethod: "cod",
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
