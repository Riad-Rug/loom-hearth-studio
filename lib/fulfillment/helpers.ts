import type { Order } from "@/types/domain";

import type {
  FulfillmentOrchestrationBoundary,
  ManualFulfillmentExecution,
  FulfillmentOrchestrationRequest,
  FulfillmentOrchestrationResult,
  FulfillmentOrchestrationTrigger,
} from "@/lib/fulfillment/contracts";

export function createFulfillmentOrchestrationBoundary(): FulfillmentOrchestrationBoundary {
  return {
    service: "LaunchFulfillmentOrchestrator",
    status: "manual-ready",
    acceptedTriggers: ["persisted-paid-order", "admin-status-update"],
    acceptedOrderStatuses: [
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
  };
}

export function createFulfillmentOrchestrationRequest(input: {
  trigger: FulfillmentOrchestrationTrigger;
  order: Pick<Order, "id" | "orderNumber" | "status" | "paymentStatus" | "shippingAddress"> | null;
}): FulfillmentOrchestrationResult {
  const boundary = createFulfillmentOrchestrationBoundary();
  const { order } = input;

  if (!order) {
    return {
      status: "ignored",
      request: null,
      execution: null,
      message: "Persisted order is required before fulfillment orchestration can be prepared.",
    };
  }

  if (!boundary.acceptedTriggers.includes(input.trigger)) {
    return {
      status: "ignored",
      request: null,
      execution: null,
      message: "Fulfillment orchestration trigger is not supported in this launch boundary.",
    };
  }

  if (!boundary.acceptedOrderStatuses.includes(order.status as FulfillmentOrchestrationBoundary["acceptedOrderStatuses"][number])) {
    return {
      status: "ignored",
      request: null,
      execution: null,
      message: `Order status ${order.status} does not hand off into launch fulfillment orchestration.`,
    };
  }

  const request: FulfillmentOrchestrationRequest = {
    trigger: input.trigger,
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    customerEmail: order.shippingAddress.email,
  };
  const execution = createManualFulfillmentExecution({
    trigger: input.trigger,
    orderStatus: order.status,
  });

  return {
    status: "recorded",
    request,
    execution,
    message: "Persisted order is ready to record a manual fulfillment execution.",
  };
}

function createManualFulfillmentExecution(input: {
  trigger: FulfillmentOrchestrationTrigger;
  orderStatus: Order["status"];
}): ManualFulfillmentExecution {
  if (input.trigger === "persisted-paid-order" || input.orderStatus === "paid") {
    return {
      actionKey: "manual-review-queue",
      actionLabel: "Queue manual order review",
      resultLabel: "Manual fulfillment review recorded",
      notes:
        "Review the paid order details, confirm stock readiness, and move the order into manual processing when ready.",
    };
  }

  if (input.orderStatus === "processing") {
    return {
      actionKey: "manual-processing-queue",
      actionLabel: "Queue manual processing work",
      resultLabel: "Manual processing task recorded",
      notes:
        "Prepare and pack this order through the launch manual fulfillment workflow. No shipping-provider integration is expected.",
    };
  }

  if (input.orderStatus === "shipped") {
    return {
      actionKey: "manual-shipment-followup",
      actionLabel: "Record manual shipment follow-up",
      resultLabel: "Manual shipment follow-up recorded",
      notes:
        "Update any manual shipment notes and customer communication outside the provider-free launch admin flow.",
    };
  }

  if (input.orderStatus === "delivered") {
    return {
      actionKey: "manual-closeout",
      actionLabel: "Close manual fulfillment",
      resultLabel: "Manual fulfillment closeout recorded",
      notes:
        "Mark the launch manual fulfillment work complete and retain the order for any support follow-up.",
    };
  }

  return {
    actionKey: "manual-stop-work",
    actionLabel: "Stop manual fulfillment work",
    resultLabel: "Manual fulfillment stop recorded",
    notes:
      "Remove the order from the active manual fulfillment queue because the order is cancelled or refunded.",
  };
}
