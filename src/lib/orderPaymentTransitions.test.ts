import { describe, expect, it } from "vitest";
import {
  amountsMatchCentavos,
  paymongoReturnUi,
  resolvePaidOrderUpdate,
  resolvePaymentKindFromSession,
  type PaymentKind,
} from "./orderPaymentTransitions";

describe("resolvePaidOrderUpdate", () => {
  it("marks retail PayMongo payment fully paid and confirms the order", () => {
    expect(
      resolvePaidOrderUpdate({
        orderType: "retail",
        paymentKind: "full",
        currentStatus: "pending_deposit",
        currentPaymentStatus: "unpaid",
      }),
    ).toEqual({ paymentStatus: "fully_paid", status: "confirmed" });
  });

  it("marks custom deposit paid and confirms from pending_deposit", () => {
    expect(
      resolvePaidOrderUpdate({
        orderType: "custom",
        paymentKind: "deposit",
        currentStatus: "pending_deposit",
        currentPaymentStatus: "unpaid",
      }),
    ).toEqual({ paymentStatus: "deposit_paid", status: "confirmed" });
  });

  it("marks custom balance fully paid without regressing fulfillment status", () => {
    expect(
      resolvePaidOrderUpdate({
        orderType: "custom",
        paymentKind: "balance",
        currentStatus: "in_production",
        currentPaymentStatus: "deposit_paid",
      }),
    ).toEqual({ paymentStatus: "fully_paid", status: "in_production" });
  });

  it("treats custom full payment as fully paid + confirmed", () => {
    const kind: PaymentKind = "full";
    expect(
      resolvePaidOrderUpdate({
        orderType: "custom",
        paymentKind: kind,
        currentStatus: "draft",
        currentPaymentStatus: "unpaid",
      }),
    ).toEqual({ paymentStatus: "fully_paid", status: "confirmed" });
  });
});

describe("resolvePaymentKindFromSession", () => {
  it("reads kind from metadata then reference_number", () => {
    expect(
      resolvePaymentKindFromSession({
        metadata: { payment_kind: "deposit" },
        referenceNumber: "CO-1:full",
      }),
    ).toBe("deposit");
    expect(
      resolvePaymentKindFromSession({
        metadata: {},
        referenceNumber: "CO-1:balance",
      }),
    ).toBe("balance");
  });
});

describe("amountsMatchCentavos", () => {
  it("allows 1-centavo tolerance and fails closed when either side missing", () => {
    expect(amountsMatchCentavos(10000, 10000)).toBe(true);
    expect(amountsMatchCentavos(10000, 10001)).toBe(true);
    expect(amountsMatchCentavos(10000, 10002)).toBe(false);
    expect(amountsMatchCentavos(null, 10000)).toBe(false);
    expect(amountsMatchCentavos(10000, null)).toBe(false);
  });
});

describe("paymongoReturnUi", () => {
  it("keeps balance retry available after deposit is paid", () => {
    expect(
      paymongoReturnUi({
        mode: "retry",
        paymentStatus: "deposit_paid",
        paid: true,
        fullyPaid: false,
      }),
    ).toMatchObject({
      showSuccess: false,
      showRetry: true,
      depositOnly: true,
      title: "Payment incomplete",
    });
  });

  it("shows deposit success on complete without claiming fully paid", () => {
    expect(
      paymongoReturnUi({
        mode: "complete",
        paymentStatus: "deposit_paid",
        paid: true,
        fullyPaid: false,
      }),
    ).toMatchObject({
      showSuccess: true,
      depositOnly: true,
      title: "Deposit received",
    });
  });

  it("times out waiting on complete after enough polls", () => {
    expect(
      paymongoReturnUi({
        mode: "complete",
        paymentStatus: "unpaid",
        paid: false,
        fullyPaid: false,
        polls: 12,
      }),
    ).toMatchObject({ timedOut: true, showWaiting: true, title: "Still confirming" });
  });
});
