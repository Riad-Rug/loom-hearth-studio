import type { Order, OrderStatus, PaymentStatus } from "@/types/domain/order";

import type { OrderConfirmationEmailSendResult } from "@/lib/email/contracts";
import type { FulfillmentOrchestrationResult } from "@/lib/fulfillment/contracts";
import type {
  StripeCheckoutOrderSnapshot,
  StripeCheckoutPaymentConfirmation,
} from "@/lib/stripe";

export type OrderCreationRequest = {
  source: "stripe-checkout-webhook" | "stripe-payment-intent";
  checkoutMode: "guest";
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  paymentMethod: "stripe-checkout" | "stripe-payment-intent";
  paymentStatus: Extract<PaymentStatus, "paid" | "authorized">;
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
    stripeEventType: string;
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
  acceptedPaymentStatuses: ReadonlyArray<Extract<PaymentStatus, "paid" | "authorized">>;
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
  billingAddress?: Order["billingAddress"];
  shippingAddress: Order["shippingAddress"];
  status: Extract<OrderStatus, "paid" | "pending">;
  paymentStatus: OrderCreationRequest["paymentStatus"];
  items: Order["items"];
  promoCode?: string;
  discountUsd: number;
  subtotalUsd: number;
  shippingUsd: number;
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
  acceptedOrderStatuses: ReadonlyArray<Extract<OrderStatus, "paid" | "pending">>;
};

export type PersistConfirmedOrderResult = {
  status: "created" | "ignored" | "configuration-error" | "already-persisted";
  orderCreationRequest: OrderCreationRequest | null;
  persistenceRequest: OrderPersistenceRequest | null;
  persistedOrder: Order | null;
  emailDeliveryResult: OrderConfirmationEmailSendResult | null;
  fulfillmentResult: FulfillmentOrchestrationResult | null;
  message: string;
};

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
