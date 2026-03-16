import { getEnvSnapshot, getPublicEnv } from "@/lib/validation/env";

export type StripeIntegrationMode = "checkout" | "elements";

export type StripePublicConfig = {
  publishableKey?: string;
  selectedMode: StripeIntegrationMode | null;
  walletSupportEnabled: false;
};

export type StripeServerConfig = {
  secretKey?: string;
  webhookSecret?: string;
  selectedMode: StripeIntegrationMode | null;
};

export function getStripePublicConfig(): StripePublicConfig {
  const env = getPublicEnv();

  return {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    selectedMode: null,
    walletSupportEnabled: false,
  };
}

export function getStripeServerConfig(): StripeServerConfig {
  const env = getEnvSnapshot();

  return {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    selectedMode: null,
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
  "TODO: Select Stripe Checkout or Elements before wiring real payment execution, wallets, and webhook handling.";
