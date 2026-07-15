import { describe, expect, it } from "vitest";
import { validateRetailCart } from "@/src/lib/formValidation";
import { getDiscountPercent, isProductDiscounted } from "@/src/data/products";
import { selectFeaturedProducts } from "@/src/lib/featuredProducts";
import { products } from "@/src/data/products";
import { toRetailOrderPayload } from "@/src/types/commerce";
import {
  checkoutPaymentConfigFromSettings,
  DEFAULT_COD_SETTINGS,
  DEFAULT_PAYMONGO_SETTINGS,
  validateRetailPaymentMethod,
} from "@/src/types/payments";

const sampleShipping = {
  fullName: "Juan Dela Cruz",
  email: "juan@example.com",
  phone: "+63 917 123 4567",
  address: "123 Test St",
  barangay: "Poblacion",
  city: "Makati",
  province: "Metro Manila",
  region: "NCR",
  zip: "1200",
  regionCode: "130000000",
  provinceCode: "133900000",
  cityCode: "133901000",
  barangayCode: "133901001",
  latitude: null,
  longitude: null,
};

describe("payment gateway readiness — retail checkout", () => {
  const voyager = products.find((p) => p.id === "og-voyager")!;

  it("builds order payload with centavo-safe totals and free shipping threshold", () => {
    const cart = [
      {
        productId: voyager.id,
        name: voyager.name,
        image: voyager.image,
        price: voyager.price,
        size: "M",
        color: voyager.colors[0]?.value ?? "black",
        quantity: 1,
      },
    ];
    const order = toRetailOrderPayload(cart, sampleShipping, "gcash", "og-test-order-1");
    expect(order.subtotal.amount).toBe(voyager.price);
    expect(order.shipping.amount).toBe(150);
    expect(order.total.amount).toBe(voyager.price + 150);
    expect(order.paymentProvider).toBe("manual");
    expect(Math.round(order.subtotal.amount * 100)).toBe(Math.round(voyager.price * 100));
  });

  it("waives shipping at ₱2,000 subtotal", () => {
    const expensive = products.find((p) => p.price >= 1000 && p.status === "active")!;
    const cart = [
      {
        productId: expensive.id,
        name: expensive.name,
        image: expensive.image,
        price: expensive.price,
        size: "L",
        color: expensive.colors[0]?.value ?? "black",
        quantity: 2,
      },
    ];
    const order = toRetailOrderPayload(cart, sampleShipping, "gcash", "og-test-order-2");
    expect(order.subtotal.amount).toBeGreaterThanOrEqual(2000);
    expect(order.shipping.amount).toBe(0);
    expect(order.total.amount).toBe(order.subtotal.amount);
  });

  it("resolves PayMongo provider when method is paymongo", () => {
    const cart = [
      {
        productId: voyager.id,
        name: voyager.name,
        image: voyager.image,
        price: voyager.price,
        size: "S",
        color: voyager.colors[0]?.value ?? "black",
        quantity: 1,
      },
    ];
    const order = toRetailOrderPayload(cart, sampleShipping, "paymongo", "og-test-order-3");
    expect(order.paymentProvider).toBe("paymongo");
  });
});

describe("payment gateway readiness — cart validation", () => {
  const baseLine = {
    productId: "og-voyager",
    name: "Voyager",
    price: 1100,
    size: "M",
    color: "black",
    quantity: 1,
  };

  it("rejects empty cart", () => {
    expect(validateRetailCart([])).toMatch(/empty/i);
  });

  it("rejects tampered zero/negative prices", () => {
    expect(validateRetailCart([{ ...baseLine, price: 0 }])).toMatch(/invalid price/i);
    expect(validateRetailCart([{ ...baseLine, price: -5 }])).toMatch(/invalid price/i);
  });

  it("rejects quantity outside server bounds (1–10)", () => {
    expect(validateRetailCart([{ ...baseLine, quantity: 0 }])).toMatch(/between 1 and 10/i);
    expect(validateRetailCart([{ ...baseLine, quantity: 11 }])).toMatch(/between 1 and 10/i);
    expect(validateRetailCart([{ ...baseLine, quantity: 10 }])).toBeNull();
  });

  it("requires size and color on every line", () => {
    expect(validateRetailCart([{ ...baseLine, size: "" }])).toMatch(/size and color/i);
    expect(validateRetailCart([{ ...baseLine, color: "" }])).toMatch(/size and color/i);
  });
});

describe("payment gateway readiness — payment methods", () => {
  const disabledConfig = checkoutPaymentConfigFromSettings({
    cod: DEFAULT_COD_SETTINGS,
    paymongo: DEFAULT_PAYMONGO_SETTINGS,
  });

  it("allows GCash by default", () => {
    expect(validateRetailPaymentMethod("gcash", disabledConfig)).toBeNull();
  });

  it("blocks COD and PayMongo until admin enables them", () => {
    expect(validateRetailPaymentMethod("cod", disabledConfig)).toMatch(/coming soon/i);
    expect(validateRetailPaymentMethod("paymongo", disabledConfig)).toMatch(/coming soon/i);
  });

  it("allows PayMongo when enabled with public key", () => {
    const enabled = checkoutPaymentConfigFromSettings({
      cod: DEFAULT_COD_SETTINGS,
      paymongo: { ...DEFAULT_PAYMONGO_SETTINGS, enabled: true, publicKey: "pk_test_abc" },
    });
    expect(validateRetailPaymentMethod("paymongo", enabled)).toBeNull();
  });
});

describe("payment gateway readiness — catalog pricing display", () => {
  it("detects discounted voyager and computes savings percent", () => {
    const voyager = products.find((p) => p.id === "og-voyager")!;
    expect(isProductDiscounted(voyager)).toBe(true);
    expect(getDiscountPercent(voyager)).toBeGreaterThan(0);
  });

  it("excludes draft/archived products from featured storefront picks", () => {
    const withDraft = products.map((p) => (p.id === "og-voyager" ? { ...p, status: "draft" as const } : p));
    const featured = selectFeaturedProducts(withDraft, 3);
    expect(featured.every((p) => p.status === "active")).toBe(true);
    expect(featured.some((p) => p.id === "og-voyager")).toBe(false);
  });
});
