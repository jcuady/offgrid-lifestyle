import { normalizeOrderId } from "@/src/lib/orderId";
import { canTransitionStatus } from "@/src/lib/operationsOrderFlow";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(normalizeOrderId("OG-2026-3317") === "OG-2026-3317", "plain id");
assert(normalizeOrderId("OG-2026-3317:1") === "OG-2026-3317", "console :line");
assert(normalizeOrderId("OG-2026-3317:full") === "OG-2026-3317", "paymongo kind");
assert(normalizeOrderId("CO-1:deposit") === "CO-1", "custom ref");
assert(normalizeOrderId("") === "", "empty");

assert(!canTransitionStatus("delivered", "shipped"), "staff flow blocks delivered→shipped");
assert(canTransitionStatus("delivered", "shipped", { unrestricted: true }), "admin may set any");
assert(canTransitionStatus("confirmed", "shipped", { unrestricted: true }), "admin skip steps");
assert(canTransitionStatus("pending_deposit", "confirmed"), "normal forward still ok");

console.log("orderId + canTransitionStatus selfcheck ok");
