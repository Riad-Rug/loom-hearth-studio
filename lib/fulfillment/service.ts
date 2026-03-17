import "server-only";

import type { Order } from "@/types/domain";

import type { FulfillmentOrchestrationResult } from "@/lib/fulfillment/contracts";
import { createFulfillmentOrchestrationRequest } from "@/lib/fulfillment/helpers";

export async function orchestrateLaunchOrderFulfillment(input: {
  trigger: "persisted-paid-order" | "admin-status-update";
  order: Pick<Order, "id" | "orderNumber" | "status" | "paymentStatus" | "shippingAddress"> | null;
}): Promise<FulfillmentOrchestrationResult> {
  const handoff = createFulfillmentOrchestrationRequest(input);

  return handoff.status === "ready"
    ? {
        ...handoff,
        message:
          input.trigger === "persisted-paid-order"
            ? "Persisted paid order handed off into the launch fulfillment orchestration boundary."
            : "Admin status update handed off into the launch fulfillment orchestration boundary.",
      }
    : handoff;
}
