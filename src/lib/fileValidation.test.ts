import { describe, expect, it } from "vitest";
import { validateUploadedFile } from "./fileValidation";

function mockFile(name: string, size: number, type = ""): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("validateUploadedFile", () => {
  it("accepts valid payment proof images", () => {
    const file = mockFile("proof.png", 1024, "image/png");
    expect(validateUploadedFile(file, "imageAsset")).toEqual({ ok: true });
  });

  it("rejects unsupported extensions", () => {
    const file = mockFile("proof.exe", 1024);
    expect(validateUploadedFile(file, "imageAsset").ok).toBe(false);
  });

  it("rejects oversized files", () => {
    const file = mockFile("proof.png", 6 * 1024 * 1024, "image/png");
    expect(validateUploadedFile(file, "imageAsset").ok).toBe(false);
  });

  it("rejects empty files", () => {
    const file = mockFile("proof.png", 0, "image/png");
    expect(validateUploadedFile(file, "imageAsset").ok).toBe(false);
  });
});
