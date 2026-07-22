import { describe, expect, it } from "vitest";
import { shouldShowEmptyCartGate } from "./checkoutUi";

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
