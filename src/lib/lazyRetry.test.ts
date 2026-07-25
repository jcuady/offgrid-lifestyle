import { describe, expect, it } from "vitest";
import { isDynamicImportChunkError } from "./lazyRetry";

describe("isDynamicImportChunkError", () => {
  it("matches Vite/Chrome stale-chunk failures after deploy (regression: blank sign-in)", () => {
    expect(
      isDynamicImportChunkError(
        "Failed to fetch dynamically imported module: https://www.oglifestyleph.com/assets/CustomerSignInPage-ao1_ndwl.js",
      ),
    ).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isDynamicImportChunkError("NetworkError when attempting to fetch resource.")).toBe(
      false,
    );
    expect(isDynamicImportChunkError("Cannot read properties of null")).toBe(false);
  });
});
