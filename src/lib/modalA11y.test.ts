import { describe, expect, it, vi } from "vitest";
import { FOCUSABLE_SELECTOR, handleDialogTabTrap } from "./modalA11y";

describe("modalA11y", () => {
  it("exports a focusable selector covering interactive controls", () => {
    expect(FOCUSABLE_SELECTOR).toContain("button:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain("input:not([disabled])");
  });

  it("ignores non-Tab keys", () => {
    const event = {
      key: "Escape",
      preventDefault: vi.fn(),
      shiftKey: false,
    } as unknown as KeyboardEvent;
    const container = {
      querySelectorAll: vi.fn(() => []),
    } as unknown as HTMLElement;

    handleDialogTabTrap(event, container);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(container.querySelectorAll).not.toHaveBeenCalled();
  });
});
