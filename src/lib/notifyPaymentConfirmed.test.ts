import { describe, expect, it } from "vitest";
import { resolvePaymentPushUserIds } from "@/src/lib/paymentPushRecipients";

/** Mirrors edge notifyPaymentConfirmed recipient merge. */
describe("payment confirmed notify recipients", () => {
  it("includes portal customer_id and email matches without dupes", () => {
    expect(
      resolvePaymentPushUserIds({
        customerId: "cust-1",
        emailMatchedUserIds: ["cust-1", "cust-2"],
      }).sort(),
    ).toEqual(["cust-1", "cust-2"]);
  });

  it("still notifies when only email match exists (guest later signed up)", () => {
    expect(
      resolvePaymentPushUserIds({
        customerId: null,
        emailMatchedUserIds: ["cust-email"],
      }),
    ).toEqual(["cust-email"]);
  });
});
