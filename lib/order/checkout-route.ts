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
      title: "Guest checkout UI shell",
      body:
        "This slice implements the PRD checkout structure only. Payment, order creation, cart wiring, tax handling, email, and provider integrations remain unresolved.",
    },
    stepIndicators: input.checkoutSteps.map((item, index) => ({
      key: item.key,
      label: item.label,
      stateLabel:
        input.step !== "start" && currentStepIndex > index
          ? "Complete preview"
          : "Placeholder step",
      isActive: item.key === input.step,
      isComplete: input.step !== "start" && currentStepIndex > index,
    })),
    start: {
      title: input.hasCartItems ? "Checkout route shell" : "Your cart is empty",
      body: input.hasCartItems
        ? "Guest checkout is the only supported mode in the PRD. Use the step links below to move through the existing 5-step flow using the current client-side checkout state."
        : "Add at least one product before starting checkout. The checkout shell is available, but there is no active cart to submit.",
      actionLabel: input.hasCartItems ? "Start guest checkout" : "Return to shop",
      actionHref: input.hasCartItems ? "/checkout/information" : "/shop",
    },
    information: {
      note:
        "Guest email and shipping details are stored in local client state only for this slice.",
      actionLabel: "Continue to shipping",
    },
    shipping: {
      optionTitle: "Standard shipping",
      optionBody: "Launch markets: United States, Canada, Australia, and United Kingdom",
      optionPriceLabel: "$0.00",
      body:
        "Shipping is fixed at $0.00 for the launch markets in the PRD. Destination and delivery conditions still need to be confirmed before payment is captured. No shipping provider or rate calculation logic is implemented in this slice.",
      actionLabel: "Continue to payment",
    },
    payment: {
      body:
        "Stripe Checkout is the only supported launch path in this boundary layer. This step now reflects the hosted Checkout handoff state only. No payment capture, webhook handling, or order creation is implemented yet.",
      launchModeLabel: `Launch mode: Stripe ${input.stripePaymentDraft.launchMode}`,
      handoffLabel:
        "A successful Checkout session-creation result now hands off to hosted Stripe Checkout by redirecting the browser to the returned Checkout URL.",
      boundary: {
        modeLabel: `Mode: ${input.stripePaymentDraft.mode}`,
        statusLabel: `Status: ${input.stripePaymentDraft.paymentStepStatus}`,
        publishableKeyLabel: `Publishable key: ${
          input.stripePaymentDraft.publishableKeyReady
            ? "Configured"
            : "Missing placeholder env"
        }`,
        missingConfigLabel: input.stripePaymentDraft.missingConfig.length
          ? `Missing config: ${input.stripePaymentDraft.missingConfig.join(", ")}`
          : null,
        sessionResponseLabel: `Session response: ${
          input.stripePaymentDraft.checkoutSessionResponse
            ? input.stripePaymentDraft.checkoutSessionResponse.id
            : "Not created"
        }`,
        sessionResponseStatusLabel: `Session response status: ${
          input.stripePaymentDraft.checkoutSessionResponse?.status ?? "Not created"
        }`,
        paymentStatusLabel: `Payment status: ${input.stripePaymentDraft.paymentStatus}`,
        readinessLabel: `Review readiness: ${
          input.stripePaymentDraft.isReadyForPlaceholderFlow
            ? "Launch mode locked"
            : "Unavailable"
        }`,
      },
      checkoutService: {
        statusLabel: `Service status: ${input.stripePaymentDraft.checkoutService.status}`,
        endpointLabel: `Session endpoint: ${input.stripePaymentDraft.checkoutService.sessionEndpointPath}`,
        successUrlLabel: `Success URL: ${input.stripePaymentDraft.checkoutService.successUrl}`,
        cancelUrlLabel: `Cancel URL: ${input.stripePaymentDraft.checkoutService.cancelUrl}`,
        missingClientConfigLabel: input.stripePaymentDraft.checkoutService.missingClientConfig
          .length
          ? `Missing client config: ${input.stripePaymentDraft.checkoutService.missingClientConfig.join(", ")}`
          : null,
        missingServerConfigLabel: input.stripePaymentDraft.checkoutService.missingServerConfig
          .length
          ? `Missing server config: ${input.stripePaymentDraft.checkoutService.missingServerConfig.join(", ")}`
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
          ? `Missing server config: ${input.stripePaymentDraft.checkoutExecution.missingServerConfig.join(", ")}`
          : null,
      },
      executionAttempt: {
        stateLabel: `Execution attempt: ${input.checkoutExecutionAttempt.status}`,
        messageLabel: input.checkoutExecutionAttempt.message,
        redirectTargetLabel: input.checkoutExecutionAttempt.result?.redirectTarget
          ? `Redirect target handoff: ${input.checkoutExecutionAttempt.result.redirectTarget}`
          : null,
        actionLabel:
          input.checkoutExecutionAttempt.status === "submitting"
            ? "Creating Checkout session..."
            : input.checkoutExecutionAttempt.status === "success"
              ? "Redirecting to Stripe Checkout..."
              : "Create Checkout session",
      },
      checkoutSessionRequest: input.stripePaymentDraft.checkoutSessionRequest
        ? {
            customerEmailLabel: input.stripePaymentDraft.checkoutSessionRequest.customerEmail
              ? `Customer email: ${input.stripePaymentDraft.checkoutSessionRequest.customerEmail}`
              : "Customer email: not collected yet",
            lineItemsLabel: `Line items: ${input.stripePaymentDraft.checkoutSessionRequest.lineItems.length}`,
            totalLabel: `Checkout total: $${input.stripePaymentDraft.checkoutSessionRequest.totalUsd.toFixed(2)}`,
            emptyLabel: null,
          }
        : {
            customerEmailLabel: null,
            lineItemsLabel: null,
            totalLabel: null,
            emptyLabel: "Checkout session request will be prepared once cart items are present.",
          },
      actionLabel: "Continue to review",
    },
  };
}
