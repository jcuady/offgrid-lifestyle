import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  consumeEmailConfirmHandoffTab,
  markEmailConfirmHandoffTab,
} from "./authTabSync";

describe("authTabSync handoff flag", () => {
  const store = new Map<string, string>();
  const fakeStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("sessionStorage", fakeStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks and consumes once (confirm-tab detection)", () => {
    fakeStorage.clear();
    expect(consumeEmailConfirmHandoffTab()).toBe(false);
    markEmailConfirmHandoffTab();
    expect(consumeEmailConfirmHandoffTab()).toBe(true);
    expect(consumeEmailConfirmHandoffTab()).toBe(false);
  });
});
