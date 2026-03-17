import type { LaunchCheckoutValidationIssue } from "@/lib/catalog/contracts";
import type { PaymentStatus } from "@/types/domain/order";
import type { OrderAddress } from "@/types/domain/order";
import type { ProductVariant } from "@/types/domain/product";

import type {
  StripeCheckoutConfirmationStatus,
  StripeCheckoutMissingClientConfig,
  StripeCheckoutMissingServerConfig,
  StripeIntegrationMode,
  StripeCheckoutWebhookEndpointPath,
  StripeCheckoutWebhookStatus,
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
export type StripeCheckoutWebhookEventType =
  | "checkout.session.completed"
  | "checkout.session.async_payment_failed"
  | "checkout.session.expired";

export type StripeOrderPaymentInput = {
  checkoutMode: "guest";
  email?: string;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
  shippingAddress: OrderAddress | null;
  lineItems: Array<{
    id: string;
    productId: string;
    productType: "rug" | "multiUnit";
    name: string;
    slug: string;
    quantity: number;
    unitAmountUsd: number;
    variant?: ProductVariant;
  }>;
};

export type StripeCheckoutOrderSnapshot = {
  shippingAddress: OrderAddress;
  items: Array<{
    id: string;
    productId: string;
    productType: "rug" | "multiUnit";
    name: string;
    slug: string;
    priceUsd: number;
    quantity: number;
    variant?: ProductVariant;
  }>;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
};

export type StripeCheckoutSessionMetadata = {
  checkoutMode: StripeOrderPaymentInput["checkoutMode"];
  orderSnapshot: string | null;
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
  metadata: StripeCheckoutSessionMetadata;
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
  status: "created" | "configuration-error" | "api-error" | "validation-error";
  session: StripeCheckoutSessionResponse | null;
  redirectTarget: string | null;
  validationIssues: LaunchCheckoutValidationIssue[];
  message: string;
};

export type StripeCheckoutExecutionAttemptState = {
  status: "idle" | "submitting" | "success" | "failure";
  result: StripeCheckoutSessionCreationResult | null;
  message: string | null;
};

export type StripeCheckoutWebhookSession = {
  id: string;
  mode: "checkout";
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  status: "complete" | "expired" | "open";
  paymentIntentId?: string;
  customerEmail?: string;
  customerDetails?: {
    email?: string;
  };
  metadata: Record<string, string | undefined>;
};

export type StripeCheckoutWebhookEvent = {
  id: string;
  type: StripeCheckoutWebhookEventType;
  livemode: boolean;
  account?: string;
  apiVersion?: string;
  createdAt?: string;
  data: {
    object: StripeCheckoutWebhookSession;
  };
};

export type StripeCheckoutWebhookBoundary = {
  mode: "checkout";
  endpointPath: StripeCheckoutWebhookEndpointPath;
  status: StripeCheckoutWebhookStatus;
  missingServerConfig: StripeCheckoutMissingServerConfig[];
  supportedEventTypes: ReadonlyArray<StripeCheckoutWebhookEventType>;
};

export type StripeCheckoutConfirmationBoundary = {
  mode: "checkout";
  source: "webhook";
  webhookEndpointPath: StripeCheckoutWebhookEndpointPath;
  status: StripeCheckoutConfirmationStatus;
  missingServerConfig: StripeCheckoutMissingServerConfig[];
  supportedEventTypes: ReadonlyArray<StripeCheckoutWebhookEventType>;
};

export type StripeCheckoutPaymentConfirmation = {
  provider: "stripe";
  mode: "checkout";
  source: "webhook";
  eventId: string;
  eventType: StripeCheckoutWebhookEventType;
  paymentStatus: Extract<PaymentStatus, "pending" | "paid" | "failed">;
  checkoutSessionId: string;
  paymentIntentId: string | null;
  customerEmail: string | null;
  checkoutMode: StripeOrderPaymentInput["checkoutMode"];
  orderReference: string | null;
  orderSnapshot: StripeCheckoutOrderSnapshot | null;
};

export type StripeCheckoutPaymentConfirmationResult = {
  status: "confirmed" | "ignored" | "configuration-error" | "signature-error";
  confirmation: StripeCheckoutPaymentConfirmation | null;
  message: string;
};

export type StripeWebhookSignature = {
  timestamp: string;
  signatures: string[];
  scheme: "v1";
};

export type StripeWebhookSignatureVerificationResult = {
  status: "verified" | "missing-header" | "invalid-header" | "configuration-error" | "mismatch";
  message: string;
};

export type StripeCheckoutWebhookReceipt = {
  status: "accepted" | "ignored" | "configuration-error" | "invalid-payload";
  message: string;
  signaturePresent: boolean;
  signatureVerification: StripeWebhookSignatureVerificationResult;
  eventType: StripeCheckoutWebhookEventType | null;
  eventId: string | null;
  confirmationResult: StripeCheckoutPaymentConfirmationResult | null;
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
    "TODO: Keep the Checkout service boundary scoped to session creation only. Do not mix webhook confirmation into the browser execution path.",
  checkoutExecution:
    "TODO: Hosted Checkout redirect execution is wired. Do not extend this boundary into post-payment processing until later slices.",
  webhook:
    "TODO: Verify and parse real Stripe Checkout webhook payloads at a dedicated webhook route before any order or email side effects are added.",
  confirmation:
    "TODO: Map supported Checkout webhook events into confirmation status only. Leave order creation, fulfillment, and email side effects for later slices.",
  webhookRoute:
    "TODO: Keep the webhook route scaffold limited to payload parsing and confirmation mapping until real signature verification and downstream side effects are implemented.",
  refund:
    "TODO: Keep refund references typed only; do not implement refund execution until order operations are defined.",
} as const;
