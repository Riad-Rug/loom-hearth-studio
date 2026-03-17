import type { Order } from "@/types/domain";
import type { EmailMessage } from "@/lib/email/types";
import type { EmailMissingConfig } from "@/lib/email/config";
import type {
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order";

export type OrderConfirmationEmailPayload = {
  to: string;
  orderReference: OrderSubmissionPreview["orderReference"];
  customerName: string;
  shippingLabel: string;
  totalUsd: number;
  currency: "USD";
  itemCount: number;
};

export type OrderConfirmationEmailPreview = {
  status: "placeholder";
  subject: string;
  message: EmailMessage;
};

export type OrderConfirmationEmailRequest = {
  source: "created-order";
  orderId: Order["id"];
  orderNumber: Order["orderNumber"];
  to: string;
  customerName: string;
  shippingLabel: string | null;
  totalUsd: Order["totalUsd"];
  currency: Order["currency"];
  itemCount: number;
  paymentStatus: Extract<Order["paymentStatus"], "paid">;
  message: EmailMessage;
};

export type OrderConfirmationEmailDeliveryResult = {
  status: "ready" | "ignored" | "configuration-error";
  request: OrderConfirmationEmailRequest | null;
  message: string;
};

export type OrderConfirmationEmailBoundary = {
  source: "order-creation";
  deliveryProvider: "postmark";
  status: "ready-placeholder";
  acceptedPaymentStatuses: ReadonlyArray<Extract<Order["paymentStatus"], "paid">>;
};

export type PostmarkEmailPayload = {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody?: string;
  MessageStream: "outbound";
};

export type OrderConfirmationEmailSendResult = {
  status: "sent" | "ignored" | "configuration-error" | "api-error";
  request: OrderConfirmationEmailRequest | null;
  provider: "postmark";
  providerMessageId: string | null;
  missingConfig: EmailMissingConfig[];
  message: string;
};

export const orderConfirmationEmailTodo =
  "TODO: Replace the placeholder order confirmation email payload with a provider-backed template once email delivery is implemented.";

export const orderConfirmationEmailHandoffTodo = {
  boundary:
    "TODO: Keep confirmation email delivery scoped to created paid orders only.",
  provider:
    "TODO: Keep Postmark delivery limited to transactional confirmation email only until broader email requirements are validated.",
  sideEffects:
    "TODO: Keep confirmation email delivery separate from fulfillment and other post-order side effects.",
} as const;
