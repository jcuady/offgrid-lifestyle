import { describe, expect, it } from "vitest";
import { decideOrderPaymentAccess, GUEST_ORDER_ACCESS_WINDOW_MS } from "./orderPaymentAccess";

describe("decideOrderPaymentAccess", () => {
  const base = {
    orderCustomerId: "209be20c-331b-44a3-add4-598615802fa7",
    orderEmail: "jcuady@gmail.com",
    orderAgeMs: 60_000,
  };

  it("allows portal owner when portal id matches order.customer_id (not auth.users id)", () => {
    // Regression: comparing auth.uid to customer_id returned 403 "You do not have access".
    expect(
      decideOrderPaymentAccess({
        ...base,
        authUserId: "62bbccee-61b4-4527-87bb-3c8848ed687f",
        authEmail: "jcuady@gmail.com",
        portalUserId: "209be20c-331b-44a3-add4-598615802fa7",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects when auth id equals customer_id but portal id does not (wrong comparison shape)", () => {
    // auth.users.id accidentally equal to something else shouldn't grant via portal mismatch alone
    // without email — covered by email match below; this asserts portal mismatch alone is not enough
    // if emails also mismatch:
    expect(
      decideOrderPaymentAccess({
        ...base,
        orderEmail: "other@offgrid.test",
        authUserId: "62bbccee-61b4-4527-87bb-3c8848ed687f",
        authEmail: "jcuady@gmail.com",
        portalUserId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      }).ok,
    ).toBe(false);
  });

  it("allows authenticated buyer whose email matches the order", () => {
    expect(
      decideOrderPaymentAccess({
        ...base,
        authUserId: "62bbccee-61b4-4527-87bb-3c8848ed687f",
        authEmail: "jcuady@gmail.com",
        portalUserId: null,
      }),
    ).toEqual({ ok: true });
  });

  it("allows guest claim within window when order has no customer_id", () => {
    expect(
      decideOrderPaymentAccess({
        orderCustomerId: null,
        orderEmail: "guest@offgrid.test",
        claimEmail: "guest@offgrid.test",
        orderAgeMs: 1000,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects expired guest claim", () => {
    const result = decideOrderPaymentAccess({
      orderCustomerId: null,
      orderEmail: "guest@offgrid.test",
      claimEmail: "guest@offgrid.test",
      orderAgeMs: GUEST_ORDER_ACCESS_WINDOW_MS + 1,
    });
    expect(result).toEqual({
      ok: false,
      status: 403,
      error: "Guest checkout window expired. Sign in to continue.",
    });
  });

  it("allows admin and staff", () => {
    expect(decideOrderPaymentAccess({ ...base, portalRole: "admin" })).toEqual({ ok: true });
    expect(decideOrderPaymentAccess({ ...base, portalRole: "staff" })).toEqual({ ok: true });
  });
});
