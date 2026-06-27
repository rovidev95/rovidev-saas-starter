import type { PlanTier } from "@prisma/client";

export interface PlanDefinition {
  tier: PlanTier;
  label: string;
  priceMonthly: number; // in EUR
  limits: {
    seats: number;
    projects: number;
  };
  features: string[];
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  FREE: {
    tier: "FREE",
    label: "Free",
    priceMonthly: 0,
    limits: { seats: 2, projects: 1 },
    features: ["1 project", "2 seats", "Community support"],
  },
  PRO: {
    tier: "PRO",
    label: "Pro",
    priceMonthly: 29,
    limits: { seats: 10, projects: 25 },
    features: ["25 projects", "10 seats", "Email support", "Usage metrics"],
  },
  SCALE: {
    tier: "SCALE",
    label: "Scale",
    priceMonthly: 99,
    limits: { seats: 100, projects: 500 },
    features: [
      "500 projects",
      "100 seats",
      "Priority support",
      "SSO",
      "Audit log",
    ],
  },
};

export interface UsageSnapshot {
  seats: number;
  projects: number;
}

export type LimitKey = keyof PlanDefinition["limits"];

/** Whether creating one more unit of `key` is allowed under the plan. */
export function isWithinLimit(
  plan: PlanTier,
  key: LimitKey,
  currentCount: number,
): boolean {
  return currentCount < PLANS[plan].limits[key];
}

export function remaining(
  plan: PlanTier,
  key: LimitKey,
  currentCount: number,
): number {
  return Math.max(0, PLANS[plan].limits[key] - currentCount);
}

/** Map a Stripe price id (from env) to the corresponding plan tier. */
export function planFromPriceId(
  priceId: string | null | undefined,
  prices: { pro?: string; scale?: string },
): PlanTier {
  if (priceId && prices.scale && priceId === prices.scale) return "SCALE";
  if (priceId && prices.pro && priceId === prices.pro) return "PRO";
  return "FREE";
}
