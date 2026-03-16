import { getEnvSnapshot, getPublicEnv } from "@/lib/validation/env";

export type StripeIntegrationMode = "checkout";
export const launchStripeIntegrationMode: StripeIntegrationMode = "checkout";

export type StripePublicConfig = {
  publishableKey?: string;
  selectedMode: StripeIntegrationMode;
  walletSupportEnabled: false;
};

export type StripeServerConfig = {
  secretKey?: string;
  webhookSecret?: string;
  selectedMode: StripeIntegrationMode;
};

export function getStripePublicConfig(): StripePublicConfig {
  const env = getPublicEnv();

  return {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    selectedMode: launchStripeIntegrationMode,
    walletSupportEnabled: false,
  };
}

export function getStripeServerConfig(): StripeServerConfig {
  const env = getEnvSnapshot();

  return {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    selectedMode: launchStripeIntegrationMode,
  };
}

export function hasStripePublishableKey() {
  return Boolean(getStripePublicConfig().publishableKey);
}

export function hasStripeServerKeys() {
  const config = getStripeServerConfig();

  return Boolean(config.secretKey && config.webhookSecret);
}

export const stripeConfigTodo =
  "TODO: Implement the Stripe Checkout execution path, wallets, and webhook handling without widening launch support beyond Stripe Checkout.";
