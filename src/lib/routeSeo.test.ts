import { describe, expect, it } from "vitest";
import { resolveRouteSeo } from "./routeSeo";

describe("resolveRouteSeo", () => {
  it("returns unique titles for public indexable routes", () => {
    const paths = [
      "/",
      "/shop",
      "/og-signatures",
      "/custom",
      "/custom/order",
      "/events",
      "/testimonials",
      "/about",
      "/contact",
    ];
    const titles = paths.map((path) => resolveRouteSeo(path)?.title).filter(Boolean);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("noindexes portal and account areas", () => {
    expect(resolveRouteSeo("/portal/admin")?.noindex).toBe(true);
    expect(resolveRouteSeo("/account/orders")?.noindex).toBe(true);
    expect(resolveRouteSeo("/account/sign-in")?.noindex).toBe(true);
  });

  it("defers product detail paths to ProductDetailPage", () => {
    expect(resolveRouteSeo("/shop/salmon-smasher-tee")).toBeNull();
  });

  it("indexes homepage", () => {
    expect(resolveRouteSeo("/")?.noindex).toBeFalsy();
  });
});
