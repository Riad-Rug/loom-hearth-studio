import { siteConfig } from "@/config/site";
import { getEnvSnapshot, getPublicEnv } from "@/lib/validation/env";

export type StripeIntegrationMode = "checkout";
export const launchStripeIntegrationMode: StripeIntegrationMode = "checkout";
export type StripeCheckoutServiceMode = "checkout";
export type StripeCheckoutMissingClientConfig = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY";
export type StripeCheckoutMissingServerConfig =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET";

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

export type StripeCheckoutServiceConfig = {
  mode: StripeCheckoutServiceMode;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  successUrl: string;
  cancelUrl: string;
  missingClientConfig: StripeCheckoutMissingClientConfig[];
  missingServerConfig: StripeCheckoutMissingServerConfig[];
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

export function getStripeCheckoutServiceConfig(): StripeCheckoutServiceConfig {
  const publicConfig = getStripePublicConfig();
  const serverConfig = getStripeServerConfig();
  const siteUrl = getPublicEnv().NEXT_PUBLIC_SITE_URL ?? siteConfig.siteUrl;

  return {
    mode: launchStripeIntegrationMode,
    publishableKey: publicConfig.publishableKey,
    secretKey: serverConfig.secretKey,
    webhookSecret: serverConfig.webhookSecret,
    successUrl: new URL("/checkout/success", siteUrl).toString(),
    cancelUrl: new URL("/checkout/payment", siteUrl).toString(),
    missingClientConfig: publicConfig.publishableKey
      ? []
      : ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    missingServerConfig: [
      ...(serverConfig.secretKey
        ? []
        : (["STRIPE_SECRET_KEY"] as StripeCheckoutMissingServerConfig[])),
      ...(serverConfig.webhookSecret
        ? []
        : (["STRIPE_WEBHOOK_SECRET"] as StripeCheckoutMissingServerConfig[])),
    ],
  };
}

export function hasStripePublishableKey() {
  return Boolean(getStripePublicConfig().publishableKey);
}

export function hasStripeServerKeys() {
  const config = getStripeServerConfig();

  return Boolean(config.secretKey && config.webhookSecret);
}

export function hasStripeCheckoutServiceConfig() {
  const config = getStripeCheckoutServiceConfig();

  return Boolean(
    config.publishableKey &&
      config.secretKey &&
      config.webhookSecret,
  );
}

export const stripeConfigTodo =
  "TODO: Implement the Stripe Checkout execution path, using the fixed Checkout success/cancel URLs and server credentials defined in this boundary.";
