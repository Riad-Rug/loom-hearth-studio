import type { Order } from "@/types/domain";

export type FulfillmentOrchestrationTrigger =
  | "persisted-paid-order"
  | "admin-status-update";

export type FulfillmentOrchestrationRequest = {
  trigger: FulfillmentOrchestrationTrigger;
  orderId: Order["id"];
  orderNumber: Order["orderNumber"];
  orderStatus: Order["status"];
  paymentStatus: Order["paymentStatus"];
  customerEmail: Order["shippingAddress"]["email"];
};

export type FulfillmentOrchestrationResult = {
  status: "ready" | "ignored";
  request: FulfillmentOrchestrationRequest | null;
  message: string;
};

export type FulfillmentOrchestrationBoundary = {
  service: "LaunchFulfillmentOrchestrator";
  status: "ready-placeholder";
  acceptedTriggers: ReadonlyArray<FulfillmentOrchestrationTrigger>;
  acceptedOrderStatuses: ReadonlyArray<
    Extract<
      Order["status"],
      "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
    >
  >;
};

export const fulfillmentOrchestrationTodo = {
  boundary:
    "TODO: Keep fulfillment orchestration limited to typed launch handoffs from persisted paid orders and admin status updates.",
  sideEffects:
    "TODO: Add real fulfillment, shipping, and broader post-payment side effects only after launch-safe orchestration requirements are finalized.",
} as const;
