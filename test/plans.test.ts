import { describe, expect, it } from "vitest";
import {
  isWithinLimit,
  planFromPriceId,
  PLANS,
  remaining,
} from "@/lib/plans";

describe("plan limits", () => {
  it("blocks creating beyond the project limit", () => {
    expect(isWithinLimit("FREE", "projects", 0)).toBe(true);
    expect(isWithinLimit("FREE", "projects", 1)).toBe(false);
    expect(isWithinLimit("PRO", "projects", 24)).toBe(true);
    expect(isWithinLimit("PRO", "projects", 25)).toBe(false);
  });

  it("computes remaining seats", () => {
    expect(remaining("PRO", "seats", 3)).toBe(7);
    expect(remaining("FREE", "seats", 5)).toBe(0);
  });

  it("plans are ordered by price", () => {
    expect(PLANS.FREE.priceMonthly).toBeLessThan(PLANS.PRO.priceMonthly);
    expect(PLANS.PRO.priceMonthly).toBeLessThan(PLANS.SCALE.priceMonthly);
  });
});

describe("planFromPriceId", () => {
  const prices = { pro: "price_pro", scale: "price_scale" };

  it("maps known price ids", () => {
    expect(planFromPriceId("price_pro", prices)).toBe("PRO");
    expect(planFromPriceId("price_scale", prices)).toBe("SCALE");
  });

  it("falls back to FREE for unknown/empty", () => {
    expect(planFromPriceId("price_other", prices)).toBe("FREE");
    expect(planFromPriceId(null, prices)).toBe("FREE");
    expect(planFromPriceId(undefined, prices)).toBe("FREE");
  });
});
