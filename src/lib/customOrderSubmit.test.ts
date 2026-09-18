import { describe, expect, it } from "vitest";
import { mergeCustomOrderDraftWithFiles, mergeDesignFilesWithUrls } from "@/src/lib/customOrderSubmit";

describe("customOrderSubmit", () => {
  it("merges per-file storage URLs into designFiles", () => {
    const merged = mergeDesignFilesWithUrls(
      [
        { name: "a.ai", key: "order:CO-1:design", url: null },
        { name: "b.ai", key: "order:CO-1:design:1", url: null },
      ],
      ["custom-order-files://CO-1/a.ai", "custom-order-files://CO-1/b.ai"],
    );
    expect(merged[0].url).toContain("a.ai");
    expect(merged[1].url).toContain("b.ai");
  });

  it("keeps legacy first-file fields in sync with designFiles[0]", () => {
    const merged = mergeCustomOrderDraftWithFiles(
      {
        id: null,
        category: "apparel",
        headwearType: null,
        designFiles: [
          { name: "front.ai", key: "pending:design", url: null },
          { name: "back.ai", key: "pending:design:1", url: null },
        ],
        designFileName: "front.ai",
        designFileKey: "pending:design",
        designFileUrl: null,
        orderSheetFileName: null,
        orderSheetFileKey: null,
        orderSheetFileUrl: null,
        designNotes: "",
        cuts: ["short_sleeve"],
        materials: ["dri_fit"],
        printMethod: "sublimation",
        quantity: 10,
        contactName: "A",
        contactEmail: "a@b.com",
        contactPhone: "+639171234567",
        teamOrOrg: "",
        shippingInfo: {
          fullName: "A",
          email: "a@b.com",
          phone: "+639171234567",
          address: "1",
          barangay: "B",
          city: "C",
          province: "P",
          region: "R",
          zip: "1",
          latitude: null,
          longitude: null,
          regionCode: "",
          provinceCode: "",
          cityCode: "",
          barangayCode: "",
        },
        status: "draft",
        estimatedTotal: null,
        depositRequired: null,
        createdAt: null,
        updatedAt: null,
      },
      "CO-2026-2000",
      {
        fullName: "A",
        email: "a@b.com",
        phone: "+639171234567",
        address: "1",
        barangay: "B",
        city: "C",
        province: "P",
        region: "R",
        zip: "1",
        latitude: null,
        longitude: null,
        regionCode: "",
        provinceCode: "",
        cityCode: "",
        barangayCode: "",
      },
      {
        designFiles: [
          { name: "front.ai", key: "order:CO-2026-2000:design", url: "u1" },
          { name: "back.ai", key: "order:CO-2026-2000:design:1", url: "u2" },
        ],
        designFileKey: "order:CO-2026-2000:design",
        designFileName: "front.ai",
        designFileUrl: "u1",
        orderSheetFileKey: null,
        orderSheetFileUrl: null,
      },
    );

    expect(merged.designFiles).toHaveLength(2);
    expect(merged.designFileName).toBe("front.ai");
    expect(merged.designFileKey).toBe("order:CO-2026-2000:design");
    expect(merged.designFileUrl).toBe("u1");
  });
});
