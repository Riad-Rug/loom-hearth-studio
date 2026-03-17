import "server-only";

import { Prisma } from "@prisma/client";

import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { OrderRepository } from "@/lib/db/repositories/order-repository";
import type { PersistConfirmedOrderResult } from "@/lib/order/contracts";
import {
  createOrderCreationRequestFromStripeConfirmation,
  createOrderPersistenceRequestFromOrderCreation,
} from "@/lib/order/helpers";
import type { StripeCheckoutPaymentConfirmation } from "@/lib/stripe";

export async function persistConfirmedStripeCheckoutOrder(input: {
  confirmation: StripeCheckoutPaymentConfirmation | null;
  repository?: OrderRepository;
}): Promise<PersistConfirmedOrderResult> {
  const repository = input.repository ?? createOrderRepository();
  const orderCreationResult = createOrderCreationRequestFromStripeConfirmation(
    input.confirmation,
  );

  if (orderCreationResult.status !== "ready" || !orderCreationResult.request) {
    return {
      status:
        orderCreationResult.status === "configuration-error"
          ? "configuration-error"
          : "ignored",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: null,
      persistedOrder: null,
      message: orderCreationResult.message,
    };
  }

  const existingOrder = await repository.getByCheckoutSessionId(
    orderCreationResult.request.checkoutSessionId,
  );

  if (existingOrder) {
    return {
      status: "already-persisted",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: null,
      persistedOrder: existingOrder,
      message: "Stripe Checkout session was already persisted as a launch order.",
    };
  }

  const persistenceResult = createOrderPersistenceRequestFromOrderCreation(
    orderCreationResult.request,
  );

  if (persistenceResult.status !== "ready" || !persistenceResult.request) {
    return {
      status:
        persistenceResult.status === "configuration-error"
          ? "configuration-error"
          : "ignored",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: persistenceResult.request,
      persistedOrder: persistenceResult.persistedOrder,
      message: persistenceResult.message,
    };
  }

  try {
    const persistedOrder = await repository.create(persistenceResult.request);

    return {
      status: "created",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: persistenceResult.request,
      persistedOrder,
      message: "Confirmed paid Stripe Checkout event persisted a real launch order.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicatedOrder = await repository.getByCheckoutSessionId(
        orderCreationResult.request.checkoutSessionId,
      );

      if (duplicatedOrder) {
        return {
          status: "already-persisted",
          orderCreationRequest: orderCreationResult.request,
          persistenceRequest: persistenceResult.request,
          persistedOrder: duplicatedOrder,
          message: "Stripe Checkout session was already persisted as a launch order.",
        };
      }
    }

    throw error;
  }
}
