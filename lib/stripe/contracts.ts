import type { PaymentStatus } from "@/types/domain/order";

import type {
  StripeCheckoutMissingClientConfig,
  StripeCheckoutMissingServerConfig,
  StripeIntegrationMode,
} from "@/lib/stripe/config";

export type StripePaymentMethod = "stripe-placeholder";
export type StripePaymentStepStatus =
  | "launch-mode-missing-config"
  | "ready-placeholder";
export type StripeCheckoutServiceStatus =
  | "missing-client-config"
  | "missing-server-config"
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

export type StripeCheckoutSessionRequest = {
  mode: "checkout";
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  currency: StripeOrderPaymentInput["currency"];
  subtotalUsd: StripeOrderPaymentInput["subtotalUsd"];
  shippingUsd: StripeOrderPaymentInput["shippingUsd"];
  taxUsd: StripeOrderPaymentInput["taxUsd"];
  totalUsd: StripeOrderPaymentInput["totalUsd"];
  lineItems: StripeOrderPaymentInput["lineItems"];
  metadata: {
    checkoutMode: StripeOrderPaymentInput["checkoutMode"];
  };
};

export type StripePaymentSession = {
  id: string;
  mode: StripeIntegrationMode;
  clientSecret?: string;
  redirectUrl?: string;
  status: "placeholder";
};

export type StripeCheckoutServiceBoundary = {
  mode: "checkout";
  status: StripeCheckoutServiceStatus;
  successUrl: string;
  cancelUrl: string;
  missingClientConfig: StripeCheckoutMissingClientConfig[];
  missingServerConfig: StripeCheckoutMissingServerConfig[];
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
  checkoutService: StripeCheckoutServiceBoundary;
  checkoutSessionRequest: StripeCheckoutSessionRequest | null;
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
  checkoutService:
    "TODO: Wire the Checkout service boundary to real Stripe Checkout session creation after server execution is added.",
  refund:
    "TODO: Keep refund references typed only; do not implement refund execution until order operations are defined.",
} as const;
