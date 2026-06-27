"use server";

import { redirect } from "next/navigation";
import type { PlanTier } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/tenant";
import { assertCan } from "@/lib/rbac";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";

function priceIdForPlan(plan: PlanTier): string | undefined {
  if (plan === "PRO") return env.stripePrices.pro;
  if (plan === "SCALE") return env.stripePrices.scale;
  return undefined;
}

export async function createCheckoutAction(
  slug: string,
  plan: PlanTier,
): Promise<void> {
  const ctx = await getOrgContext(slug);
  assertCan(ctx.role, "billing:manage");

  const priceId = priceIdForPlan(plan);
  if (!priceId) throw new Error(`No Stripe price configured for plan ${plan}`);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.appUrl}/dashboard/${slug}/billing?checkout=success`,
    cancel_url: `${env.appUrl}/dashboard/${slug}/billing?checkout=cancel`,
    client_reference_id: ctx.organization.id,
    customer: ctx.subscription?.stripeCustomerId ?? undefined,
    metadata: { organizationId: ctx.organization.id, plan },
    subscription_data: {
      metadata: { organizationId: ctx.organization.id, plan },
    },
  });

  if (session.url) redirect(session.url);
}

export async function createPortalAction(slug: string): Promise<void> {
  const ctx = await getOrgContext(slug);
  assertCan(ctx.role, "billing:manage");

  const customerId = ctx.subscription?.stripeCustomerId;
  if (!customerId) throw new Error("No Stripe customer for this organization");

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/dashboard/${slug}/billing`,
  });
  redirect(portal.url);
}

/**
 * Persist subscription state coming from Stripe. Called by the webhook handler.
 * Note: actual prisma writes live here so the handler stays thin.
 */
export async function upsertSubscriptionFromStripe(params: {
  organizationId: string;
  plan: PlanTier;
  status: import("@prisma/client").SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
}): Promise<void> {
  await prisma.subscription.upsert({
    where: { organizationId: params.organizationId },
    update: {
      plan: params.plan,
      status: params.status,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      currentPeriodEnd: params.currentPeriodEnd,
    },
    create: {
      organizationId: params.organizationId,
      plan: params.plan,
      status: params.status,
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      currentPeriodEnd: params.currentPeriodEnd,
    },
  });
}
