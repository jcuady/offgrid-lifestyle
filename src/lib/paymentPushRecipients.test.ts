import { describe, expect, it } from "vitest";
import { resolvePaymentPushUserIds } from "./paymentPushRecipients";

describe("resolvePaymentPushUserIds", () => {
  it("uses customer_id when present", () => {
    expect(
      resolvePaymentPushUserIds({
        customerId: "cust-1",
        emailMatchedUserIds: [],
      }),
    ).toEqual(["cust-1"]);
  });

  it("falls back to email-matched portal users for guest checkout", () => {
    expect(
      resolvePaymentPushUserIds({
        customerId: null,
        emailMatchedUserIds: ["cust-email"],
      }),
    ).toEqual(["cust-email"]);
  });

  it("dedupes customer_id and email match", () => {
    expect(
      resolvePaymentPushUserIds({
        customerId: "cust-1",
        emailMatchedUserIds: ["cust-1", "cust-2"],
      }),
    ).toEqual(["cust-1", "cust-2"]);
  });
});
