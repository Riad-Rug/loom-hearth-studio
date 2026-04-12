import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import type {
  StripeCheckoutExecutionAttemptState,
  StripeCheckoutPaymentDraft,
} from "@/lib/stripe";

export type CheckoutStepIndicatorView = {
  key: Exclude<CheckoutStepKey, "start">;
  label: string;
  stateLabel: string;
  isActive: boolean;
  isComplete: boolean;
};

export type CheckoutNonConfirmationRouteViewModel = {
  shell: {
    eyebrow: string;
    title: string;
    body: string;
  };
  stepIndicators: CheckoutStepIndicatorView[];
  start: {
    title: string;
    body: string;
    actionLabel: string;
    actionHref: string;
  };
  information: {
    note: string;
    actionLabel: string;
  };
  shipping: {
    optionTitle: string;
    optionBody: string;
    optionPriceLabel: string;
    body: string;
    actionLabel: string;
  };
  payment: {
    body: string;
    launchModeLabel: string;
    handoffLabel: string;
    boundary: {
      modeLabel: string;
      statusLabel: string;
      publishableKeyLabel: string;
      missingConfigLabel: string | null;
      sessionResponseLabel: string;
      sessionResponseStatusLabel: string;
      paymentStatusLabel: string;
      readinessLabel: string;
    };
    checkoutService: {
      statusLabel: string;
      endpointLabel: string;
      successUrlLabel: string;
      cancelUrlLabel: string;
      missingClientConfigLabel: string | null;
      missingServerConfigLabel: string | null;
    };
    checkoutExecution: {
      statusLabel: string;
      endpointLabel: string;
      redirectTargetLabel: string | null;
      missingServerConfigLabel: string | null;
    };
    executionAttempt: {
      stateLabel: string;
      messageLabel: string | null;
      redirectTargetLabel: string | null;
      actionLabel: string;
    };
    checkoutSessionRequest: {
      customerEmailLabel: string | null;
      lineItemsLabel: string | null;
      totalLabel: string | null;
      emptyLabel: string | null;
    };
    actionLabel: string;
  };
};

