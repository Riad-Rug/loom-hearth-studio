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

  return {
    headline:
      submissionAttempt.status === "failure"
        ? "Order submission attempt failed"
        : submissionPreview?.confirmationLabel ?? "Order draft confirmation UI shell",
    customerLabel: input.customerName ?? "Guest checkout draft",
    submissionStateLabel: submissionAttempt.status,
    orderReference: submissionPreview?.orderReference ?? null,
    body:
      "Confirmation, order submission, payment execution, and email delivery are not implemented in this slice. This page exists to complete the PRD checkout flow shell with client-side draft state only.",
    failureMessage: submissionAttempt.failure?.message ?? null,
    paymentStatusLabel: submissionPreview?.paymentStatus ?? null,
    shippingLabel: input.shippingLabel,
    emailBoundary: createOrderConfirmationEmailPresentation({
      payload: input.orderConfirmationEmailPayload,
      preview: input.orderConfirmationEmailPreview,
    }),
  };
}
