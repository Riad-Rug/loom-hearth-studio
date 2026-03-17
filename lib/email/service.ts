import "server-only";

import type {
  OrderConfirmationEmailRequest,
  OrderConfirmationEmailSendResult,
} from "@/lib/email/contracts";
import { getPostmarkEmailConfig } from "@/lib/email/config";
import { createOrderConfirmationEmailRequestFromCreatedOrder } from "@/lib/email/helpers";
import type { OrderCreationRequest } from "@/lib/order";
import type { Order } from "@/types/domain";
import type { EmailDeliveryResult, EmailMessage } from "@/lib/email/types";

export async function sendTransactionalEmailMessage(
  message: EmailMessage | null,
): Promise<EmailDeliveryResult> {
  if (!message) {
    return {
      status: "api-error",
      provider: "postmark",
      providerMessageId: null,
      missingConfig: [],
      message: "Transactional email message is required before delivery can be attempted.",
    };
  }

  const config = getPostmarkEmailConfig();

  if (config.status !== "ready" || !config.fromEmail || !config.serverToken) {
    return {
      status: "configuration-error",
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
    body: JSON.stringify({
      From: config.fromEmail,
      To: message.to,
      Subject: message.subject,
      HtmlBody: message.html,
      TextBody: message.text,
      MessageStream: "outbound",
    }),
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
      provider: config.provider,
      providerMessageId: data.MessageID ?? null,
      missingConfig: config.missingConfig,
      message: data.Message ?? "Postmark transactional email delivery failed at the provider boundary.",
    };
  }

  return {
    status: "sent",
    provider: config.provider,
    providerMessageId: data.MessageID,
    missingConfig: config.missingConfig,
    message: data.Message ?? "Postmark transactional email sent.",
  };
}

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

  const deliveryResult = await sendTransactionalEmailMessage(
    request
      ? {
          to: request.to,
          subject: request.message.subject,
          html: request.message.html,
          text: request.message.text,
        }
      : null,
  );

  if (deliveryResult.status !== "sent") {
    return {
      status:
        deliveryResult.status === "configuration-error"
          ? "configuration-error"
          : "api-error",
      request,
      provider: deliveryResult.provider,
      providerMessageId: deliveryResult.providerMessageId,
      missingConfig: deliveryResult.missingConfig,
      message: deliveryResult.message,
    };
  }

  return {
    status: "sent",
    request,
    provider: deliveryResult.provider,
    providerMessageId: deliveryResult.providerMessageId,
    missingConfig: deliveryResult.missingConfig,
    message: deliveryResult.message,
  };
}

export async function sendOrderConfirmationEmailFromCreatedOrder(input: {
  order: Pick<
    Order,
    | "id"
    | "orderNumber"
    | "items"
    | "paymentStatus"
    | "shippingAddress"
    | "totalUsd"
    | "currency"
    | "placedAt"
  >;
  orderCreationRequest: OrderCreationRequest | null;
}) {
  const handoff = createOrderConfirmationEmailRequestFromCreatedOrder(input);

  return sendOrderConfirmationEmail(handoff.request);
}
