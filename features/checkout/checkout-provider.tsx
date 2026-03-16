"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartStoreItem } from "@/features/cart/cart-provider";
import { useCart } from "@/features/cart/cart-provider";
import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import type { OrderSubmissionAttemptState, OrderSubmissionFailure, OrderSubmissionPreview } from "@/lib/order";
import {
  createStripeCheckoutPaymentDraft,
  createStripeOrderPaymentInput,
  initialStripeCheckoutExecutionAttemptState,
  requestStripeCheckoutSessionCreation,
  type StripeCheckoutExecutionAttemptState,
  type StripeCheckoutPaymentDraft,
  type StripeOrderPaymentInput,
  type StripePaymentMethod,
} from "@/lib/stripe";
import type { OrderAddress } from "@/types/domain";

const CHECKOUT_STORAGE_KEY = "loom-hearth-studio.checkout";

type CheckoutInformation = Pick<
  OrderAddress,
  "email" | "fullName" | "address1" | "address2" | "city" | "state" | "postalCode"
> & {
  country: "US";
};

type CheckoutShippingMethod = {
  id: "standard";
  label: "Standard shipping";
  market: "US";
  priceUsd: 0;
};

export type OrderDraft = {
  checkoutMode: "guest";
  items: CartStoreItem[];
  shippingAddress: OrderAddress | null;
  shippingMethod: CheckoutShippingMethod | null;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: 0;
  totalUsd: number;
  currency: "USD";
  paymentMethod: StripePaymentMethod;
};

type StoredCheckoutState = {
  information: CheckoutInformation;
  shippingMethod: CheckoutShippingMethod | null;
};

type CheckoutContextValue = {
  information: CheckoutInformation;
  shippingMethod: CheckoutShippingMethod | null;
  currentStep: CheckoutStepKey;
  canAccessShipping: boolean;
  canAccessPayment: boolean;
  canAccessReview: boolean;
  canAccessConfirmation: boolean;
  orderDraft: OrderDraft;
  stripeOrderPaymentInput: StripeOrderPaymentInput;
  stripePaymentDraft: StripeCheckoutPaymentDraft;
  checkoutExecutionAttempt: StripeCheckoutExecutionAttemptState;
  submissionAttempt: OrderSubmissionAttemptState;
  submissionPreview: OrderSubmissionPreview | null;
  updateInformation: (
    field: keyof CheckoutInformation,
    value: CheckoutInformation[keyof CheckoutInformation],
  ) => void;
  continueFromInformation: () => void;
  continueFromShipping: () => void;
  executeCheckoutSession: () => Promise<void>;
  continueFromPayment: () => void;
  continueFromReview: (input: {
    submissionPreview: OrderSubmissionPreview | null;
    submissionFailure: OrderSubmissionFailure | null;
  }) => void;
};

const defaultShippingMethod: CheckoutShippingMethod = {
  id: "standard",
  label: "Standard shipping",
  market: "US",
  priceUsd: 0,
};

