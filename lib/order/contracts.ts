import type { PaymentStatus } from "@/types/domain/order";

import type { OrderDraft } from "@/features/checkout/checkout-provider";
import type {
  StripeCheckoutPaymentConfirmation,
  StripeCheckoutPaymentDraft,
} from "@/lib/stripe";

export type OrderSubmissionPayload = {
  checkoutMode: OrderDraft["checkoutMode"];
  email: string;
  items: Array<{
    id: string;
    productId: string;
    productType: OrderDraft["items"][number]["productType"];
    name: string;
    quantity: number;
    unitAmountUsd: number;
    variantName?: string;
  }>;
  shippingAddress: NonNullable<OrderDraft["shippingAddress"]>;
  shippingMethod: NonNullable<OrderDraft["shippingMethod"]>;
  paymentMethod: OrderDraft["paymentMethod"];
  paymentStatus: StripeCheckoutPaymentDraft["paymentStatus"];
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
};

export type OrderSubmissionPreview = {
  status: "placeholder";
  orderReference: string;
  paymentStatus: Extract<PaymentStatus, "pending">;
  confirmationLabel: string;
};

export type OrderSubmissionAttemptStatus =
  | "idle"
  | "submitting"
  | "success"
  | "failure";

export type OrderSubmissionFailure = {
  status: "placeholder";
  code: "missing-payload" | "missing-payment-config";
  message: string;
};

export type OrderSubmissionAttemptState = {
  status: OrderSubmissionAttemptStatus;
  preview: OrderSubmissionPreview | null;
  failure: OrderSubmissionFailure | null;
};

export type OrderCreationRequest = {
  source: "stripe-checkout-webhook";
  checkoutMode: OrderDraft["checkoutMode"];
  checkoutSessionId: string;
  paymentIntentId: string | null;
  paymentMethod: "stripe-checkout";
  paymentStatus: Extract<PaymentStatus, "paid">;
  customerEmail: string | null;
  orderReference: string | null;
  lineItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unitAmountUsd: number | null;
  }>;
  metadata: {
    stripeEventId: string;
    stripeEventType: StripeCheckoutPaymentConfirmation["eventType"];
    checkoutMode: StripeCheckoutPaymentConfirmation["checkoutMode"];
  };
};

export type OrderCreationResult = {
  status: "ready" | "ignored" | "configuration-error";
  request: OrderCreationRequest | null;
  message: string;
};

export type OrderCreationBoundary = {
  source: "stripe-checkout-confirmation";
  paymentProvider: "stripe";
  status: "ready-placeholder";
  acceptedPaymentStatuses: ReadonlyArray<Extract<PaymentStatus, "paid">>;
};

export const orderSubmissionTodo =
  "TODO: Replace the placeholder submission contract with a real backend request once Stripe execution and order persistence are implemented.";

export const orderCreationTodo = {
  boundary:
    "TODO: Keep backend order creation scoped to confirmed Stripe Checkout payment only until real persistence is implemented.",
  persistence:
    "TODO: Hand the order-creation request to a real repository/service only after database persistence is implemented.",
  sideEffects:
    "TODO: Trigger email and fulfillment side effects only after real order persistence exists.",
} as const;
