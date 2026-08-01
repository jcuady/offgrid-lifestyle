import { describe, expect, it } from "vitest";
import { validateEventRegistrationInput } from "@/src/services/eventRegistrationService";

describe("event registration validation", () => {
  const base = {
    eventId: "evt-1",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 917 123 4567",
    skillLevel: "beginner" as const,
  };

  it("accepts a complete signup", () => {
    expect(validateEventRegistrationInput(base)).toBeNull();
  });

  it("rejects missing name and bad email", () => {
    expect(validateEventRegistrationInput({ ...base, name: "A" })).toBe("Enter your full name.");
    expect(validateEventRegistrationInput({ ...base, email: "nope" })).toBe("Enter a valid email address.");
  });
});