const initialInformation: CheckoutInformation = {
  email: "",
  fullName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

const initialSubmissionAttempt: OrderSubmissionAttemptState = {
  status: "idle",
  preview: null,
  failure: null,
};

const stepPathMap: Record<Exclude<CheckoutStepKey, "start">, string> = {
  information: "/checkout/information",
  shipping: "/checkout/shipping",
  payment: "/checkout/payment",
  review: "/checkout/review",
  confirmation: "/checkout/success",
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { items, shippingUsd, subtotalUsd, totalUsd } = useCart();
  const [information, setInformation] = useState<CheckoutInformation>(initialInformation);
  const [shippingMethod, setShippingMethod] = useState<CheckoutShippingMethod | null>(null);
  const [hasVisitedConfirmation, setHasVisitedConfirmation] = useState(false);
  const [checkoutExecutionAttempt, setCheckoutExecutionAttempt] =
    useState<StripeCheckoutExecutionAttemptState>(
      initialStripeCheckoutExecutionAttemptState,
    );
  const [submissionPreview, setSubmissionPreview] = useState<OrderSubmissionPreview | null>(null);
  const [submissionAttempt, setSubmissionAttempt] =
    useState<OrderSubmissionAttemptState>(initialSubmissionAttempt);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as Partial<StoredCheckoutState>;

      if (parsedValue.information) {
        setInformation({
          ...initialInformation,
          ...parsedValue.information,
          country: "US",
        });
      }

      if (parsedValue.shippingMethod?.id === "standard") {
        setShippingMethod(defaultShippingMethod);
      }
    } catch {
      // Ignore malformed local checkout data and continue with a clean guest checkout state.
    }
  }, []);

  useEffect(() => {
    const storedState: StoredCheckoutState = {
      information,
      shippingMethod,
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(storedState));
  }, [information, shippingMethod]);

  const currentStep = getStepFromPathname(pathname);
  const isInformationComplete = requiredInformationFields.every(
    (field) => information[field].trim().length > 0,
  );
  const hasCartItems = items.length > 0;
  const canAccessShipping = hasCartItems && isInformationComplete;
  const canAccessPayment = canAccessShipping && shippingMethod?.id === "standard";

  const orderDraft = useMemo<OrderDraft>(
    () => ({
      checkoutMode: "guest",
      items,
      shippingAddress: isInformationComplete
        ? {
            ...information,
            country: "US",
          }
        : null,
      shippingMethod,
      subtotalUsd,
      shippingUsd,
      taxUsd: 0,
      totalUsd,
      currency: "USD",
      paymentMethod: "stripe-placeholder",
    }),
    [information, isInformationComplete, items, shippingMethod, shippingUsd, subtotalUsd, totalUsd],
  );
  const stripeOrderPaymentInput = useMemo<StripeOrderPaymentInput>(
    () =>
      createStripeOrderPaymentInput({
        checkoutMode: orderDraft.checkoutMode,
        email: orderDraft.shippingAddress?.email,
        subtotalUsd: orderDraft.subtotalUsd,
        shippingUsd: orderDraft.shippingUsd,
        taxUsd: orderDraft.taxUsd,
        totalUsd: orderDraft.totalUsd,
        currency: orderDraft.currency,
        items: orderDraft.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          priceUsd: item.priceUsd,
        })),
      }),
    [orderDraft],
  );
  const stripePaymentDraft = useMemo<StripeCheckoutPaymentDraft>(
    () => {
      const draft = createStripeCheckoutPaymentDraft(stripeOrderPaymentInput);
      const createdSession = checkoutExecutionAttempt.result?.session;

      if (!createdSession) {
        return draft;
      }

      return {
        ...draft,
        checkoutExecution: {
          ...draft.checkoutExecution,
          redirectTarget: checkoutExecutionAttempt.result?.redirectTarget ?? null,
        },
        checkoutSessionResponse: createdSession,
      };
    },
    [checkoutExecutionAttempt.result, stripeOrderPaymentInput],
  );
  const canAccessReview =
    canAccessPayment && canContinueToCheckoutReview(checkoutExecutionAttempt);
  const canAccessConfirmation = canAccessReview && hasVisitedConfirmation;

  useEffect(() => {
    setCheckoutExecutionAttempt(initialStripeCheckoutExecutionAttemptState);
  }, [stripeOrderPaymentInput]);

  useEffect(() => {
    if (currentStep === "start" || currentStep === "information" || currentStep === "confirmation") {
      return;
    }

    if (currentStep === "shipping" && !canAccessShipping) {
      router.replace((hasCartItems ? stepPathMap.information : "/checkout") as Route);
      return;
    }

    if (currentStep === "payment" && !canAccessPayment) {
      router.replace(
        (canAccessShipping ? stepPathMap.shipping : stepPathMap.information) as Route,
      );
      return;
    }

    if (currentStep === "review" && !canAccessReview) {
      router.replace(
        (canAccessPayment ? stepPathMap.payment : stepPathMap.information) as Route,
      );
    }
  }, [canAccessPayment, canAccessReview, canAccessShipping, currentStep, hasCartItems, router]);

  useEffect(() => {
    if (currentStep === "confirmation" && !canAccessConfirmation) {
      router.replace((canAccessReview ? stepPathMap.review : "/checkout") as Route);
    }
  }, [canAccessConfirmation, canAccessReview, currentStep, router]);

  const value: CheckoutContextValue = {
    information,
    shippingMethod,
    currentStep,
    canAccessShipping,
    canAccessPayment,
    canAccessReview,
    canAccessConfirmation,
    orderDraft,
    stripeOrderPaymentInput,
    stripePaymentDraft,
    checkoutExecutionAttempt,
    submissionAttempt,
    submissionPreview,
    updateInformation(field, value) {
      setInformation((current) => ({
        ...current,
        [field]: value,
      }));
    },
    continueFromInformation() {
      if (!canAccessShipping) {
        return;
      }

      router.push(stepPathMap.shipping as Route);
    },
    continueFromShipping() {
      setShippingMethod(defaultShippingMethod);
      router.push(stepPathMap.payment as Route);
    },
    async executeCheckoutSession() {
      if (!stripePaymentDraft.checkoutSessionRequest) {
        setCheckoutExecutionAttempt({
          status: "failure",
          result: null,
          message:
            "Checkout session request is incomplete. Review the guest checkout details before trying again.",
        });
        return;
      }

      setCheckoutExecutionAttempt({
        status: "submitting",
        result: null,
        message: null,
      });

      try {
        const result = await requestStripeCheckoutSessionCreation({
          endpointPath: stripePaymentDraft.checkoutExecution.endpointPath,
          request: stripePaymentDraft.checkoutSessionRequest,
        });

        setCheckoutExecutionAttempt({
          status: result.status === "created" ? "success" : "failure",
          result,
          message: result.message,
        });
      } catch {
        setCheckoutExecutionAttempt({
          status: "failure",
          result: null,
          message:
            "Stripe Checkout session creation failed before a response was returned.",
        });
      }
    },
    continueFromPayment() {
      if (!canAccessReview) {
        return;
      }

      router.push(stepPathMap.review as Route);
    },
    continueFromReview({ submissionFailure, submissionPreview: nextSubmissionPreview }) {
      if (!canAccessReview) {
        return;
      }

      setSubmissionAttempt({
        status: "submitting",
        preview: null,
        failure: null,
      });

      window.setTimeout(() => {
        if (submissionFailure) {
          setSubmissionPreview(null);
          setSubmissionAttempt({
            status: "failure",
            preview: null,
            failure: submissionFailure,
          });
          setHasVisitedConfirmation(true);
          router.push(stepPathMap.confirmation as Route);
          return;
        }

        setSubmissionPreview(nextSubmissionPreview);
        setSubmissionAttempt({
          status: "success",
          preview: nextSubmissionPreview,
          failure: null,
        });
        setHasVisitedConfirmation(true);
        router.push(stepPathMap.confirmation as Route);
      }, 350);
    },
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const value = useContext(CheckoutContext);

  if (!value) {
    throw new Error("useCheckout must be used within a CheckoutProvider.");
  }

  return value;
}

