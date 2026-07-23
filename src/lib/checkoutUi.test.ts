import { describe, expect, it } from "vitest";
import {
  checkoutCartItemLabel,
  checkoutCartLineCount,
  shouldShowEmptyCartGate,
} from "./checkoutUi";

describe("shouldShowEmptyCartGate", () => {
  it("shows gate only when cart is empty before confirmation", () => {
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 1,
        orderId: null,
        placingOrder: false,
      }),
    ).toBe(true);
  });

  it("hides gate while placing an order or after an order id exists", () => {
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 1,
        orderId: null,
        placingOrder: true,
      }),
    ).toBe(false);
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 2,
        orderId: "OG-1",
        placingOrder: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 3,
        orderId: null,
        placingOrder: false,
      }),
    ).toBe(false);
  });
});

describe("checkoutCartItemLabel", () => {
  it("pluralizes item counts for the mobile summary", () => {
    expect(checkoutCartItemLabel(0)).toBe("0 items");
    expect(checkoutCartItemLabel(1)).toBe("1 item");
    expect(checkoutCartItemLabel(3)).toBe("3 items");
  });
});

describe("checkoutCartLineCount", () => {
  it("sums quantities across cart lines", () => {
    expect(checkoutCartLineCount([{ quantity: 1 }, { quantity: 2 }])).toBe(3);
    expect(checkoutCartLineCount([])).toBe(0);
  });
});
