import { describe, expect, it } from "vitest";
import {
  cardsInColumn,
  moveCardInBoard,
  validatePlanCardInput,
  type PlanCard,
} from "./planBoard";

function card(partial: Partial<PlanCard> & Pick<PlanCard, "id" | "status" | "sortOrder">): PlanCard {
  return {
    title: "Task",
    label: "",
    dueDate: null,
    notes: "",
    createdBy: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("moveCardInBoard", () => {
  it("moves a card across columns and renumbers sortOrder", () => {
    const cards = [
      card({ id: "a", status: "upcoming", sortOrder: 0, title: "A" }),
      card({ id: "b", status: "upcoming", sortOrder: 1, title: "B" }),
      card({ id: "c", status: "in_progress", sortOrder: 0, title: "C" }),
    ];
    const next = moveCardInBoard(cards, "b", "in_progress", 0);
    expect(cardsInColumn(next, "upcoming").map((x) => x.id)).toEqual(["a"]);
    expect(cardsInColumn(next, "in_progress").map((x) => x.id)).toEqual(["b", "c"]);
    expect(cardsInColumn(next, "in_progress").map((x) => x.sortOrder)).toEqual([0, 1]);
  });
});

describe("validatePlanCardInput", () => {
  it("requires a non-empty title", () => {
    expect(validatePlanCardInput({ title: "  " })).toBe("Title is required.");
    expect(validatePlanCardInput({ title: "Ship launch" })).toBeNull();
  });
});
