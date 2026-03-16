import type { PaymentStatus } from "@/types/domain/order";

import type { StripeIntegrationMode } from "@/lib/stripe/config";

export type StripePaymentMethod = "stripe-placeholder";
export type StripePaymentStepStatus =
  | "launch-mode-missing-config"
  | "ready-placeholder";

export type StripeOrderPaymentInput = {
  checkoutMode: "guest";
  email?: string;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
  lineItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unitAmountUsd: number;
  }>;
};

export type StripePaymentSession = {
  id: string;
  mode: StripeIntegrationMode;
  clientSecret?: string;
  redirectUrl?: string;
  status: "placeholder";
};

export type StripeCheckoutPaymentDraft = {
  provider: "stripe";
  method: StripePaymentMethod;
  mode: StripeIntegrationMode;
  publishableKeyReady: boolean;
  missingConfig: Array<"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY">;
  launchMode: StripeIntegrationMode;
  isReadyForPlaceholderFlow: boolean;
  paymentStepStatus: StripePaymentStepStatus;
  session: StripePaymentSession | null;
  paymentStatus: Extract<PaymentStatus, "pending">;
};

export type StripeRefundReference = {
  paymentIntentId: string;
  orderId: string;
};

export const stripeContractsTodo = {
  session:
    "TODO: Replace the placeholder Stripe session shape with the final Stripe Checkout contract when execution is implemented.",
  refund:
    "TODO: Keep refund references typed only; do not implement refund execution until order operations are defined.",
} as const;
