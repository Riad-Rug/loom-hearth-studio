import "server-only";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db/client";
import type { Order } from "@/types/domain";

import type { FulfillmentOrchestrationResult } from "@/lib/fulfillment/contracts";
import { createFulfillmentOrchestrationRequest } from "@/lib/fulfillment/helpers";

export async function orchestrateLaunchOrderFulfillment(input: {
  trigger: "persisted-paid-order" | "admin-status-update";
  order: Pick<Order, "id" | "orderNumber" | "status" | "paymentStatus" | "shippingAddress"> | null;
}): Promise<FulfillmentOrchestrationResult> {
  const handoff = createFulfillmentOrchestrationRequest(input);

  if (handoff.status === "ignored" || !handoff.request || !handoff.execution) {
    return handoff;
  }

  try {
    await db.fulfillmentExecutionRecord.create({
      data: {
        orderId: handoff.request.orderId,
        trigger: handoff.request.trigger,
        orderStatus: handoff.request.orderStatus,
        actionKey: handoff.execution.actionKey,
        actionLabel: handoff.execution.actionLabel,
        resultLabel: handoff.execution.resultLabel,
        notes: handoff.execution.notes,
      },
    });

    return {
      status: "recorded",
      request: handoff.request,
      execution: {
        ...handoff.execution,
        createdAt: new Date().toISOString(),
      },
      message:
        input.trigger === "persisted-paid-order"
          ? "Confirmed paid order recorded a real manual fulfillment action for launch operations."
          : "Admin status update recorded a real manual fulfillment action for launch operations.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingRecord = await db.fulfillmentExecutionRecord.findFirst({
        where: {
          orderId: handoff.request.orderId,
          trigger: handoff.request.trigger,
          orderStatus: handoff.request.orderStatus,
        },
      });

      if (existingRecord) {
        return {
          status: "already-recorded",
          request: handoff.request,
          execution: {
            actionKey: existingRecord.actionKey as typeof handoff.execution.actionKey,
            actionLabel: existingRecord.actionLabel,
            resultLabel: existingRecord.resultLabel,
            notes: existingRecord.notes,
            createdAt: existingRecord.createdAt.toISOString(),
          },
          message: "Manual fulfillment action was already recorded for this launch event.",
        };
      }
    }

    throw error;
  }
}
