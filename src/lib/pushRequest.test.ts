import { describe, expect, it } from "vitest";
import { buildSendPushHeaders } from "./pushRequest";

describe("pushRequest", () => {
  it("uses session token when signed in", () => {
    const headers = buildSendPushHeaders("user-jwt", "anon-key", false);
    expect(headers.Authorization).toBe("Bearer user-jwt");
    expect(headers.apikey).toBe("anon-key");
  });

  it("uses anon key for guest operational alerts", () => {
    const headers = buildSendPushHeaders(undefined, "anon-key", true);
    expect(headers.Authorization).toBe("Bearer anon-key");
    expect(headers.apikey).toBe("anon-key");
  });

  it("leaves bearer empty when unsigned and not operational", () => {
    const headers = buildSendPushHeaders(undefined, "anon-key", false);
    expect(headers.Authorization).toBe("Bearer ");
    expect(headers.apikey).toBe("anon-key");
  });
});
