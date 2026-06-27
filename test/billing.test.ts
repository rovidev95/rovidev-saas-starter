import { describe, expect, it } from "vitest";
import {
  grantsAccess,
  isHandledEvent,
  mapStripeStatus,
} from "@/lib/billing";
import { slugify, withSuffix } from "@/lib/slug";

describe("mapStripeStatus", () => {
  it("maps known statuses", () => {
    expect(mapStripeStatus("active")).toBe("ACTIVE");
    expect(mapStripeStatus("trialing")).toBe("TRIALING");
    expect(mapStripeStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeStatus("unpaid")).toBe("PAST_DUE");
    expect(mapStripeStatus("canceled")).toBe("CANCELED");
  });
  it("collapses unknown to INCOMPLETE", () => {
    expect(mapStripeStatus("weird")).toBe("INCOMPLETE");
  });
});

describe("grantsAccess", () => {
  it("only active/trialing grant access", () => {
    expect(grantsAccess("ACTIVE")).toBe(true);
    expect(grantsAccess("TRIALING")).toBe(true);
    expect(grantsAccess("PAST_DUE")).toBe(false);
    expect(grantsAccess("CANCELED")).toBe(false);
  });
});

describe("isHandledEvent", () => {
  it("recognizes the events we act on", () => {
    expect(isHandledEvent("checkout.session.completed")).toBe(true);
    expect(isHandledEvent("customer.subscription.deleted")).toBe(true);
    expect(isHandledEvent("invoice.paid")).toBe(false);
  });
});

describe("slugify", () => {
  it("normalizes names", () => {
    expect(slugify("Acme Inc.")).toBe("acme-inc");
    expect(slugify("  Múltiple   Spaces  ")).toBe("multiple-spaces");
    expect(slugify("Hólá! @ Wörld")).toBe("hola-world");
  });
  it("adds a suffix", () => {
    expect(withSuffix("acme", "x1y2")).toBe("acme-x1y2");
    expect(withSuffix("", "x1y2")).toBe("org-x1y2");
  });
});
