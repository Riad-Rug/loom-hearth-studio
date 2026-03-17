import "server-only";

import {
  createOrderConfirmationEmailRequestFromCreatedOrder,
  createPostmarkEmailPayload,
} from "@/lib/email/helpers";
import { getPostmarkEmailConfig } from "@/lib/email/config";
import type {
  OrderConfirmationEmailRequest,
  OrderConfirmationEmailSendResult,
} from "@/lib/email/contracts";
import type { OrderCreationRequest } from "@/lib/order";
import type { Order } from "@/types/domain";

export async function sendOrderConfirmationEmail(
  request: OrderConfirmationEmailRequest | null,
): Promise<OrderConfirmationEmailSendResult> {
  if (!request) {
    return {
      status: "ignored",
      request: null,
      provider: "postmark",
      providerMessageId: null,
      missingConfig: [],
      message: "Order confirmation email request is required before delivery can be attempted.",
    };
  }

  const config = getPostmarkEmailConfig();

  if (config.status !== "ready" || !config.fromEmail || !config.serverToken) {
    return {
      status: "configuration-error",
      request,
      provider: config.provider,
      providerMessageId: null,
      missingConfig: config.missingConfig,
      message: "Postmark email delivery is not ready because required email config is missing.",
    };
  }

  const response = await fetch(config.sendEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": config.serverToken,
    },
    body: JSON.stringify(
      createPostmarkEmailPayload({
        fromEmail: config.fromEmail,
        request,
      }),
    ),
    cache: "no-store",
  });
  const data = (await response.json()) as {
    ErrorCode?: number;
    Message?: string;
    MessageID?: string;
  };

  if (!response.ok || !data.MessageID) {
    return {
      status: "api-error",
      request,
      provider: config.provider,
      providerMessageId: data.MessageID ?? null,
      missingConfig: config.missingConfig,
      message:
        data.Message ?? "Postmark confirmation email delivery failed at the provider boundary.",
    };
  }

  return {
    status: "sent",
    request,
    provider: config.provider,
    providerMessageId: data.MessageID,
    missingConfig: config.missingConfig,
    message: data.Message ?? "Postmark confirmation email sent.",
  };
}

export async function sendOrderConfirmationEmailFromCreatedOrder(input: {
  order: Pick<
    Order,
    "id" | "orderNumber" | "items" | "paymentStatus" | "shippingAddress" | "totalUsd" | "currency"
  >;
  orderCreationRequest: OrderCreationRequest | null;
}) {
  const handoff = createOrderConfirmationEmailRequestFromCreatedOrder(input);

  return sendOrderConfirmationEmail(handoff.request);
}
