import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  canContinuePasswordRecovery,
  clearPasswordRecoveryIntent,
  ensureRecoverySession,
  hasPasswordRecoveryIntent,
  markPasswordRecoveryIntent,
  mustClearSessionBeforeRecovery,
  parseImplicitAuthHash,
  passwordResetRedirectUrl,
  readStashedRecoveryTokens,
  shouldSkipPostLoginSideEffects,
  stashRecoveryTokensFromUrl,
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

describe("parseImplicitAuthHash", () => {
  it("extracts access and refresh tokens from recovery hash", () => {
    expect(
      parseImplicitAuthHash(
        "#access_token=aaa&refresh_token=bbb&type=recovery&expires_in=3600&token_type=bearer",
      ),
    ).toEqual({ access_token: "aaa", refresh_token: "bbb", type: "recovery" });
  });

  it("returns null when tokens missing", () => {
    expect(parseImplicitAuthHash("#type=recovery")).toBeNull();
  });
});

describe("password recovery stash + intent", () => {
  const store = new Map();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => { store.set(k, v); },
        removeItem: (k) => { store.delete(k); },
      },
      location: {
        pathname: "/account/reset-password",
        hash: "#access_token=tok&refresh_token=ref&type=recovery",
        search: "",
      },
      history: { replaceState: vi.fn(), state: null },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stashes tokens so recovery survives hash clear (regression: race with detectSessionInUrl)", () => {
    const tokens = stashRecoveryTokensFromUrl();
    expect(tokens?.access_token).toBe("tok");
    expect(readStashedRecoveryTokens()?.refresh_token).toBe("ref");
    expect(hasPasswordRecoveryIntent()).toBe(true);
    // Simulate Supabase clearing the hash
    window.location.hash = "";
    expect(canContinuePasswordRecovery()).toBe(true);
    expect(readStashedRecoveryTokens()?.access_token).toBe("tok");
  });

  it("ensureRecoverySession falls back to stashed tokens via setSession", async () => {
    stashRecoveryTokensFromUrl();
    window.location.hash = "";
    const setSession = vi.fn().mockResolvedValue({ data: { session: {} }, error: null });
    const getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const ok = await ensureRecoverySession({ auth: { getSession, setSession } });
    expect(ok).toBe(true);
    expect(setSession).toHaveBeenCalledWith({ access_token: "tok", refresh_token: "ref" });
  });

  it("survives after URL tokens are cleared (regression: false expired on reset page)", () => {
    clearPasswordRecoveryIntent();
    window.location.hash = "";
    expect(canContinuePasswordRecovery()).toBe(false);
    markPasswordRecoveryIntent();
    expect(canContinuePasswordRecovery()).toBe(true);
    clearPasswordRecoveryIntent();
    expect(canContinuePasswordRecovery()).toBe(false);
  });

  it("skips post-login side effects while recovery intent is set", () => {
    clearPasswordRecoveryIntent();
    window.location.hash = "";
    expect(shouldSkipPostLoginSideEffects()).toBe(false);
    markPasswordRecoveryIntent();
    expect(shouldSkipPostLoginSideEffects()).toBe(true);
  });
});

describe("mustClearSessionBeforeRecovery / isRecoveryAuthBootstrap", () => {
  it("is true for recovery hash", () => {
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

  it("is false for normal homepage loads", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/",
        hash: "",
        search: "",
      }),
    ).toBe(false);
  });

  it("is false for signup confirm", () => {
    expect(
      mustClearSessionBeforeRecovery({
        pathname: "/",
        hash: "#access_token=tok&type=signup",
        search: "",
      }),
    ).toBe(false);
  });
});