export function createCheckoutNonConfirmationRouteViewModel(input: {
  step: CheckoutStepKey;
  checkoutSteps: ReadonlyArray<{
    key: Exclude<CheckoutStepKey, "start">;
    label: string;
  }>;
  hasCartItems: boolean;
  canAccessShipping: boolean;
  canAccessReview: boolean;
  checkoutExecutionAttempt: StripeCheckoutExecutionAttemptState;
  stripePaymentDraft: Pick<
    StripeCheckoutPaymentDraft,
    | "mode"
    | "launchMode"
    | "paymentStepStatus"
    | "publishableKeyReady"
    | "missingConfig"
    | "checkoutService"
    | "checkoutExecution"
    | "checkoutSessionRequest"
    | "checkoutSessionResponse"
    | "paymentStatus"
    | "isReadyForPlaceholderFlow"
  >;
}): CheckoutNonConfirmationRouteViewModel {
  const currentStepIndex = input.checkoutSteps.findIndex(
    (candidate) => candidate.key === input.step,
  );

  return {
    shell: {
      eyebrow: "Checkout",
      title: "Secure checkout",
      body:
        "Review your order details, confirm your shipping information, and continue to secure payment. Final delivery details are confirmed before payment is captured.",
    },
    stepIndicators: input.checkoutSteps.map((item, index) => ({
      key: item.key,
      label: item.label,
      stateLabel:
        input.step !== "start" && currentStepIndex > index
          ? "Complete"
          : item.key === input.step
            ? "Current step"
            : "Next",
      isActive: item.key === input.step,
      isComplete: input.step !== "start" && currentStepIndex > index,
    })),
    start: {
      title: input.hasCartItems ? "Ready to check out" : "Your cart is empty",
      body: input.hasCartItems
        ? "Continue to checkout to confirm your details, review delivery information, and move to secure payment."
        : "Add a product to your cart before starting checkout.",
      actionLabel: input.hasCartItems ? "Start checkout" : "Return to shop",
      actionHref: input.hasCartItems ? "/checkout/information" : "/shop",
    },
    information: {
      note:
        "We use these details to prepare your delivery review, secure payment handoff, and follow-up confirmation.",
      actionLabel: "Continue to shipping",
    },
    shipping: {
      optionTitle: "Standard shipping",
      optionBody: "Available for the United States, Canada, Australia, and the United Kingdom",
      optionPriceLabel: "$0.00",
      body:
        "Shipping and destination details are reviewed before payment is captured. If any delivery conditions need clarification, we confirm them by email before finalizing the order.",
      actionLabel: "Continue to payment review",
    },
    payment: {
      body:
        "Payment is handled through secure Stripe Checkout. After checkout, we confirm your order details, destination, and next steps by email before payment is captured.",
      launchModeLabel: "Secure Stripe Checkout",
      handoffLabel:
        "You will be redirected to Stripe to review your payment details and complete checkout securely.",
      boundary: {
        modeLabel: `Checkout mode: ${input.stripePaymentDraft.mode}`,
        statusLabel: `Checkout status: ${input.stripePaymentDraft.paymentStepStatus}`,
        publishableKeyLabel: `Payment configuration: ${
          input.stripePaymentDraft.publishableKeyReady ? "Ready" : "Needs setup"
        }`,
        missingConfigLabel: input.stripePaymentDraft.missingConfig.length
          ? `Additional setup required: ${input.stripePaymentDraft.missingConfig.join(", ")}`
          : null,
        sessionResponseLabel: `Checkout session: ${
          input.stripePaymentDraft.checkoutSessionResponse
            ? input.stripePaymentDraft.checkoutSessionResponse.id
            : "Not created yet"
        }`,
        sessionResponseStatusLabel: `Session status: ${
          input.stripePaymentDraft.checkoutSessionResponse?.status ?? "Not created yet"
        }`,
        paymentStatusLabel: `Payment status: ${input.stripePaymentDraft.paymentStatus}`,
        readinessLabel: `Review step: ${
          input.stripePaymentDraft.isReadyForPlaceholderFlow ? "Available" : "Unavailable"
        }`,
      },
      checkoutService: {
        statusLabel: `Service status: ${input.stripePaymentDraft.checkoutService.status}`,
        endpointLabel: `Checkout endpoint: ${input.stripePaymentDraft.checkoutService.sessionEndpointPath}`,
        successUrlLabel: `Success URL: ${input.stripePaymentDraft.checkoutService.successUrl}`,
        cancelUrlLabel: `Cancel URL: ${input.stripePaymentDraft.checkoutService.cancelUrl}`,
        missingClientConfigLabel: input.stripePaymentDraft.checkoutService.missingClientConfig
          .length
          ? `Client setup required: ${input.stripePaymentDraft.checkoutService.missingClientConfig.join(", ")}`
          : null,
        missingServerConfigLabel: input.stripePaymentDraft.checkoutService.missingServerConfig
          .length
          ? `Server setup required: ${input.stripePaymentDraft.checkoutService.missingServerConfig.join(", ")}`
          : null,
      },
      checkoutExecution: {
        statusLabel: `Execution status: ${input.stripePaymentDraft.checkoutExecution.status}`,
        endpointLabel: `Execution endpoint: ${input.stripePaymentDraft.checkoutExecution.endpointPath}`,
        redirectTargetLabel: input.stripePaymentDraft.checkoutExecution.redirectTarget
          ? `Redirect target: ${input.stripePaymentDraft.checkoutExecution.redirectTarget}`
          : null,
        missingServerConfigLabel: input.stripePaymentDraft.checkoutExecution.missingServerConfig
          .length
          ? `Server setup required: ${input.stripePaymentDraft.checkoutExecution.missingServerConfig.join(", ")}`
          : null,
      },
      executionAttempt: {
        stateLabel:
          input.checkoutExecutionAttempt.status === "success"
            ? "Checkout session ready"
            : input.checkoutExecutionAttempt.status === "submitting"
              ? "Preparing secure checkout"
              : input.checkoutExecutionAttempt.status === "failure"
                ? "Checkout unavailable"
                : "Ready when you are",
        messageLabel: input.checkoutExecutionAttempt.message,
        redirectTargetLabel: input.checkoutExecutionAttempt.result?.redirectTarget
          ? `Redirect target: ${input.checkoutExecutionAttempt.result.redirectTarget}`
          : null,
        actionLabel:
          input.checkoutExecutionAttempt.status === "submitting"
            ? "Preparing secure checkout..."
            : input.checkoutExecutionAttempt.status === "success"
              ? "Continue to Stripe..."
              : "Continue to secure payment",
      },
      checkoutSessionRequest: input.stripePaymentDraft.checkoutSessionRequest
        ? {
            customerEmailLabel: input.stripePaymentDraft.checkoutSessionRequest.customerEmail
              ? `Email: ${input.stripePaymentDraft.checkoutSessionRequest.customerEmail}`
              : "Email will be added at checkout",
            lineItemsLabel: `Items: ${input.stripePaymentDraft.checkoutSessionRequest.lineItems.length}`,
            totalLabel: `Total: $${input.stripePaymentDraft.checkoutSessionRequest.totalUsd.toFixed(2)}`,
            emptyLabel: null,
          }
        : {
            customerEmailLabel: null,
            lineItemsLabel: null,
            totalLabel: null,
            emptyLabel: "Checkout details will appear here once your cart is ready.",
          },
      actionLabel: "Continue to final review",
    },
  };
}
