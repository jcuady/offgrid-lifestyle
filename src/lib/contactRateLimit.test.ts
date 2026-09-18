import { describe, expect, it } from "vitest";
import {
  CONTACT_RATE_LIMITS,
  contactRateBucketKey,
  isOverContactRateLimit,
} from "./contactRateLimit";

describe("contactRateLimit", () => {
  it("blocks at the configured hourly ceiling", () => {
    expect(isOverContactRateLimit(CONTACT_RATE_LIMITS.perIpPerHour - 1, CONTACT_RATE_LIMITS.perIpPerHour)).toBe(
      false,
    );
    expect(isOverContactRateLimit(CONTACT_RATE_LIMITS.perIpPerHour, CONTACT_RATE_LIMITS.perIpPerHour)).toBe(true);
  });

  it("normalizes email bucket keys", () => {
    expect(contactRateBucketKey("email", "  Test@Example.COM ")).toBe("email:test@example.com");
    expect(contactRateBucketKey("ip", "abc123")).toBe("ip:abc123");
  });
});
