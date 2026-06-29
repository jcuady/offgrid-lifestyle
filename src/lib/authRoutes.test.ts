import { describe, expect, it } from "vitest";
import {
  CUSTOMER_FORGOT_PASSWORD_PATH,
  CUSTOMER_RESET_PASSWORD_PATH,
  CUSTOMER_SIGN_IN_PATH,
  getLoginPathForRole,
  isAuthScreen,
} from "./authRoutes";

describe("authRoutes", () => {
  it("marks customer auth screens", () => {
    expect(isAuthScreen(CUSTOMER_SIGN_IN_PATH)).toBe(true);
    expect(isAuthScreen(CUSTOMER_FORGOT_PASSWORD_PATH)).toBe(true);
    expect(isAuthScreen(CUSTOMER_RESET_PASSWORD_PATH)).toBe(true);
    expect(isAuthScreen("/shop")).toBe(false);
  });

  it("routes portal roles to portal login", () => {
    expect(getLoginPathForRole("customer")).toBe(CUSTOMER_SIGN_IN_PATH);
    expect(getLoginPathForRole("staff")).toBe("/portal/login");
    expect(getLoginPathForRole("admin")).toBe("/portal/login");
  });
});
