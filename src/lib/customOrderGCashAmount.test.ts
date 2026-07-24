import { describe, expect, it } from "vitest";
import { customOrderGCashAmountDue, hasOfficialCustomQuote } from "@/src/lib/portal";

describe("customOrderGCashAmountDue", () => {
  const total = { amount: 10000, currency: "PHP" };
  const deposit = { amount: 6000, currency: "PHP" };

  it("requires an official quote", () => {
    expect(hasOfficialCustomQuote(null)).toBe(false);
    expect(customOrderGCashAmountDue({ paymentStatus: "unpaid", officialTotal: null, officialDeposit: deposit })).toBeNull();
  });

  it("shows deposit while unpaid", () => {
    expect(
      customOrderGCashAmountDue({
        paymentStatus: "unpaid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toEqual({ amount: 6000, currency: "PHP", kind: "deposit" });
  });

  it("shows remaining balance after deposit_paid", () => {
    expect(
      customOrderGCashAmountDue({
        paymentStatus: "deposit_paid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toEqual({ amount: 4000, currency: "PHP", kind: "balance" });
  });

  it("returns null when fully paid or nothing left", () => {
    expect(
      customOrderGCashAmountDue({
        paymentStatus: "fully_paid",
        officialTotal: total,
        officialDeposit: deposit,
      }),
    ).toBeNull();
    expect(
      customOrderGCashAmountDue({
        paymentStatus: "deposit_paid",
        officialTotal: total,
        officialDeposit: total,
      }),
    ).toBeNull();
  });
});
