import type { FabricType as ProductFabricType, GarmentCut as ProductGarmentCut } from "@/src/data/products";

export type OrderType = "retail" | "custom";

export type OrderStatus =
  | "draft"
  | "pending_deposit"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "deposit_paid"
  | "fully_paid"
  | "refunded";

export type GarmentCut = ProductGarmentCut;
export type FabricType = ProductFabricType;

export type PrintMethod =
  | "sublimation"
  | "silk_screen"
  | "embroidery"
  | "heat_transfer"
  | "digital_print";

export interface Money {
  amount: number;
  currency: string;
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

export interface CustomOrderDraft {
  id: string | null;
  designFileName: string | null;
  designNotes: string;
  cut: GarmentCut | null;
  material: FabricType | null;
  printMethod: PrintMethod | null;
  quantity: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  teamOrOrg: string;
  estimatedTotal: Money | null;
  depositRequired: Money | null;
  status: OrderStatus;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RetailOrderLine {
  lineItemId: string;
  productId: string;
  variantSku?: string;
  name: string;
  image: string;
  priceSnapshot: Money;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  lines: RetailOrderLine[];
  subtotal: Money;
  shipping: Money;
  tax: Money;
  total: Money;
  shippingInfo: ShippingInfo | null;
  paymentMethod: string | null;
  paymentProviderRef: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutProfile {
  customerId: string | null;
  shipping: ShippingInfo;
  preferredPaymentMethod: string | null;
  savedAt: string | null;
}

// --- Payload mappers (MVP: identity-like, ready for API serialization) ---

export function toCustomOrderPayload(draft: CustomOrderDraft) {
  return {
    ...draft,
    createdAt: draft.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function toRetailOrderPayload(
  cart: { productId: string; name: string; image: string; price: number; size: string; color: string; quantity: number }[],
  shipping: ShippingInfo,
  paymentMethod: string,
  orderId: string,
): Order {
  const lines: RetailOrderLine[] = cart.map((item) => ({
    lineItemId: crypto.randomUUID(),
    productId: item.productId,
    name: item.name,
    image: item.image,
    priceSnapshot: { amount: item.price, currency: "PHP" },
    size: item.size,
    color: item.color,
    quantity: item.quantity,
  }));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 2000 ? 0 : 150;

  return {
    id: orderId,
    type: "retail",
    status: "pending_deposit",
    paymentStatus: "unpaid",
    lines,
    subtotal: { amount: subtotal, currency: "PHP" },
    shipping: { amount: shippingCost, currency: "PHP" },
    tax: { amount: 0, currency: "PHP" },
    total: { amount: subtotal + shippingCost, currency: "PHP" },
    shippingInfo: shipping,
    paymentMethod,
    paymentProviderRef: null,
    customerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function php(amount: number): Money {
  return { amount, currency: "PHP" };
}

export function formatMoney(m: Money): string {
  return `₱${m.amount.toLocaleString("en-PH")}`;
}
