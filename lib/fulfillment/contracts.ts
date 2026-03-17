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

export type ManualFulfillmentExecution = {
  actionKey:
    | "manual-review-queue"
    | "manual-processing-queue"
    | "manual-shipment-followup"
    | "manual-closeout"
    | "manual-stop-work";
  actionLabel: string;
  resultLabel: string;
  notes: string;
  createdAt?: string;
};

export type FulfillmentOrchestrationResult = {
  status: "recorded" | "already-recorded" | "ignored";
  request: FulfillmentOrchestrationRequest | null;
  execution: ManualFulfillmentExecution | null;
  message: string;
};

export type FulfillmentOrchestrationBoundary = {
  service: "LaunchFulfillmentOrchestrator";
  status: "manual-ready";
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
    "Launch fulfillment orchestration is limited to manual operational execution records from persisted paid orders and admin status updates.",
  sideEffects:
    "Manual fulfillment remains launch-safe and provider-free. Shipping APIs, tracking sync, labels, and broader post-payment automation remain out of scope.",
} as const;
