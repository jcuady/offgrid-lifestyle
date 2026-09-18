import { describe, expect, it } from "vitest";
import { imagesFromProduct, moveGalleryIndex, productMediaFromImages, PRODUCT_GALLERY_MAX } from "./productGallery";

describe("productGallery", () => {
  it("maps cover + gallery and dedupes", () => {
    expect(imagesFromProduct("/a.jpg", ["/b.jpg", "/a.jpg", ""])).toEqual(["/a.jpg", "/b.jpg"]);
  });

  it("splits first url as cover", () => {
    expect(productMediaFromImages(["/a.jpg", "/b.jpg", "/c.jpg"])).toEqual({
      image: "/a.jpg",
      gallery: ["/b.jpg", "/c.jpg"],
    });
  });

  it("caps at PRODUCT_GALLERY_MAX", () => {
    const urls = Array.from({ length: PRODUCT_GALLERY_MAX + 3 }, (_, i) => `/${i}.jpg`);
    expect(imagesFromProduct(urls[0], urls.slice(1))).toHaveLength(PRODUCT_GALLERY_MAX);
  });

  it("reorders gallery indices", () => {
    expect(moveGalleryIndex(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });
});
