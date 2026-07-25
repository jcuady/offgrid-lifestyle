import { describe, expect, it } from "vitest";
import {
  emailChangeRedirectPath,
  emailChangeRedirectUrl,
  planEmailChangeSends,
} from "./emailChangeDispatch";

describe("planEmailChangeSends", () => {
  it("sends dual confirms to current + new when secure change tokens exist", () => {
    expect(
      planEmailChangeSends({
        currentEmail: "old@offgrid.test",
        newEmail: "new@offgrid.test",
        tokenHash: "hash-new-inbox",
        token: "otp-old",
        tokenHashNew: "hash-old-inbox",
        tokenNew: "otp-new",
      }),
    ).toEqual([
      { to: "old@offgrid.test", tokenHash: "hash-old-inbox", otp: "otp-old" },
      { to: "new@offgrid.test", tokenHash: "hash-new-inbox", otp: "otp-new" },
    ]);
  });

  it("sends single confirm to the NEW inbox only (regression: was old inbox)", () => {
    expect(
      planEmailChangeSends({
        currentEmail: "old@offgrid.test",
        newEmail: "new@offgrid.test",
        tokenHash: "hash-only",
        token: "otp",
      }),
    ).toEqual([{ to: "new@offgrid.test", tokenHash: "hash-only", otp: "otp" }]);
  });
});

describe("emailChangeRedirectPath", () => {
  it("routes each role to the page that hosts change-email UI", () => {
    expect(emailChangeRedirectPath("customer")).toBe("/account/profile");
    expect(emailChangeRedirectPath("admin")).toBe("/portal/admin/settings");
    expect(emailChangeRedirectPath("staff")).toBe("/portal/staff");
    expect(emailChangeRedirectUrl("https://www.oglifestyleph.com/", "customer")).toBe(
      "https://www.oglifestyleph.com/account/profile",
    );
  });
});
