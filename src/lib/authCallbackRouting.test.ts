import { describe, expect, it } from "vitest";
import {
  authCallbackRedirectPath,
  classifyAuthCallback,
  isPasswordRecoveryCallback,
} from "./authCallbackRouting";

describe("classifyAuthCallback", () => {
  it("treats type=recovery as recovery (never signup)", () => {
    expect(
      classifyAuthCallback({
        pathname: "/",
        hash: "#access_token=tok&type=recovery",
        search: "",
      }),
    ).toBe("recovery");
  });

  it("treats type=signup as signup confirm (regression: was wrongly sent to reset-password)", () => {
    expect(
      classifyAuthCallback({
        pathname: "/",
        hash: "#access_token=tok&type=signup",
        search: "",
      }),
    ).toBe("signup_confirm");
  });

  it("treats type=email as signup confirm", () => {
    expect(
      classifyAuthCallback({
        pathname: "/account/sign-in",
        hash: "#access_token=tok&expires_in=3600&type=email",
        search: "?confirmed=1",
      }),
    ).toBe("signup_confirm");
  });

  it("treats type=email_change as email change (not signup/recovery)", () => {
    expect(
      classifyAuthCallback({
        pathname: "/",
        hash: "#access_token=tok&type=email_change",
        search: "",
      }),
    ).toBe("email_change");
  });

  it("classifies PKCE on profile as email_change", () => {
    expect(
      classifyAuthCallback({
        pathname: "/account/profile",
        hash: "",
        search: "?code=abc",
      }),
    ).toBe("email_change");
  });

  it("does not treat bare access_token as recovery", () => {
    expect(
      classifyAuthCallback({
        pathname: "/",
        hash: "#access_token=tok&refresh_token=r",
        search: "",
      }),
    ).toBe("session");
    expect(
      isPasswordRecoveryCallback({
        pathname: "/",
        hash: "#access_token=tok",
        search: "",
      }),
    ).toBe(false);
  });

  it("classifies PKCE code on reset path as recovery", () => {
    expect(
      classifyAuthCallback({
        pathname: "/account/reset-password",
        hash: "",
        search: "?code=abc",
      }),
    ).toBe("recovery");
  });

  it("classifies PKCE code on sign-in as signup confirm", () => {
    expect(
      classifyAuthCallback({
        pathname: "/account/sign-in",
        hash: "",
        search: "?confirmed=1&code=abc",
      }),
    ).toBe("signup_confirm");
  });
});

describe("authCallbackRedirectPath", () => {
  it("sends signup hash from / to /account/orders with hash preserved", () => {
    expect(
      authCallbackRedirectPath({
        pathname: "/",
        hash: "#access_token=tok&type=signup",
        search: "",
      }),
    ).toBe("/account/orders#access_token=tok&type=signup");
  });

  it("sends recovery hash from / to /account/reset-password", () => {
    expect(
      authCallbackRedirectPath({
        pathname: "/",
        hash: "#access_token=tok&type=recovery",
        search: "",
      }),
    ).toBe("/account/reset-password#access_token=tok&type=recovery");
  });

  it("does not redirect when already on the correct page", () => {
    expect(
      authCallbackRedirectPath({
        pathname: "/account/orders",
        hash: "#access_token=tok&type=signup",
        search: "",
      }),
    ).toBeNull();
    expect(
      authCallbackRedirectPath({
        pathname: "/account/reset-password",
        hash: "#access_token=tok&type=recovery",
        search: "",
      }),
    ).toBeNull();
  });

  it("moves PKCE signup from sign-in to orders while keeping code", () => {
    expect(
      authCallbackRedirectPath({
        pathname: "/account/sign-in",
        hash: "",
        search: "?confirmed=1&code=pkce",
      }),
    ).toBe("/account/orders?code=pkce");
  });

  it("sends email_change hash from / to /account/profile", () => {
    expect(
      authCallbackRedirectPath({
        pathname: "/",
        hash: "#access_token=tok&type=email_change",
        search: "",
      }),
    ).toBe("/account/profile#access_token=tok&type=email_change");
  });
});
