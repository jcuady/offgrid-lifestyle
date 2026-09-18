import { describe, expect, it } from "vitest";
import { pendingDesignKey } from "./customOrderFiles";

describe("pendingDesignKey", () => {
  it("uses a stable unique id when provided", () => {
    expect(pendingDesignKey("abc")).toBe("pending:design:abc");
  });

  it("does not collide across sequential calls", () => {
    const a = pendingDesignKey();
    const b = pendingDesignKey();
    expect(a).not.toBe(b);
    expect(a.startsWith("pending:design:")).toBe(true);
    expect(b.startsWith("pending:design:")).toBe(true);
  });
});
