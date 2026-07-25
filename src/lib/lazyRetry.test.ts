import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  isDynamicImportChunkError,
  reloadOnceOnChunkError,
  CHUNK_RELOAD_KEY,
} from "./lazyRetry";

describe("isDynamicImportChunkError", () => {
  it("matches Vite/Chrome stale-chunk failures after deploy (regression: blank sign-in)", () => {
    expect(
      isDynamicImportChunkError(
        "Failed to fetch dynamically imported module: https://www.oglifestyleph.com/assets/CustomerSignInPage-ao1_ndwl.js",
      ),
    ).toBe(true);
  });

  it("matches nested profile address chunk miss (regression: mobile profile crash)", () => {
    expect(
      isDynamicImportChunkError(
        "Failed to fetch dynamically imported module: https://www.oglifestyleph.com/assets/PhilippinesAddressFields-Bz7uaySM.js",
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

describe("reloadOnceOnChunkError", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      location: { reload: vi.fn() },
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reloads once on chunk miss then clears the guard", () => {
    const msg =
      "Failed to fetch dynamically imported module: https://www.oglifestyleph.com/assets/PhilippinesAddressFields-Bz7uaySM.js";
    expect(reloadOnceOnChunkError(msg)).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    expect(store.get(CHUNK_RELOAD_KEY)).toBe("1");
    expect(reloadOnceOnChunkError(msg)).toBe(false);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    expect(store.has(CHUNK_RELOAD_KEY)).toBe(false);
  });
});
