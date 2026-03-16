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
import type { OrderSubmissionPreview } from "@/lib/order";
import type { StripeIntegrationMode, StripePaymentMethod } from "@/lib/stripe";
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
  paymentState: CheckoutPaymentState;
};

type CheckoutPaymentState = {
  selectedMode: StripeIntegrationMode | null;
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
  paymentState: CheckoutPaymentState;
  submissionPreview: OrderSubmissionPreview | null;
  updateInformation: (
    field: keyof CheckoutInformation,
    value: CheckoutInformation[keyof CheckoutInformation],
  ) => void;
  updatePaymentMode: (mode: StripeIntegrationMode) => void;
  continueFromInformation: () => void;
  continueFromShipping: () => void;
  continueFromPayment: () => void;
  continueFromReview: (submissionPreview: OrderSubmissionPreview | null) => void;
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

const initialPaymentState: CheckoutPaymentState = {
  selectedMode: null,
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
  const [paymentState, setPaymentState] = useState<CheckoutPaymentState>(initialPaymentState);
  const [hasVisitedConfirmation, setHasVisitedConfirmation] = useState(false);
  const [submissionPreview, setSubmissionPreview] = useState<OrderSubmissionPreview | null>(null);

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

      if (
        parsedValue.paymentState?.selectedMode === "checkout" ||
        parsedValue.paymentState?.selectedMode === "elements"
      ) {
        setPaymentState(parsedValue.paymentState);
      }
    } catch {
      // Ignore malformed local checkout data and continue with a clean guest checkout state.
    }
  }, []);

  useEffect(() => {
    const storedState: StoredCheckoutState = {
      information,
      shippingMethod,
      paymentState,
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(storedState));
  }, [information, paymentState, shippingMethod]);

  const currentStep = getStepFromPathname(pathname);
  const isInformationComplete = requiredInformationFields.every(
    (field) => information[field].trim().length > 0,
  );
  const hasCartItems = items.length > 0;
  const canAccessShipping = hasCartItems && isInformationComplete;
  const canAccessPayment = canAccessShipping && shippingMethod?.id === "standard";
  const canAccessReview = canAccessPayment && Boolean(paymentState.selectedMode);
  const canAccessConfirmation = canAccessReview && hasVisitedConfirmation;

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

  const value: CheckoutContextValue = {
    information,
    shippingMethod,
    currentStep,
    canAccessShipping,
    canAccessPayment,
    canAccessReview,
    canAccessConfirmation,
    orderDraft,
    paymentState,
    submissionPreview,
    updateInformation(field, value) {
      setInformation((current) => ({
        ...current,
        [field]: value,
      }));
    },
    updatePaymentMode(mode) {
      setPaymentState({ selectedMode: mode });
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
    continueFromPayment() {
      if (!canAccessPayment) {
        return;
      }

      router.push(stepPathMap.review as Route);
    },
    continueFromReview(nextSubmissionPreview) {
      if (!canAccessReview) {
        return;
      }

      setSubmissionPreview(nextSubmissionPreview);
      setHasVisitedConfirmation(true);
      router.push(stepPathMap.confirmation as Route);
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
