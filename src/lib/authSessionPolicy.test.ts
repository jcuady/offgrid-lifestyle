import { describe, expect, it } from "vitest";
import {
  mayRedirectBeforeAuthHydrated,
  maySignOutDuringUrlSessionConsume,
  planAuthBootstrap,
  planAuthEvent,
} from "./authSessionPolicy";

describe("planAuthBootstrap", () => {
  it("never allows signOut during URL session consume (regression: wiped recovery)", () => {
    const plan = planAuthBootstrap({
      pathname: "/account/reset-password",
      hash: "#access_token=tok&refresh_token=ref&type=recovery",
      search: "",
    });
    expect(plan.allowSignOut).toBe(false);
    expect(maySignOutDuringUrlSessionConsume()).toBe(false);
    expect(plan.clearPortalChromeOnly).toBe(true);
    expect(plan.mode).toBe("recovery");
    expect(plan.markRecoveryIntent).toBe(true);
    expect(plan.redirectTo).toBeNull();
  });

  it("routes signup confirm away from recovery and does not clear chrome as recovery", () => {
    const plan = planAuthBootstrap({
      pathname: "/",
      hash: "#access_token=tok&type=signup",
      search: "",
    });
    expect(plan.kind).toBe("signup_confirm");
    expect(plan.mode).toBe("session");
    expect(plan.clearPortalChromeOnly).toBe(false);
    expect(plan.markSignupHandoff).toBe(true);
    expect(plan.redirectTo).toBe("/account/orders#access_token=tok&type=signup");
  });

  it("plans redirect for recovery hash landing on home", () => {
    const plan = planAuthBootstrap({
      pathname: "/",
      hash: "#access_token=tok&type=recovery",
      search: "",
    });
    expect(plan.redirectTo).toBe(
      "/account/reset-password#access_token=tok&type=recovery",
    );
    expect(plan.allowSignOut).toBe(false);
  });

  it("treats normal loads as session mode without recovery flags", () => {
    const plan = planAuthBootstrap({
      pathname: "/shop",
      hash: "",
      search: "",
    });
    expect(plan.kind).toBe("none");
    expect(plan.mode).toBe("session");
    expect(plan.markRecoveryIntent).toBe(false);
    expect(plan.clearPortalChromeOnly).toBe(false);
    expect(plan.allowSignOut).toBe(false);
  });
});

describe("planAuthEvent", () => {
  it("skips resolve + side effects while recovery is active on SIGNED_IN", () => {
    expect(
      planAuthEvent("SIGNED_IN", {
        recoveryActive: true,
        previousPortalUserId: null,
        nextPortalUserId: "u1",
      }),
    ).toEqual({
      markRecoveryIntent: false,
      clearUserAndShipping: false,
      resolvePortalUser: false,
      runPostLoginSideEffects: false,
    });
  });

  it("runs side effects only when SIGNED_IN brings a new portal identity", () => {
    expect(
      planAuthEvent("SIGNED_IN", {
        recoveryActive: false,
        previousPortalUserId: null,
        nextPortalUserId: "u1",
      }).runPostLoginSideEffects,
    ).toBe(true);

    // Same user (e.g. verifyPassword re-auth) — no push/shipping churn.
    expect(
      planAuthEvent("SIGNED_IN", {
        recoveryActive: false,
        previousPortalUserId: "u1",
        nextPortalUserId: "u1",
      }).runPostLoginSideEffects,
    ).toBe(false);
  });

  it("refreshes portal user on TOKEN_REFRESHED without side effects", () => {
    const plan = planAuthEvent("TOKEN_REFRESHED", {
      recoveryActive: false,
      previousPortalUserId: "u1",
      nextPortalUserId: "u1",
    });
    expect(plan.resolvePortalUser).toBe(true);
    expect(plan.runPostLoginSideEffects).toBe(false);
  });

  it("marks recovery intent on PASSWORD_RECOVERY", () => {
    expect(
      planAuthEvent("PASSWORD_RECOVERY", {
        recoveryActive: false,
        previousPortalUserId: null,
        nextPortalUserId: null,
      }).markRecoveryIntent,
    ).toBe(true);
  });

  it("clears user and shipping on SIGNED_OUT", () => {
    expect(
      planAuthEvent("SIGNED_OUT", {
        recoveryActive: false,
        previousPortalUserId: "u1",
        nextPortalUserId: null,
      }).clearUserAndShipping,
    ).toBe(true);
  });
});

describe("mayRedirectBeforeAuthHydrated", () => {
  it("blocks portal index bounce until hydrate finishes", () => {
    expect(mayRedirectBeforeAuthHydrated(false)).toBe(false);
    expect(mayRedirectBeforeAuthHydrated(true)).toBe(true);
  });
});
