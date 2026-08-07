"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CartStoreItem } from "@/features/cart/cart-provider";
import { useCart } from "@/features/cart/cart-provider";
import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import { trackBeginCheckout } from "@/lib/analytics/gtag";
import { emptyAddressFormValues, toOrderAddress, type AddressFormValues } from "@/lib/checkout/address-schema";
import type { OrderAddress } from "@/types/domain";

const CHECKOUT_STORAGE_KEY = "loom-hearth-studio.checkout.v2";
const CHECKOUT_STORAGE_VERSION = 2;

export type ShippingAddressMode = "same-as-billing" | "different";

type StoredCheckoutState = {
  version: typeof CHECKOUT_STORAGE_VERSION;
  billing: AddressFormValues | null;
  shippingAddressMode: ShippingAddressMode;
  shippingAddress: AddressFormValues | null;
};

type PaymentIntentState = {
  status: "idle" | "creating" | "ready" | "error";
  clientSecret: string | null;
  paymentIntentId: string | null;
  totalUsd: number | null;
  message: string | null;
};

export type PlacedOrderItem = {
  id: string;
  name: string;
  quantity: number;
  sku: string | null;
};

export type PlacedOrder = {
  orderNumber: string;
  items: PlacedOrderItem[];
  totalUsd: number;
  currency: "USD";
  paymentIntentId: string;
};

export type PlaceOrderState = {
  status: "idle" | "confirming" | "creating-order" | "error";
  message: string | null;
};

const stepPathMap: Record<CheckoutStepKey, string> = {
  billing: "/checkout",
  shipping: "/checkout/shipping",
  payment: "/checkout/payment",
  review: "/checkout/review",
  confirmation: "/checkout/confirmation",
};

const initialPaymentIntentState: PaymentIntentState = {
  status: "idle",
  clientSecret: null,
  paymentIntentId: null,
  totalUsd: null,
  message: null,
};

const initialPlaceOrderState: PlaceOrderState = {
  status: "idle",
  message: null,
};

