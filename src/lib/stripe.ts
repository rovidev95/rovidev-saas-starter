import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

/** Lazily-instantiated Stripe client (avoids needing the key at build time). */
export function getStripe(): Stripe {
  if (!client) {
    // apiVersion intentionally omitted: uses the account's default, which keeps
    // this compatible across stripe-node minor upgrades.
    client = new Stripe(env.stripeSecretKey, { typescript: true });
  }
  return client;
}
