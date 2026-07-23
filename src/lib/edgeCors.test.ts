import { describe, expect, it } from "vitest";
import { buildEdgeCorsHeaders, DEFAULT_ALLOWED_ORIGINS, dedupePushSubscriptionsByEndpoint } from "@/src/lib/edgeCors";

describe("buildEdgeCorsHeaders", () => {
  it("always allows POST and OPTIONS for browser preflight", () => {
    const headers = buildEdgeCorsHeaders("https://www.oglifestyleph.com");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
  });

  it("bypasses CORS for browser callers with wildcard origin", () => {
    // Auth is enforced inside send-push; browsers must not be blocked by Origin mismatch.
    const headers = buildEdgeCorsHeaders("https://random-preview-abc.vercel.app");
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("still works with no Origin header (server / curl)", () => {
    const headers = buildEdgeCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(headers["Access-Control-Allow-Headers"]).toContain("authorization");
    expect(headers["Access-Control-Allow-Headers"]).toContain("apikey");
  });

  it("keeps allowlist documentation for ops (not used when bypassing)", () => {
    expect(DEFAULT_ALLOWED_ORIGINS).toContain("https://www.oglifestyleph.com");
    expect(DEFAULT_ALLOWED_ORIGINS).toContain("http://localhost:5173");
  });
});

describe("dedupePushSubscriptionsByEndpoint", () => {
  it("keeps one row per endpoint", () => {
    const rows = [
      { id: "1", endpoint: "https://push.example/a", user_id: "u1" },
      { id: "2", endpoint: "https://push.example/a", user_id: "u1" },
      { id: "3", endpoint: "https://push.example/b", user_id: "u2" },
    ];
    expect(dedupePushSubscriptionsByEndpoint(rows)).toEqual([
      { id: "1", endpoint: "https://push.example/a", user_id: "u1" },
      { id: "3", endpoint: "https://push.example/b", user_id: "u2" },
    ]);
  });
});