type CheckoutContextValue = {
  step: CheckoutStepKey;
  goToStep: (step: CheckoutStepKey) => void;
  items: CartStoreItem[];
  promoCode: string | null;
  discountUsd: number;
  subtotalUsd: number;
  shippingUsd: number;
  totalUsd: number;
  billing: AddressFormValues;
  submitBilling: (values: AddressFormValues) => void;
  shippingAddressMode: ShippingAddressMode;
  setShippingAddressMode: (mode: ShippingAddressMode) => void;
  shippingAddressDraft: AddressFormValues;
  submitShipping: (values: AddressFormValues | null) => void;
  resolvedBillingAddress: OrderAddress | null;
  resolvedShippingAddress: OrderAddress | null;
  canAccessShipping: boolean;
  canAccessPayment: boolean;
  canAccessReview: boolean;
  canAccessConfirmation: boolean;
  paymentIntent: PaymentIntentState;
  placeOrderState: PlaceOrderState;
  setPlaceOrderState: (state: PlaceOrderState) => void;
  placedOrder: PlacedOrder | null;
  completeOrder: (order: PlacedOrder) => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, promoCode, discountUsd, shippingUsd, subtotalUsd, totalUsd } = useCart();
  const [step, setStep] = useState<CheckoutStepKey>("billing");
  const [billing, setBilling] = useState<AddressFormValues>(emptyAddressFormValues);
  const [shippingAddressMode, setShippingAddressMode] = useState<ShippingAddressMode>("same-as-billing");
  const [shippingAddressDraft, setShippingAddressDraft] = useState<AddressFormValues>(emptyAddressFormValues);
  const [billingSubmitted, setBillingSubmitted] = useState(false);
  const [shippingSubmitted, setShippingSubmitted] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentState>(initialPaymentIntentState);
  const [placeOrderState, setPlaceOrderState] = useState<PlaceOrderState>(initialPlaceOrderState);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const paymentIntentIdRef = useRef<string | null>(null);
  const hasTrackedBeginCheckout = useRef(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      const parsedValue = storedValue ? (JSON.parse(storedValue) as Partial<StoredCheckoutState>) : null;

      if (parsedValue?.version === CHECKOUT_STORAGE_VERSION) {
        if (parsedValue.billing) {
          setBilling(parsedValue.billing);
          setBillingSubmitted(true);
        }

        if (parsedValue.shippingAddressMode) {
          setShippingAddressMode(parsedValue.shippingAddressMode);
        }

        if (parsedValue.shippingAddress) {
          setShippingAddressDraft(parsedValue.shippingAddress);
          setShippingSubmitted(true);
        }
      }
    } catch {
      // Ignore malformed local checkout data and continue with a clean guest checkout state.
    }

    setStep(getStepFromPathname(window.location.pathname));
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const storedState: StoredCheckoutState = {
      version: CHECKOUT_STORAGE_VERSION,
      billing: billingSubmitted ? billing : null,
      shippingAddressMode,
      shippingAddress: shippingSubmitted ? shippingAddressDraft : null,
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(storedState));
  }, [billing, billingSubmitted, hasHydrated, shippingAddressDraft, shippingAddressMode, shippingSubmitted]);

  useEffect(() => {
    function handlePopState() {
      setStep(getStepFromPathname(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const hasCartItems = items.length > 0;
  const resolvedBillingAddress = useMemo<OrderAddress | null>(
    () => (billingSubmitted ? toOrderAddress(billing) : null),
    [billing, billingSubmitted],
  );
  const resolvedShippingAddress = useMemo<OrderAddress | null>(() => {
    if (shippingAddressMode === "same-as-billing") {
      return resolvedBillingAddress;
    }

    return shippingSubmitted ? toOrderAddress(shippingAddressDraft) : null;
  }, [resolvedBillingAddress, shippingAddressDraft, shippingAddressMode, shippingSubmitted]);

  const canAccessShipping = hasCartItems && Boolean(resolvedBillingAddress);
  const canAccessPayment = canAccessShipping && Boolean(resolvedShippingAddress);
  const canAccessReview = canAccessPayment && paymentIntent.status === "ready";
  const canAccessConfirmation = Boolean(placedOrder);

  // Backward guard: if the browser lands on a step's URL (back button, hard
  // refresh, stale bookmark) before its prerequisites are met, fall back to
  // the furthest step that is actually ready.
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (step === "confirmation" && !canAccessConfirmation) {
      setStep(canAccessReview ? "review" : "billing");
      return;
    }

    if (step === "review" && !canAccessReview) {
      setStep(canAccessPayment ? "payment" : "billing");
      return;
    }

    if (step === "payment" && !canAccessPayment) {
      setStep(canAccessShipping ? "shipping" : "billing");
      return;
    }

    if (step === "shipping" && !canAccessShipping) {
      setStep("billing");
    }
  }, [canAccessConfirmation, canAccessPayment, canAccessReview, canAccessShipping, hasHydrated, step]);

  const draftSignature = useMemo(
    () =>
      JSON.stringify({
        billing: resolvedBillingAddress,
        shipping: resolvedShippingAddress,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productType: item.productType,
          quantity: item.quantity,
          variantName: item.variantName,
        })),
        promoCode,
      }),
    [items, promoCode, resolvedBillingAddress, resolvedShippingAddress],
  );

  useEffect(() => {
    if (!canAccessPayment || !resolvedBillingAddress || !resolvedShippingAddress || !items.length) {
      return;
    }

    let cancelled = false;
    setPaymentIntent((current) => ({ ...current, status: "creating", message: null }));

    requestPaymentIntent({
      billingAddress: resolvedBillingAddress,
      shippingAddress: resolvedShippingAddress,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productType: item.productType,
        quantity: item.quantity,
        variantName: item.variantName,
      })),
      promoCode: promoCode ?? undefined,
      paymentIntentId: paymentIntentIdRef.current ?? undefined,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.status === "created" || result.status === "updated") {
          paymentIntentIdRef.current = result.paymentIntentId;
          setPaymentIntent({
            status: "ready",
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId,
            totalUsd: result.totalUsd,
            message: null,
          });
        } else {
          setPaymentIntent({
            status: "error",
            clientSecret: null,
            paymentIntentId: null,
            totalUsd: null,
            message: result.message,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPaymentIntent({
            status: "error",
            clientSecret: null,
            paymentIntentId: null,
            totalUsd: null,
            message: "Could not prepare payment for this order. Check your connection and try again.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessPayment, draftSignature]);

  function goToStep(next: CheckoutStepKey) {
    setStep(next);
    window.history.pushState(null, "", stepPathMap[next]);
  }

  const value: CheckoutContextValue = {
    step,
    goToStep,
    items,
    promoCode,
    discountUsd,
    subtotalUsd,
    shippingUsd,
    totalUsd,
    billing,
    submitBilling(values) {
      setBilling(values);
      setBillingSubmitted(true);

      if (!hasTrackedBeginCheckout.current) {
        hasTrackedBeginCheckout.current = true;
        trackBeginCheckout({
          currency: "USD",
          value: totalUsd,
          items: items.map((item) => ({
            item_id: item.productId,
            item_name: item.name,
            item_category: item.productCategory,
            item_variant: item.variantName,
            price: item.priceUsd,
            quantity: item.quantity,
          })),
        });
      }

      goToStep("shipping");
    },
    shippingAddressMode,
    setShippingAddressMode(mode) {
      setShippingAddressMode(mode);

      if (mode === "same-as-billing") {
        setShippingSubmitted(false);
      }
    },
    shippingAddressDraft,
    submitShipping(values) {
      if (shippingAddressMode === "different") {
        if (!values) {
          return;
        }

        setShippingAddressDraft(values);
        setShippingSubmitted(true);
      }

      goToStep("payment");
    },
    resolvedBillingAddress,
    resolvedShippingAddress,
    canAccessShipping,
    canAccessPayment,
    canAccessReview,
    canAccessConfirmation,
    paymentIntent,
    placeOrderState,
    setPlaceOrderState,
    placedOrder,
    completeOrder(order) {
      setPlacedOrder(order);
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      goToStep("confirmation");
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
  if (pathname === stepPathMap.shipping) {
    return "shipping";
  }

  if (pathname === stepPathMap.payment) {
    return "payment";
  }

  if (pathname === stepPathMap.review) {
    return "review";
  }

  if (pathname === stepPathMap.confirmation) {
    return "confirmation";
  }

  return "billing";
}

type RequestPaymentIntentInput = {
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  items: Array<{
    id: string;
    productId: string;
    productType: "rug" | "multiUnit";
    quantity: number;
    variantName?: string;
  }>;
  promoCode?: string;
  paymentIntentId?: string;
};

type RequestPaymentIntentResult = {
  status: "created" | "updated" | "validation-error" | "api-error";
  clientSecret: string | null;
  paymentIntentId: string | null;
  totalUsd: number | null;
  message: string;
};

async function requestPaymentIntent(
  input: RequestPaymentIntentInput,
): Promise<RequestPaymentIntentResult> {
  const response = await fetch("/api/checkout/payment-intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return (await response.json()) as RequestPaymentIntentResult;
}
