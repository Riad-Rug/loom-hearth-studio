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
      : "Standard shipping will be confirmed in the shipping step.",
    paymentLabel: "Secure payment through Stripe Checkout",
    submissionBoundary: orderSubmissionPayload
      ? {
          emailLabel: `Email: ${orderSubmissionPayload.email}`,
          itemCountLabel: `Items: ${orderSubmissionPayload.items.length}`,
          paymentMethodLabel: "Payment method: Stripe Checkout",
          paymentStatusLabel: `Status: ${orderSubmissionPayload.paymentStatus}`,
          emptyLabel: null,
        }
      : {
          emailLabel: null,
          itemCountLabel: null,
          paymentMethodLabel: null,
          paymentStatusLabel: null,
          emptyLabel: "Complete your shipping details before continuing.",
        },
    submissionAttempt: {
      stateLabel: input.submissionState,
      failureMessage: input.submissionFailure?.message ?? null,
      previewReference: input.submissionPreview?.orderReference ?? null,
    },
    placeOrderLabel:
      input.submissionState === "submitting"
        ? "Preparing confirmation..."
        : "Confirm details",
    stripeBoundary: {
      modeLabel: input.stripePaymentDraft.mode ?? "checkout",
      statusLabel: input.stripePaymentDraft.paymentStepStatus,
    },
  };
}
