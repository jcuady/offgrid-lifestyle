import { describe, expect, it } from "vitest";
import { validateChangeEmailInput, validateChangePasswordInput } from "./accountCredentials";

describe("validateChangeEmailInput", () => {
  it("accepts a different matching email", () => {
    expect(
      validateChangeEmailInput({
        currentEmail: "admin@offgrid.test",
        newEmail: "admin.new@offgrid.test",
        confirmEmail: "admin.new@offgrid.test",
      }),
    ).toBeNull();
  });

  it("rejects same email, mismatch, and invalid format", () => {
    expect(
      validateChangeEmailInput({
        currentEmail: "admin@offgrid.test",
        newEmail: "admin@offgrid.test",
        confirmEmail: "admin@offgrid.test",
      }),
    ).toMatch(/different/i);
    expect(
      validateChangeEmailInput({
        currentEmail: "admin@offgrid.test",
        newEmail: "a@b.com",
        confirmEmail: "c@d.com",
      }),
    ).toMatch(/match/i);
    expect(
      validateChangeEmailInput({
        currentEmail: "admin@offgrid.test",
        newEmail: "not-an-email",
        confirmEmail: "not-an-email",
      }),
    ).toMatch(/valid/i);
  });
});

describe("validateChangePasswordInput", () => {
  it("accepts a valid password change", () => {
    expect(
      validateChangePasswordInput({
        currentPassword: "offgrid123",
        newPassword: "offgrid456!",
        confirmPassword: "offgrid456!",
      }),
    ).toBeNull();
  });

  it("rejects short, mismatched, and unchanged passwords", () => {
    expect(
      validateChangePasswordInput({
        currentPassword: "offgrid123",
        newPassword: "short",
        confirmPassword: "short",
      }),
    ).toMatch(/8/i);
    expect(
      validateChangePasswordInput({
        currentPassword: "offgrid123",
        newPassword: "offgrid456!",
        confirmPassword: "other",
      }),
    ).toMatch(/match/i);
    expect(
      validateChangePasswordInput({
        currentPassword: "offgrid123",
        newPassword: "offgrid123",
        confirmPassword: "offgrid123",
      }),
    ).toMatch(/different/i);
  });
});
