import { describe, expect, it } from "vitest";
import { upsertById } from "./orderStoreMerge";

describe("upsertById", () => {
  it("prepends when id is new", () => {
    expect(upsertById([{ id: "a", n: 1 }], { id: "b", n: 2 })).toEqual([
      { id: "b", n: 2 },
      { id: "a", n: 1 },
    ]);
  });

  it("replaces in place when id exists (stale local loses)", () => {
    expect(upsertById([{ id: "a", n: 1 }, { id: "b", n: 0 }], { id: "b", n: 9 })).toEqual([
      { id: "a", n: 1 },
      { id: "b", n: 9 },
    ]);
  });
});
