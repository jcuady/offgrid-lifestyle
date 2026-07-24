import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  canContinuePasswordRecovery,
  clearPasswordRecoveryIntent,
  hasPasswordRecoveryIntent,
  markPasswordRecoveryIntent,
  mustClearSessionBeforeRecovery,
  passwordResetRedirectUrl,
  shouldSkipPostLoginSideEffects,
} from "./passwordReset";

describe("passwordResetRedirectUrl", () => {
  it("uses customer reset path by default", () => {
    expect(passwordResetRedirectUrl("https://www.oglifestyleph.com")).toBe(
      "https://www.oglifestyleph.com/account/reset-password",
    );
  });

  it("tags portal resets so post-reset routing returns to portal login", () => {
    expect(passwordResetRedirectUrl("http://localhost:5173", "portal")).toBe(
      "http://localhost:5173/account/reset-password?portal=1",
    );
  });

  it("strips trailing slash from origin", () => {
    expect(passwordResetRedirectUrl("https://example.com/", "customer")).toBe(
      "https://example.com/account/reset-password",
    );
  });
});

describe("password recovery intent flag", () => {
  const store = new Map();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => { store.set(k, v); },
        removeItem: (k) => { store.delete(k); },
      },
      location: { pathname: "/", hash: "", search: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("survives after URL tokens are cleared (regression: false expired on reset page)", () => {
    expect(canContinuePasswordRecovery()).toBe(false);
    markPasswordRecoveryIntent();
    expect(hasPasswordRecoveryIntent()).toBe(true);
    expect(canContinuePasswordRecovery()).toBe(true);
    clearPasswordRecoveryIntent();
    expect(canContinuePasswordRecovery()).toBe(false);
  });

  it("skips post-login side effects while recovery intent is set", () => {
    expect(shouldSkipPostLoginSideEffects()).toBe(false);
    markPasswordRecoveryIntent();
    expect(shouldSkipPostLoginSideEffects()).toBe(true);
  });
});

describe("mustClearSessionBeforeRecovery", () => {
  it("is true for recovery hash so stale signed-in sessions are dropped", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/",
        hash: "#access_token=tok&type=recovery",
        search: "",
      }),
    ).toBe(true);
  });

  it("is true for PKCE reset path", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/account/reset-password",
        hash: "",
        search: "?code=abc",
      }),
    ).toBe(true);
  });

  it("is false for normal homepage loads (regression: would sign everyone out)", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/",
        hash: "",
        search: "",
      }),
    ).toBe(false);
  });

  it("is false for signup confirm (must not clear session)", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/",
        hash: "#access_token=tok&type=signup",
        search: "",
      }),
    ).toBe(false);
  });
});
