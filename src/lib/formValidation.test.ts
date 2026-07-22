import { describe, expect, it } from "vitest";
import { shouldShowEmptyCartGate } from "./checkoutUi";
import {
  formatPhilippinePhoneInput,
  isValidPhilippineMobile,
  sanitizeShippingInfo,
  validateShippingInfoFields,
} from "./formValidation";
import { EMPTY_SHIPPING_INFO } from "@/src/types/commerce";

describe("isValidPhilippineMobile", () => {
  it("accepts formatted +63 9XX mobile", () => {
    expect(isValidPhilippineMobile("+63 917 123 4567")).toBe(true);
    expect(isValidPhilippineMobile("09171234567")).toBe(true);
  });

  it("rejects overlong digit dumps (checkout bug regression)", () => {
    expect(isValidPhilippineMobile("09432423432432")).toBe(false);
    expect(isValidPhilippineMobile("1234567890")).toBe(false);
    expect(isValidPhilippineMobile("0917")).toBe(false);
  });
});

describe("formatPhilippinePhoneInput", () => {
  it("caps at 10 local digits and formats", () => {
    expect(formatPhilippinePhoneInput("09432423432432")).toBe("+63 943 242 3432");
    expect(formatPhilippinePhoneInput("9171234567")).toBe("+63 917 123 4567");
  });
});

describe("validateShippingInfoFields phone", () => {
  it("errors on short numbers after sanitize", () => {
    expect(
      validateShippingInfoFields({
        ...EMPTY_SHIPPING_INFO,
        fullName: "Joax",
        email: "a@b.co",
        phone: "0917",
      }).phone,
    ).toMatch(/mobile/i);
  });

  it("normalizes long dumps to 10 digits via sanitize", () => {
    const sanitized = sanitizeShippingInfo({
      ...EMPTY_SHIPPING_INFO,
      phone: "09432423432432",
    });
    expect(sanitized.phone).toBe("+63 943 242 3432");
    expect(isValidPhilippineMobile(sanitized.phone)).toBe(true);
  });
});

describe("shouldShowEmptyCartGate", () => {
  it("hides empty gate while PayMongo order is in flight (regression)", () => {
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 2,
        orderId: "OG-2026-1",
        placingOrder: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 2,
        orderId: null,
        placingOrder: true,
      }),
    ).toBe(false);
  });

  it("shows empty gate only for true empty checkout", () => {
    expect(
      shouldShowEmptyCartGate({
        cartLength: 0,
        checkoutStep: 1,
        orderId: null,
        placingOrder: false,
      }),
    ).toBe(true);
  });
});
