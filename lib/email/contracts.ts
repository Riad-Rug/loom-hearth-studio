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

export const orderConfirmationEmailTodo =
  "TODO: Replace the placeholder order confirmation email payload with a provider-backed template once email delivery is implemented.";
