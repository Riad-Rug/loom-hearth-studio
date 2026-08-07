import "server-only";

import Stripe from "stripe";

import { getStripeServerConfig } from "@/lib/stripe/config";

export function createStripeClient(): Stripe {
  const config = getStripeServerConfig();

  if (!config.secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  return new Stripe(config.secretKey, {
    typescript: true,
  });
}
