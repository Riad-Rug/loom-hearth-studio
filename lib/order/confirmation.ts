import {
  createOrderConfirmationEmailPresentation,
  type OrderConfirmationEmailPayload,
  type OrderConfirmationEmailPreview,
} from "@/lib/email";
import type {
  OrderSubmissionAttemptState,
  OrderSubmissionPreview,
} from "@/lib/order/contracts";

export type CheckoutConfirmationViewModel = {
  headline: string;
  customerLabel: string;
  submissionStateLabel: string;
  orderReference: string | null;
  body: string;
  failureMessage: string | null;
  paymentStatusLabel: string | null;
  shippingLabel: string | null;
  emailBoundary: ReturnType<typeof createOrderConfirmationEmailPresentation>;
};

export function createCheckoutConfirmationViewModel(input: {
  submissionAttempt: OrderSubmissionAttemptState;
  submissionPreview: OrderSubmissionPreview | null;
  orderConfirmationEmailPayload: OrderConfirmationEmailPayload | null;
  orderConfirmationEmailPreview: OrderConfirmationEmailPreview | null;
  customerName: string | null;
  shippingLabel: string | null;
}): CheckoutConfirmationViewModel {
  const { submissionAttempt, submissionPreview } = input;
  const isFailure = submissionAttempt.status === "failure";

  return {
    headline: isFailure ? "We couldn't complete your request" : "Order request received",
    customerLabel: input.customerName ?? "Guest checkout",
    submissionStateLabel: submissionAttempt.status,
    orderReference: submissionPreview?.orderReference ?? null,
    body: isFailure
      ? "Please review your checkout details and try again, or contact the studio directly for help."
      : "We have recorded your details. You will receive an email update with pre-shipment verification and next steps before payment is captured.",
    failureMessage: submissionAttempt.failure?.message ?? null,
    paymentStatusLabel: submissionPreview?.paymentStatus ?? null,
    shippingLabel: input.shippingLabel,
    emailBoundary: createOrderConfirmationEmailPresentation({
      payload: input.orderConfirmationEmailPayload,
      preview: input.orderConfirmationEmailPreview,
    }),
  };
}
