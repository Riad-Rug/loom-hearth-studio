import type { Order, OrderStatus, PaymentStatus } from "@/types/domain/order";

import type { OrderDraft } from "@/features/checkout/checkout-provider";
import type { OrderConfirmationEmailSendResult } from "@/lib/email/contracts";
import type {
  StripeCheckoutOrderSnapshot,
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
  orderSnapshot: StripeCheckoutOrderSnapshot | null;
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

export type OrderPersistenceRequest = {
  source: "order-creation";
  paymentProvider: "stripe";
  orderNumber: string;
  checkoutMode: OrderCreationRequest["checkoutMode"];
  checkoutSessionId: OrderCreationRequest["checkoutSessionId"];
  paymentIntentId: OrderCreationRequest["paymentIntentId"];
  orderReference: string | null;
  customerEmail: string | null;
  shippingAddress: Order["shippingAddress"];
  status: Extract<OrderStatus, "paid">;
  paymentStatus: OrderCreationRequest["paymentStatus"];
  items: Order["items"];
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
  placedAt: string;
  metadata: OrderCreationRequest["metadata"];
};

export type OrderPersistenceResult = {
  status: "ready" | "ignored" | "configuration-error";
  request: OrderPersistenceRequest | null;
  persistedOrder: Order | null;
  message: string;
};

export type OrderPersistenceBoundary = {
  source: "order-creation";
  repository: "OrderRepository";
  status: "ready-placeholder";
  acceptedOrderStatuses: ReadonlyArray<Extract<OrderStatus, "paid">>;
};

export type PersistConfirmedOrderResult = {
  status: "created" | "ignored" | "configuration-error" | "already-persisted";
  orderCreationRequest: OrderCreationRequest | null;
  persistenceRequest: OrderPersistenceRequest | null;
  persistedOrder: Order | null;
  emailDeliveryResult: OrderConfirmationEmailSendResult | null;
  message: string;
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

export const orderPersistenceTodo = {
  boundary:
    "TODO: Keep backend order persistence scoped to created paid orders only until database and ORM choices are validated.",
  repository:
    "TODO: Extend persistence consumption only for confirmed paid Checkout orders until later order operations are defined.",
  createdOrder:
    "TODO: Add further post-persistence side effects only after the persisted paid order handoff is validated.",
} as const;
