/**
 * Centralized environment access. Throws early in server runtime if a required
 * secret is missing, but stays lazy so `next build` doesn't need real values.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get authSecret() {
    return required("AUTH_SECRET");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  },
  get stripePrices() {
    return {
      pro: process.env.STRIPE_PRICE_PRO,
      scale: process.env.STRIPE_PRICE_SCALE,
    };
  },
};
