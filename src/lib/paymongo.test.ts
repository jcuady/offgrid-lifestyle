import { describe, expect, it } from "vitest";
import { PAYMONGO_WEBHOOK_EVENTS, paymongoWebhookPath } from "./paymongo";
import {
  DEFAULT_PAYMONGO_SETTINGS,
  isPayMongoCheckoutAvailable,
  validateRetailPaymentMethod,
} from "@/src/types/payments";

describe("paymongo client helpers", () => {
  it("exposes webhook events needed for QR Ph hosted checkout", () => {
    expect(PAYMONGO_WEBHOOK_EVENTS).toContain("checkout_session.payment.paid");
    expect(PAYMONGO_WEBHOOK_EVENTS).toContain("payment.failed");
  });

  it("builds edge webhook path from supabase url when present", () => {
    const path = paymongoWebhookPath();
    expect(path.includes("paymongo-webhook")).toBe(true);
  });

  it("requires enabled + public key for checkout availability", () => {
    expect(isPayMongoCheckoutAvailable("paymongo", DEFAULT_PAYMONGO_SETTINGS)).toBe(false);
    expect(
      isPayMongoCheckoutAvailable("paymongo", {
        ...DEFAULT_PAYMONGO_SETTINGS,
        enabled: true,
        publicKey: "pk_test_TkZpXedDu23iTq6uKbxu3Piw",
      }),
    ).toBe(true);
  });

  it("validates paymongo method against settings", () => {
    expect(
      validateRetailPaymentMethod("paymongo", {
        cod: { enabled: false, checkoutDescription: "" },
        paymongo: DEFAULT_PAYMONGO_SETTINGS,
      }),
    ).toMatch(/not available|GCash/i);

    expect(
      validateRetailPaymentMethod("paymongo", {
        cod: { enabled: false, checkoutDescription: "" },
        paymongo: {
          ...DEFAULT_PAYMONGO_SETTINGS,
          enabled: true,
          publicKey: "pk_test_abc",
        },
      }),
    ).toBeNull();
  });
});
