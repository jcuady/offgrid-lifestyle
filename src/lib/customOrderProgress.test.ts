import { describe, expect, it } from "vitest";
import { customOrderProgressSteps } from "@/src/lib/customOrderProgress";

describe("customOrderProgressSteps", () => {
  it("completes every step when the order is delivered, even without an invoice", () => {
    const steps = customOrderProgressSteps({
      status: "delivered",
      hasOfficialQuote: false,
      paymentStatus: "unpaid",
    });
    expect(steps.every((step) => step.done)).toBe(true);
    expect(steps.some((step) => step.current)).toBe(false);
    const review = steps.find((step) => step.key === "submitted");
    expect(review?.label.toLowerCase()).not.toContain("under review");
  });

  it("keeps under review as the only current step before an invoice", () => {
    const steps = customOrderProgressSteps({
      status: "under_review",
      hasOfficialQuote: false,
      paymentStatus: "unpaid",
    });
    expect(steps.find((step) => step.current)?.key).toBe("submitted");
    expect(steps.find((step) => step.key === "submitted")?.label).toBe("Under review");
    expect(steps.find((step) => step.key === "production")?.done).toBe(false);
    expect(steps.find((step) => step.key === "shipping")?.done).toBe(false);
  });

  it("shows awaiting invoice while the quote is still pending", () => {
    const steps = customOrderProgressSteps({
      status: "pending_deposit",
      hasOfficialQuote: false,
      paymentStatus: "unpaid",
    });
    expect(steps.find((step) => step.current)?.label).toBe("Awaiting invoice");
    expect(steps.find((step) => step.key === "production")?.done).toBe(false);
  });

  it("does not complete production while a revision is open", () => {
    const steps = customOrderProgressSteps({
      status: "revision_requested",
      hasOfficialQuote: true,
      paymentStatus: "unpaid",
    });
    expect(steps.filter((step) => step.current).map((step) => step.key)).toEqual(["submitted"]);
    expect(steps.find((step) => step.key === "submitted")?.label).toBe("Revision requested");
    expect(steps.find((step) => step.key === "production")?.done).toBe(false);
    expect(steps.find((step) => step.key === "shipping")?.done).toBe(false);
  });

  it("marks shipping current and earlier steps done while the order is on the way", () => {
    const steps = customOrderProgressSteps({
      status: "shipped",
      hasOfficialQuote: false,
      paymentStatus: "unpaid",
    });
    expect(steps.find((step) => step.current)?.key).toBe("shipping");
    expect(steps.find((step) => step.key === "production")?.done).toBe(true);
    expect(steps.find((step) => step.key === "submitted")?.done).toBe(true);
  });
});
