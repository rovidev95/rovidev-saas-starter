import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { mapStripeStatus, isHandledEvent } from "@/lib/billing";
import { planFromPriceId } from "@/lib/plans";
import { upsertSubscriptionFromStripe } from "@/app/actions/billing";

export const runtime = "nodejs";
// Stripe needs the raw, unparsed body to verify signatures.
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotency gate: Stripe delivers at-least-once. Record the event id first;
  // if it already exists we acknowledge without re-processing.
  try {
    await prisma.processedWebhook.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!isHandledEvent(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    // Roll back the idempotency marker so Stripe retries deliver again.
    await prisma.processedWebhook.delete({ where: { id: event.id } }).catch(() => {});
    const message = err instanceof Error ? err.message : "handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  const stripe = getStripe();
  const prices = env.stripePrices;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId =
        session.metadata?.organizationId ?? session.client_reference_id;
      if (!organizationId || !session.subscription) return;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await persistSubscription(organizationId, subscription, prices);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata?.organizationId;
      if (!organizationId) return;
      await persistSubscription(organizationId, subscription, prices);
      break;
    }
    default:
      break;
  }
}

async function persistSubscription(
  organizationId: string,
  subscription: Stripe.Subscription,
  prices: { pro?: string; scale?: string },
): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const isDeleted = subscription.status === "canceled";

  await upsertSubscriptionFromStripe({
    organizationId,
    plan: isDeleted ? "FREE" : planFromPriceId(priceId, prices),
    status: mapStripeStatus(subscription.status),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
}
