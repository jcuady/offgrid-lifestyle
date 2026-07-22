import { describe, expect, it } from "vitest";
import {
  AUTH_ACCOUNT_EXISTS,
  isDuplicateSignUpUser,
  isEmailConfirmationPending,
  mapSignInErrorMessage,
  mapSignUpErrorMessage,
} from "./authErrors";

describe("isDuplicateSignUpUser", () => {
  it("treats empty identities as an existing account (Supabase anti-enumeration shape)", () => {
    expect(isDuplicateSignUpUser({ identities: [] })).toBe(true);
  });

  it("does not treat a real new identity as a duplicate", () => {
    expect(isDuplicateSignUpUser({ identities: [{ identity_id: "1", provider: "email" }] })).toBe(false);
  });

  it("does not treat missing identities as a duplicate", () => {
    expect(isDuplicateSignUpUser({ identities: undefined })).toBe(false);
    expect(isDuplicateSignUpUser(null)).toBe(false);
  });
});

describe("isEmailConfirmationPending", () => {
  it("requires a user, no session, and non-empty identities", () => {
    expect(
      isEmailConfirmationPending({
        user: { identities: [{ provider: "email" }] },
        session: null,
      }),
    ).toBe(true);
  });

  it("is false when identities are empty (duplicate signup obfuscation)", () => {
    expect(isEmailConfirmationPending({ user: { identities: [] }, session: null })).toBe(false);
  });

  it("is false when a session already exists", () => {
    expect(
      isEmailConfirmationPending({
        user: { identities: [{ provider: "email" }] },
        session: { access_token: "x" },
      }),
    ).toBe(false);
  });
});

describe("mapSignInErrorMessage", () => {
  it("maps invalid credentials clearly", () => {
    expect(mapSignInErrorMessage("Invalid login credentials")).toMatch(/Incorrect email or password/i);
  });

  it("maps unconfirmed email", () => {
    expect(mapSignInErrorMessage("Email not confirmed")).toMatch(/confirm your email/i);
  });
});

describe("mapSignUpErrorMessage", () => {
  it("maps already-registered copy to the shared account-exists message", () => {
    expect(mapSignUpErrorMessage("User already registered")).toBe(AUTH_ACCOUNT_EXISTS);
  });
});
