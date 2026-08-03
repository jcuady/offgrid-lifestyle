import { describe, expect, it } from "vitest";
import {
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
});
