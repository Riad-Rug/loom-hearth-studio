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
export type StripeCheckoutExecutionStatus =
  | "missing-server-config"
  | "ready";

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

export type StripeCheckoutSessionResponse = {
  id: string;
  mode: StripeIntegrationMode;
  url?: string;
  expiresAt?: string;
  status: "placeholder" | "created";
};

export type StripeCheckoutServiceBoundary = {
  mode: "checkout";
  status: StripeCheckoutServiceStatus;
  sessionEndpointPath: string;
  successUrl: string;
  cancelUrl: string;
  missingClientConfig: StripeCheckoutMissingClientConfig[];
  missingServerConfig: StripeCheckoutMissingServerConfig[];
};

export type StripeCheckoutExecutionBoundary = {
  endpointPath: string;
  status: StripeCheckoutExecutionStatus;
  redirectTarget: string | null;
  missingServerConfig: StripeCheckoutMissingServerConfig[];
};

export type StripeCheckoutSessionCreationResult = {
  status: "created" | "configuration-error" | "api-error";
  session: StripeCheckoutSessionResponse | null;
  redirectTarget: string | null;
  message: string;
};

export type StripeCheckoutExecutionAttemptState = {
  status: "idle" | "submitting" | "success" | "failure";
  result: StripeCheckoutSessionCreationResult | null;
  message: string | null;
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
  checkoutExecution: StripeCheckoutExecutionBoundary;
  checkoutSessionRequest: StripeCheckoutSessionRequest | null;
  checkoutSessionResponse: StripeCheckoutSessionResponse | null;
  paymentStatus: Extract<PaymentStatus, "pending">;
};

export type StripeRefundReference = {
  paymentIntentId: string;
  orderId: string;
};

export const stripeContractsTodo = {
  sessionCreation:
    "TODO: Keep the Checkout session request/response contract limited to hosted Checkout session creation only for now.",
  checkoutService:
    "TODO: Keep the Checkout service boundary scoped to session creation only. Do not add payment confirmation or webhook handling in this slice.",
  checkoutExecution:
    "TODO: Hosted Checkout redirect execution is wired. Do not extend this boundary into post-payment processing until later slices.",
  refund:
    "TODO: Keep refund references typed only; do not implement refund execution until order operations are defined.",
} as const;
