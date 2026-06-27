import type { SubscriptionStatus } from "@prisma/client";

/**
 * Map a Stripe subscription status string to our internal enum.
 * Unknown/edge statuses collapse to INCOMPLETE so access is treated cautiously.
 */
export function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

/** Whether a subscription status should grant access to paid features. */
export function grantsAccess(status: SubscriptionStatus): boolean {
  return status === "ACTIVE" || status === "TRIALING";
}

/**
 * Stripe webhook event types we act on. Centralized so the handler and tests
 * agree on the contract.
 */
export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

export type HandledStripeEvent = (typeof HANDLED_STRIPE_EVENTS)[number];

export function isHandledEvent(type: string): type is HandledStripeEvent {
  return (HANDLED_STRIPE_EVENTS as readonly string[]).includes(type);
}
