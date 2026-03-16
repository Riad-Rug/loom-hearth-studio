import type { Order } from "@/types/domain";
import type { EmailMessage } from "@/lib/email/types";
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
  deliveryProvider: "unconfigured";
  status: "ready-placeholder";
  acceptedPaymentStatuses: ReadonlyArray<Extract<Order["paymentStatus"], "paid">>;
};

export const orderConfirmationEmailTodo =
  "TODO: Replace the placeholder order confirmation email payload with a provider-backed template once email delivery is implemented.";

export const orderConfirmationEmailHandoffTodo = {
  boundary:
    "TODO: Keep confirmation email delivery scoped to created paid orders only until provider wiring is implemented.",
  provider:
    "TODO: Hand the confirmation email request to a real provider service only after the email provider is selected.",
  sideEffects:
    "TODO: Keep confirmation email delivery separate from fulfillment and other post-order side effects.",
} as const;
