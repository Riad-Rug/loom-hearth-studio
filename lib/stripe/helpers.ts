import {
  getStripeCheckoutServiceConfig,
  getStripePublicConfig,
  stripeConfigTodo,
} from "@/lib/stripe/config";
import type {
  StripeCheckoutPaymentDraft,
  StripeCheckoutSessionRequest,
  StripeOrderPaymentInput,
  StripePaymentSession,
} from "@/lib/stripe/contracts";

export function createStripeOrderPaymentInput(input: {
  checkoutMode: "guest";
  email?: string;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    priceUsd: number;
  }>;
}): StripeOrderPaymentInput {
  return {
    checkoutMode: input.checkoutMode,
    email: input.email,
    subtotalUsd: input.subtotalUsd,
    shippingUsd: input.shippingUsd,
    taxUsd: input.taxUsd,
    totalUsd: input.totalUsd,
    currency: input.currency,
    lineItems: input.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitAmountUsd: item.priceUsd,
    })),
  };
}

export function createStripeCheckoutPaymentDraft(
  paymentInput: StripeOrderPaymentInput,
): StripeCheckoutPaymentDraft {
  const config = getStripePublicConfig();
  const checkoutConfig = getStripeCheckoutServiceConfig();
  const mode = config.selectedMode;
  const publishableKeyReady = Boolean(config.publishableKey);
  const missingConfig: StripeCheckoutPaymentDraft["missingConfig"] = publishableKeyReady
    ? []
    : ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];
  const paymentStepStatus = publishableKeyReady
    ? "ready-placeholder"
    : "launch-mode-missing-config";
  const checkoutSessionRequest = paymentInput.lineItems.length
    ? createStripeCheckoutSessionRequest(paymentInput)
    : null;
  const checkoutServiceStatus = missingConfig.length
    ? "missing-client-config"
    : checkoutConfig.missingServerConfig.length
      ? "missing-server-config"
      : "ready-placeholder";

  return {
    provider: "stripe",
    method: "stripe-placeholder",
    mode,
    launchMode: config.selectedMode,
    publishableKeyReady,
    missingConfig,
    isReadyForPlaceholderFlow: true,
    paymentStepStatus,
    checkoutService: {
      mode: checkoutConfig.mode,
      status: checkoutServiceStatus,
      successUrl: checkoutConfig.successUrl,
      cancelUrl: checkoutConfig.cancelUrl,
      missingClientConfig: checkoutConfig.missingClientConfig,
      missingServerConfig: checkoutConfig.missingServerConfig,
    },
    checkoutSessionRequest,
    session: checkoutSessionRequest
      ? createStripeCheckoutSessionPlaceholder(checkoutSessionRequest)
      : null,
    paymentStatus: "pending",
  };
}

export function createStripeCheckoutSessionRequest(
  paymentInput: StripeOrderPaymentInput,
): StripeCheckoutSessionRequest {
  const config = getStripeCheckoutServiceConfig();

  return {
    mode: config.mode,
    customerEmail: paymentInput.email,
    successUrl: config.successUrl,
    cancelUrl: config.cancelUrl,
    currency: paymentInput.currency,
    subtotalUsd: paymentInput.subtotalUsd,
    shippingUsd: paymentInput.shippingUsd,
    taxUsd: paymentInput.taxUsd,
    totalUsd: paymentInput.totalUsd,
    lineItems: paymentInput.lineItems,
    metadata: {
      checkoutMode: paymentInput.checkoutMode,
    },
  };
}

export function createStripeCheckoutSessionPlaceholder(
  request: StripeCheckoutSessionRequest,
): StripePaymentSession {
  return {
    id: "stripe-checkout-session-placeholder",
    mode: request.mode,
    status: "placeholder",
  };
}

export const stripeHelpersTodo = {
  checkoutState:
    "TODO: Replace the placeholder Checkout session request and placeholder session helper with real Stripe Checkout execution once server wiring is added.",
  config: stripeConfigTodo,
} as const;
