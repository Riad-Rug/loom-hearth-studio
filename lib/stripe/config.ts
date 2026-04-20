import { siteConfig } from "@/config/site";
import { getEnvSnapshot, getPublicEnv } from "@/lib/validation/env";

export type StripeIntegrationMode = "checkout";
export const launchStripeIntegrationMode: StripeIntegrationMode = "checkout";
export type StripeCheckoutServiceMode = "checkout";
export type StripeCheckoutWebhookEndpointPath = "/api/stripe/webhook";
export type StripeCheckoutMissingClientConfig = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY";
export type StripeCheckoutMissingServerConfig =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET";
export type StripeCheckoutWebhookStatus =
  | "missing-server-config"
  | "ready";
export type StripeCheckoutConfirmationStatus =
  | "missing-server-config"
  | "ready";

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
  sessionEndpointPath: "/api/stripe/checkout-session";
  successUrl: string;
  cancelUrl: string;
  missingClientConfig: StripeCheckoutMissingClientConfig[];
  missingServerConfig: StripeCheckoutMissingServerConfig[];
};

export type StripeCheckoutWebhookConfig = {
  mode: StripeCheckoutServiceMode;
  endpointPath: StripeCheckoutWebhookEndpointPath;
  webhookSecret?: string;
  status: StripeCheckoutWebhookStatus;
  missingServerConfig: StripeCheckoutMissingServerConfig[];
};

export type StripeCheckoutConfirmationConfig = {
  mode: StripeCheckoutServiceMode;
  source: "webhook";
  webhookEndpointPath: StripeCheckoutWebhookEndpointPath;
  status: StripeCheckoutConfirmationStatus;
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

  return {
    mode: launchStripeIntegrationMode,
    publishableKey: publicConfig.publishableKey,
    secretKey: serverConfig.secretKey,
    webhookSecret: serverConfig.webhookSecret,
    sessionEndpointPath: "/api/stripe/checkout-session",
    successUrl: new URL("/checkout/success", siteConfig.siteUrl).toString(),
    cancelUrl: new URL("/checkout/payment", siteConfig.siteUrl).toString(),
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

export function getStripeCheckoutWebhookConfig(): StripeCheckoutWebhookConfig {
  const serverConfig = getStripeServerConfig();
  const missingServerConfig = serverConfig.webhookSecret
    ? []
    : (["STRIPE_WEBHOOK_SECRET"] as StripeCheckoutMissingServerConfig[]);

  return {
    mode: launchStripeIntegrationMode,
    endpointPath: "/api/stripe/webhook",
    webhookSecret: serverConfig.webhookSecret,
    status: missingServerConfig.length ? "missing-server-config" : "ready",
    missingServerConfig,
  };
}

export function getStripeCheckoutConfirmationConfig(): StripeCheckoutConfirmationConfig {
  const webhookConfig = getStripeCheckoutWebhookConfig();

  return {
    mode: launchStripeIntegrationMode,
    source: "webhook",
    webhookEndpointPath: webhookConfig.endpointPath,
    status: webhookConfig.status,
    missingServerConfig: webhookConfig.missingServerConfig,
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

export function hasStripeCheckoutWebhookConfig() {
  const config = getStripeCheckoutWebhookConfig();

  return Boolean(config.webhookSecret);
}

export function hasStripeCheckoutConfirmationConfig() {
  const config = getStripeCheckoutConfirmationConfig();

  return config.status === "ready";
}

export const stripeConfigTodo =
  "TODO: Keep Stripe Checkout as the only launch mode while wiring the remaining webhook verification and payment-confirmation boundary steps in later slices.";
