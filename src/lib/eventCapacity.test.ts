import { describe, expect, it } from "vitest";
import { isEventRegistrationFull } from "./eventCapacity";

describe("isEventRegistrationFull", () => {
  it("is full when registered reaches capacity", () => {
    expect(isEventRegistrationFull({ capacity: 10, registered: 10 })).toBe(true);
    expect(isEventRegistrationFull({ capacity: 10, registered: 9 })).toBe(false);
  });

  it("is not full when capacity is unset", () => {
    expect(isEventRegistrationFull({ registered: 99 })).toBe(false);
    expect(isEventRegistrationFull({ capacity: 0, registered: 0 })).toBe(false);
  });
});
