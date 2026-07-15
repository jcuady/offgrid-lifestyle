import { describe, expect, it } from "vitest";
import { passwordResetRedirectUrl } from "./passwordReset";

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
