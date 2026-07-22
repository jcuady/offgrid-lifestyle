import { maskPaymongoPublicKey, paymongoKeyConfigured } from "@/src/lib/paymongoKeyDisplay";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(maskPaymongoPublicKey("") === "", "empty");
assert(!maskPaymongoPublicKey("pk_test_abcdefghijklmnop").includes("abcdefgh"), "hides body");
assert(maskPaymongoPublicKey("pk_test_abcdefghijklmnop").endsWith("mnop"), "keeps last4");
assert(maskPaymongoPublicKey("pk_test_abcdefghijklmnop").startsWith("pk_test_"), "keeps prefix");
assert(maskPaymongoPublicKey("pk_live_ABCDEFGHijkl").startsWith("pk_live_"), "live prefix");
assert(paymongoKeyConfigured("pk_test_abc") === true, "configured test");
assert(paymongoKeyConfigured("sk_test_abc") === false, "secret not public");
assert(paymongoKeyConfigured("") === false, "empty not configured");

console.log("paymongoKeyDisplay selfcheck ok");
