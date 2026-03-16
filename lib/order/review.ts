import type { OrderSubmissionFailure, OrderSubmissionPayload, OrderSubmissionPreview } from "@/lib/order";
import type { StripeCheckoutPaymentDraft } from "@/lib/stripe";
import type { OrderDraft } from "@/features/checkout/checkout-provider";

export type CheckoutReviewViewModel = {
  shippingAddressLines: string[] | null;
  shippingMethodLabel: string;
  paymentLabel: string;
  submissionBoundary: {
    emailLabel: string | null;
    itemCountLabel: string | null;
    paymentMethodLabel: string | null;
    paymentStatusLabel: string | null;
    emptyLabel: string | null;
  };
  submissionAttempt: {
    stateLabel: string;
    failureMessage: string | null;
    previewReference: string | null;
  };
  placeOrderLabel: string;
  stripeBoundary: {
    modeLabel: string;
    statusLabel: string;
  };
};

export function createCheckoutReviewViewModel(input: {
  orderDraft: Pick<OrderDraft, "shippingAddress" | "shippingMethod" | "paymentMethod">;
  orderSubmissionPayload: OrderSubmissionPayload | null;
  submissionFailure: OrderSubmissionFailure | null;
  submissionPreview: OrderSubmissionPreview | null;
  submissionState: "idle" | "submitting" | "success" | "failure";
  stripePaymentDraft: Pick<StripeCheckoutPaymentDraft, "mode" | "paymentStepStatus">;
}): CheckoutReviewViewModel {
  const { orderDraft, orderSubmissionPayload } = input;

  return {
    shippingAddressLines: orderDraft.shippingAddress
      ? [
          orderDraft.shippingAddress.fullName,
          orderDraft.shippingAddress.address1,
          ...(orderDraft.shippingAddress.address2 ? [orderDraft.shippingAddress.address2] : []),
          `${orderDraft.shippingAddress.city}, ${orderDraft.shippingAddress.state} ${orderDraft.shippingAddress.postalCode}`,
          "United States",
          orderDraft.shippingAddress.email,
        ]
      : null,
    shippingMethodLabel: orderDraft.shippingMethod
      ? `${orderDraft.shippingMethod.label} ($0.00)`
      : "Standard shipping will be set in the shipping step.",
    paymentLabel:
      orderDraft.paymentMethod === "stripe-placeholder"
        ? "Stripe placeholder boundary preserved for a future payment slice."
        : "",
    submissionBoundary: orderSubmissionPayload
      ? {
          emailLabel: `Email: ${orderSubmissionPayload.email}`,
          itemCountLabel: `Items: ${orderSubmissionPayload.items.length}`,
          paymentMethodLabel: `Payment method: ${orderSubmissionPayload.paymentMethod}`,
          paymentStatusLabel: `Status: ${orderSubmissionPayload.paymentStatus}`,
          emptyLabel: null,
        }
      : {
          emailLabel: null,
          itemCountLabel: null,
          paymentMethodLabel: null,
          paymentStatusLabel: null,
          emptyLabel: "Submission payload requires completed guest shipping details.",
        },
    submissionAttempt: {
      stateLabel: input.submissionState,
      failureMessage: input.submissionFailure?.message ?? null,
      previewReference: input.submissionPreview?.orderReference ?? null,
    },
    placeOrderLabel:
      input.submissionState === "submitting"
        ? "Submitting placeholder..."
        : "Place order UI placeholder",
    stripeBoundary: {
      modeLabel: input.stripePaymentDraft.mode ?? "Undecided placeholder",
      statusLabel: input.stripePaymentDraft.paymentStepStatus,
    },
  };
}
