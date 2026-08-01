/** Retail checkout payment methods — aligned with `og_orders.payment_method` check constraint. */
export type RetailPaymentMethod = "cod" | "gcash" | "card" | "paymongo";

/** Who processes the payment — `paymongo` when using PayMongo Checkout / Payment Intent API. */
export type PaymentProvider = "manual" | "paymongo";

export type PayMongoMode = "test" | "live";

/** PayMongo transaction status — maps to `og_payment_transactions.status`. */
export type PayMongoTransactionStatus =
  | "pending"
  | "awaiting_payment_method"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

export interface CodSettings {
  /** When true, checkout allows COD selection. MVP: false (coming soon). */
  enabled: boolean;
  checkoutDescription: string;
}

export const DEFAULT_COD_SETTINGS: CodSettings = {
  enabled: false,
  checkoutDescription: "Pay the courier when your order arrives. Available in select service areas.",
};

export interface PayMongoSettings {
  /** When true, checkout allows PayMongo selection. Keep false until server integration ships. */
  enabled: boolean;
  mode: PayMongoMode;
  /** Public key only (`pk_test_*` / `pk_live_*`). Secret key is server env only — never client or localStorage. */
  publicKey: string;
  checkoutDescription: string;
}

export const DEFAULT_PAYMONGO_SETTINGS: PayMongoSettings = {
  enabled: false,
  mode: "test",
  publicKey: "",
  checkoutDescription:
    "Pay with QR Ph via PayMongo. OFFGRID absorbs the processing fee — you pay the order total only.",
};

/** Checkout-time config passed to payment validators (maps to `og_payment_settings`). */
export interface CheckoutPaymentConfig {
  cod: CodSettings;
  paymongo: PayMongoSettings;
  /** Empty or placeholder URL means GCash is not ready for checkout. */
  gcashQrImageUrl: string;
}

export interface RetailPaymentMethodMeta {
  id: Exclude<RetailPaymentMethod, "card">;
  label: string;
  description: string;
  comingSoon?: boolean;
  provider: PaymentProvider | null;
}

/** Active checkout options: GCash (when QR uploaded), PayMongo + COD (until admin enables). */
export const RETAIL_PAYMENT_METHODS: RetailPaymentMethodMeta[] = [
  {
    id: "gcash",
    label: "GCash",
    description: "Scan QR and pay via GCash wallet",
    comingSoon: true,
    provider: "manual",
  },
  {
    id: "paymongo",
    label: "PayMongo QR Ph",
    description: "Scan QR Ph to pay — fee absorbed by OFFGRID",
    comingSoon: true,
    provider: "paymongo",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order is delivered",
    comingSoon: true,
    provider: "manual",
  },
];

export function isRetailPaymentMethod(value: string): value is RetailPaymentMethod {
  return ["cod", "gcash", "card", "paymongo"].includes(value);
}

export function resolvePaymentProvider(method: RetailPaymentMethod): PaymentProvider {
  return method === "paymongo" ? "paymongo" : "manual";
}

/** True when a real GCash QR is configured (rejects empty + placehold.co stubs). */
export function isGcashQrReady(url: string | null | undefined): boolean {
  const v = (url ?? "").trim();
  if (!v) return false;
  if (/placehold\.co/i.test(v)) return false;
  return true;
}

export function isGcashCheckoutAvailable(
  method: RetailPaymentMethod,
  config: CheckoutPaymentConfig,
): boolean {
  return method === "gcash" && isGcashQrReady(config.gcashQrImageUrl);
}

export function isPayMongoCheckoutAvailable(
  method: RetailPaymentMethod,
  paymongo: PayMongoSettings,
): boolean {
  return method === "paymongo" && paymongo.enabled && paymongo.publicKey.trim().length > 0;
}

export function isCodCheckoutAvailable(method: RetailPaymentMethod, cod: CodSettings): boolean {
  return method === "cod" && cod.enabled;
}

export function isRetailPaymentMethodSelectable(
  method: RetailPaymentMethod,
  config: CheckoutPaymentConfig,
): boolean {
  if (method === "gcash") return isGcashCheckoutAvailable(method, config);
  if (method === "paymongo") return isPayMongoCheckoutAvailable(method, config.paymongo);
  if (method === "cod") return isCodCheckoutAvailable(method, config.cod);
  return false;
}

export function validateRetailPaymentMethod(method: string, config: CheckoutPaymentConfig): string | null {
  if (!isRetailPaymentMethod(method)) {
    return "Invalid payment method.";
  }
  if (isRetailPaymentMethodSelectable(method, config)) {
    return null;
  }
  if (method === "gcash") {
    return "GCash QR is not set up yet. Choose another method, or ask the shop to upload a GCash QR.";
  }
  if (method === "cod") {
    return "Cash on delivery is coming soon. Pay via GCash or PayMongo.";
  }
  if (method === "paymongo") {
    return "PayMongo QR Ph is not available yet. Pay via GCash once the shop uploads a QR, or ask them to enable PayMongo.";
  }
  return "This payment method is not available.";
}

export function checkoutPaymentConfigFromSettings(settings: {
  cod: CodSettings;
  paymongo: PayMongoSettings;
  gcashQrImageUrl?: string;
}): CheckoutPaymentConfig {
  return {
    cod: settings.cod,
    paymongo: settings.paymongo,
    gcashQrImageUrl: settings.gcashQrImageUrl ?? "",
  };
}
