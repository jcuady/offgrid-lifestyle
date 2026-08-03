import { describe, expect, it } from "vitest";
import {
  customOrderGCashUnavailableHint,
  customOrderPayMongoKind,
  customOrderPaymentCtaLabel,
  isCustomOrderGCashActionAvailable,
  isCustomOrderPayMongoActionAvailable,
  resolveCustomOrderPaymentPhase,
} from "./customOrderPayment";
import { DEFAULT_PAYMONGO_SETTINGS } from "@/src/types/payments";

describe("resolveCustomOrderPaymentPhase", () => {
  it("awaits quote until official total exists", () => {
    expect(
      resolveCustomOrderPaymentPhase({ paymentStatus: "unpaid", officialTotal: null }),
    ).toBe("awaiting_quote");
  });

  it("opens deposit then balance after quote", () => {
    const total = { amount: 10000, currency: "PHP" as const };
    expect(resolveCustomOrderPaymentPhase({ paymentStatus: "unpaid", officialTotal: total })).toBe(
      "pay_deposit",
    );
    expect(
      resolveCustomOrderPaymentPhase({ paymentStatus: "deposit_paid", officialTotal: total }),
    ).toBe("pay_balance");
    expect(
      resolveCustomOrderPaymentPhase({ paymentStatus: "fully_paid", officialTotal: total }),
    ).toBe("settled");
  });
});

describe("custom order payment actions", () => {
  const total = { amount: 10000, currency: "PHP" as const };
  const deposit = { amount: 6000, currency: "PHP" as const };

  it("gates PayMongo on enabled settings + phase", () => {
    expect(customOrderPayMongoKind("pay_deposit")).toBe("deposit");
    expect(
      isCustomOrderPayMongoActionAvailable("pay_deposit", {
        ...DEFAULT_PAYMONGO_SETTINGS,
        enabled: true,
        publicKey: "pk_test_x",
      }),
    ).toBe(true);
    expect(
      isCustomOrderPayMongoActionAvailable("awaiting_quote", {
        ...DEFAULT_PAYMONGO_SETTINGS,
        enabled: true,
        publicKey: "pk_test_x",
      }),
    ).toBe(false);
  });

  it("gates GCash on real QR + amount due", () => {
    expect(
      isCustomOrderGCashActionAvailable("pay_deposit", "https://cdn.example/qr.png", {
        paymentStatus: "unpaid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toBe(true);
    expect(
      isCustomOrderGCashActionAvailable("pay_deposit", "https://placehold.co/qr.png", {
        paymentStatus: "unpaid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toBe(false);
    expect(customOrderPaymentCtaLabel("pay_deposit")).toBe("Pay now");
  });

  it("labels balance CTA and settles refunded", () => {
    expect(customOrderPaymentCtaLabel("pay_balance")).toBe("Pay remaining balance");
    expect(customOrderPaymentCtaLabel("settled")).toBeNull();
    expect(
      resolveCustomOrderPaymentPhase({
        paymentStatus: "refunded",
        officialTotal: total,
      }),
    ).toBe("settled");
  });

  it("does not point at PayMongo when GCash is down and PayMongo is off", () => {
    expect(
      customOrderGCashUnavailableHint({
        paymongoAvailable: false,
        phase: "pay_deposit",
      }),
    ).toMatch(/contact OFFGRID|temporarily unavailable/i);
    expect(
      customOrderGCashUnavailableHint({
        paymongoAvailable: false,
        phase: "pay_deposit",
      }),
    ).not.toMatch(/PayMongo QR Ph above/i);
    expect(
      customOrderGCashUnavailableHint({
        paymongoAvailable: true,
        phase: "pay_deposit",
      }),
    ).toMatch(/Use PayMongo QR Ph above/i);
  });

  it("blocks actions for settled and awaiting_quote phases", () => {
    const on = { ...DEFAULT_PAYMONGO_SETTINGS, enabled: true, publicKey: "pk_test_x" };
    expect(isCustomOrderPayMongoActionAvailable("settled", on)).toBe(false);
    expect(isCustomOrderPayMongoActionAvailable("pay_balance", on)).toBe(true);
    expect(customOrderPayMongoKind("pay_balance")).toBe("balance");
    expect(
      isCustomOrderGCashActionAvailable("settled", "https://cdn.example/qr.png", {
        paymentStatus: "fully_paid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toBe(false);
  });
});
