import {
  getStripeCheckoutServiceConfig,
  getStripePublicConfig,
  stripeConfigTodo,
} from "@/lib/stripe/config";
import type {
  StripeCheckoutExecutionAttemptState,
  StripeCheckoutPaymentDraft,
  StripeCheckoutSessionCreationResult,
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
  StripeOrderPaymentInput,
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
  const checkoutSessionResponse = checkoutSessionRequest
    ? createStripeCheckoutSessionPlaceholder(checkoutSessionRequest)
    : null;

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
      sessionEndpointPath: checkoutConfig.sessionEndpointPath,
      successUrl: checkoutConfig.successUrl,
      cancelUrl: checkoutConfig.cancelUrl,
      missingClientConfig: checkoutConfig.missingClientConfig,
      missingServerConfig: checkoutConfig.missingServerConfig,
    },
    checkoutExecution: {
      endpointPath: checkoutConfig.sessionEndpointPath,
      status: checkoutConfig.missingServerConfig.length
        ? "missing-server-config"
        : "ready",
      redirectTarget: checkoutSessionResponse?.url ?? null,
      missingServerConfig: checkoutConfig.missingServerConfig,
    },
    checkoutSessionRequest,
    checkoutSessionResponse,
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
): StripeCheckoutSessionResponse {
  return {
    id: "stripe-checkout-session-placeholder",
    mode: request.mode,
    url: request.successUrl,
    status: "placeholder",
  };
}

export async function requestStripeCheckoutSessionCreation(input: {
  endpointPath: string;
  request: StripeCheckoutSessionRequest;
}): Promise<StripeCheckoutSessionCreationResult> {
  const response = await fetch(input.endpointPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input.request),
  });

  return (await response.json()) as StripeCheckoutSessionCreationResult;
}

export function getStripeCheckoutRedirectTarget(
  result: StripeCheckoutSessionCreationResult | null,
) {
  if (result?.status !== "created") {
    return null;
  }

  return result.redirectTarget ?? null;
}

export const initialStripeCheckoutExecutionAttemptState: StripeCheckoutExecutionAttemptState = {
  status: "idle",
  result: null,
  message: null,
};

export const stripeHelpersTodo = {
  checkoutState:
    "TODO: Keep the hosted Checkout redirect handoff only. Payment confirmation, webhooks, and order submission remain out of scope for this slice.",
  config: stripeConfigTodo,
} as const;
