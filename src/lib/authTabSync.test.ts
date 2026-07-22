import { describe, expect, it } from "vitest";
import {
  consumeEmailConfirmHandoffTab,
  markEmailConfirmHandoffTab,
} from "./authTabSync";

describe("authTabSync handoff flag", () => {
  it("marks and consumes once (confirm-tab detection)", () => {
    sessionStorage.clear();
    expect(consumeEmailConfirmHandoffTab()).toBe(false);
    markEmailConfirmHandoffTab();
    expect(consumeEmailConfirmHandoffTab()).toBe(true);
    expect(consumeEmailConfirmHandoffTab()).toBe(false);
  });
});
