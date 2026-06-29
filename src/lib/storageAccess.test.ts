import { describe, expect, it } from "vitest";
import {
  parseStorageReference,
  storagePathFromReference,
  toStorageReference,
} from "./storageAccess";

describe("storageAccess", () => {
  it("round-trips bucket references", () => {
    const ref = toStorageReference("payment-proofs", "order-1/proof.png");
    expect(ref).toBe("payment-proofs:order-1/proof.png");
    expect(parseStorageReference(ref)).toEqual({
      bucket: "payment-proofs",
      path: "order-1/proof.png",
    });
  });

  it("parses public storage URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/payment-proofs/order-1/proof.png";
    expect(storagePathFromReference(url, "payment-proofs")).toBe("order-1/proof.png");
  });

  it("parses signed storage URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/sign/payment-proofs/order-1/proof.png?token=abc";
    expect(storagePathFromReference(url, "payment-proofs")).toBe("order-1/proof.png");
  });

  it("returns relative paths unchanged", () => {
    expect(storagePathFromReference("order-1/proof.png", "payment-proofs")).toBe(
      "order-1/proof.png",
    );
  });

  it("rejects mismatched bucket in URL", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/other-bucket/order-1/proof.png";
    expect(storagePathFromReference(url, "payment-proofs")).toBeNull();
  });
});
