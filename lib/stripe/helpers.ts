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
): StripeCheckoutPaymentDraft {
  const config = getStripePublicConfig();

  return {
    provider: "stripe",
    method: "stripe-placeholder",
    mode: config.selectedMode,
    publishableKeyReady: Boolean(config.publishableKey),
    session: paymentInput.lineItems.length
      ? {
          id: "stripe-session-placeholder",
          mode: config.selectedMode,
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
