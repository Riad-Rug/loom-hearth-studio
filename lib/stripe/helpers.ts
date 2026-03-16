import {
  getStripePublicConfig,
  stripeConfigTodo,
} from "@/lib/stripe/config";
import type {
  StripeCheckoutPaymentDraft,
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
  selectedMode: StripeCheckoutPaymentDraft["mode"],
): StripeCheckoutPaymentDraft {
  const config = getStripePublicConfig();
  const mode = selectedMode ?? config.selectedMode;
  const publishableKeyReady = Boolean(config.publishableKey);
  const missingConfig: StripeCheckoutPaymentDraft["missingConfig"] = publishableKeyReady
    ? []
    : ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];
  const isModeSelected = Boolean(mode);
  const paymentStepStatus = !isModeSelected
    ? "needs-mode-selection"
    : publishableKeyReady
      ? "ready-placeholder"
      : "mode-selected-missing-config";

  return {
    provider: "stripe",
    method: "stripe-placeholder",
    mode,
    publishableKeyReady,
    missingConfig,
    isModeSelected,
    isReadyForPlaceholderFlow: isModeSelected,
    paymentStepStatus,
    session: paymentInput.lineItems.length
      ? {
          id: "stripe-session-placeholder",
          mode,
          status: "placeholder",
        }
      : null,
    paymentStatus: "pending",
  };
}

export const stripeHelpersTodo = {
  checkoutState:
    "TODO: Replace the placeholder payment draft helper with real session creation once Stripe execution is implemented.",
  config: stripeConfigTodo,
} as const;
