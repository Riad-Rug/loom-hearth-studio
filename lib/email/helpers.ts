import type {
  OrderConfirmationEmailPayload,
  OrderConfirmationEmailPreview,
} from "@/lib/email/contracts";
import type {
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order";

export function createOrderConfirmationEmailPayload(input: {
  submissionPayload: OrderSubmissionPayload | null;
  submissionPreview: OrderSubmissionPreview | null;
}): OrderConfirmationEmailPayload | null {
  const { submissionPayload, submissionPreview } = input;

  if (!submissionPayload || !submissionPreview) {
    return null;
  }

  return {
    to: submissionPayload.email,
    orderReference: submissionPreview.orderReference,
    customerName: submissionPayload.shippingAddress.fullName,
    shippingLabel: submissionPayload.shippingMethod.label,
    totalUsd: submissionPayload.totalUsd,
    currency: submissionPayload.currency,
    itemCount: submissionPayload.items.reduce(
      (runningTotal, item) => runningTotal + item.quantity,
      0,
    ),
  };
}

export function createOrderConfirmationEmailPreview(
  payload: OrderConfirmationEmailPayload | null,
): OrderConfirmationEmailPreview | null {
  if (!payload) {
    return null;
  }

  return {
    status: "placeholder",
    subject: `Order confirmation ${payload.orderReference}`,
    message: {
      to: payload.to,
      subject: `Order confirmation ${payload.orderReference}`,
      html: `<p>Placeholder order confirmation for ${payload.customerName}.</p>`,
      text: `Placeholder order confirmation for ${payload.customerName}.`,
    },
  };
}
