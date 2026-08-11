import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STATUS_FLOW } from "./orderLifecycle";
import type { OrderStatus } from "@/src/types/commerce";

/**
 * Seam: STATUS_FLOW is the lifecycle interface. The SQL trigger adapter
 * must encode the same edges or staff/customer paths diverge.
 */
function parseSqlEdges(sql: string): Record<string, string[]> {
  const edges: Record<string, string[]> = {};
  const inClause =
    /OLD\.status = '([a-z_]+)' AND NEW\.status IN \(([^)]+)\)/g;
  const eqClause = /OLD\.status = '([a-z_]+)' AND NEW\.status = '([a-z_]+)'/g;
  for (const match of sql.matchAll(inClause)) {
    const from = match[1];
    const tos = [...match[2].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    edges[from] = tos.filter((to) => to !== from);
  }
  for (const match of sql.matchAll(eqClause)) {
    const from = match[1];
    const to = match[2];
    if (from === to) continue;
    edges[from] = [...(edges[from] ?? []), to];
  }
  return edges;
}

describe("STATUS_FLOW SQL adapter parity", () => {
  const sql = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260803120000_order_lifecycle_review_revision.sql",
    ),
    "utf8",
  );
  const sqlEdges = parseSqlEdges(sql);

  it("encodes every STATUS_FLOW edge in og_validate_order_status_transition", () => {
    for (const [from, tos] of Object.entries(STATUS_FLOW) as [OrderStatus, OrderStatus[]][]) {
      expect(new Set(sqlEdges[from] ?? []), from).toEqual(new Set(tos));
    }
  });
});
