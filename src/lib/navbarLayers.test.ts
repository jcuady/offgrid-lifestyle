import { describe, expect, it } from "vitest";
import {
  canClickAccountMenuThroughScrim,
  CUSTOMER_ACCOUNT_MENU_PATHS,
  NAVBAR_HEADER_Z,
  NAVBAR_SCRIM_Z,
} from "./navbarLayers";

describe("navbarLayers", () => {
  it("keeps mobile scrim below header so account menu taps navigate (regression)", () => {
    expect(canClickAccountMenuThroughScrim()).toBe(true);
    expect(NAVBAR_SCRIM_Z).toBeLessThan(NAVBAR_HEADER_Z);
    // Broken stacking that ate Profile clicks on mobile:
    expect(canClickAccountMenuThroughScrim(55, 50)).toBe(false);
  });

  it("routes header Profile / Orders to account pages", () => {
    expect(CUSTOMER_ACCOUNT_MENU_PATHS.profile).toBe("/account/profile");
    expect(CUSTOMER_ACCOUNT_MENU_PATHS.orders).toBe("/account/orders");
  });
});