function getStepFromPathname(pathname: string): CheckoutStepKey {
  if (pathname === "/checkout") {
    return "start";
  }

  if (pathname === stepPathMap.information) {
    return "information";
  }

  if (pathname === stepPathMap.shipping) {
    return "shipping";
  }

  if (pathname === stepPathMap.payment) {
    return "payment";
  }

  if (pathname === stepPathMap.review) {
    return "review";
  }

  return "confirmation";
}

const requiredInformationFields: ReadonlyArray<
  Exclude<keyof CheckoutInformation, "address2" | "country">
> = ["email", "fullName", "address1", "city", "state", "postalCode"] as const;

export const checkoutFoundationTodos = {
  payment:
    "TODO: Replace the payment placeholder with real Stripe payment confirmation when the Stripe slice is implemented.",
  submission:
    "TODO: Submit the order draft to a real backend only after Stripe, tax, and order creation flows are defined.",
  tax: "TODO: Tax remains fixed at $0.00 until the tax model is validated.",
} as const;

function canContinueToCheckoutReview(
  checkoutExecutionAttempt: Pick<StripeCheckoutExecutionAttemptState, "status" | "result">,
) {
  return Boolean(
    checkoutExecutionAttempt.status === "success" &&
      checkoutExecutionAttempt.result?.session &&
      checkoutExecutionAttempt.result.redirectTarget,
  );
}
