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

import { limitCartItems, toCommerceItems, type CartLineLimit, type CartStoreItem } from "@/features/cart/cart-items";
import { useCart } from "@/features/cart/cart-provider";
import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import { trackCommerceEvent } from "@/lib/analytics/commerce-tracking";
import { toOrderAddress, type AddressFormValues } from "@/lib/checkout/address-schema";
import type { OrderAddress } from "@/types/domain";

const CHECKOUT_STORAGE_KEY = "loom-hearth-studio.checkout.v3";
const LEGACY_CHECKOUT_STORAGE_KEY = "loom-hearth-studio.checkout.v2";
const CHECKOUT_STORAGE_VERSION = 3;

export type CheckoutAddresses = {
  /** Carries the contact email and phone for the order. */
  shipping: AddressFormValues;
  /** null means the billing address is the shipping address. */
  billing: AddressFormValues | null;
};

type StoredCheckoutState = {
  version: typeof CHECKOUT_STORAGE_VERSION;
  addresses: CheckoutAddresses | null;
};

type FunnelStepEventName = "add_shipping_info" | "add_payment_info";

// The order as the server priced it for the PaymentIntent; its total is the amount authorized.
export type AuthorizedOrderSummary = {
  items: Array<{ id: string; name: string; quantity: number; priceUsd: number }>;
  subtotalUsd: number;
  discountUsd: number;
  shippingUsd: number;
  totalUsd: number;
};

type PaymentIntentState = {
  status: "idle" | "creating" | "ready" | "error";
  clientSecret: string | null;
  paymentIntentId: string | null;
  summary: AuthorizedOrderSummary | null;
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

// Mirrors CheckoutOrderDraftValidationIssue from lib/order/checkout-draft-validation.ts.
// Re-declared locally (instead of imported) so this client component never
// pulls in that "server-only"-guarded module, even as a type-only import.
type PaymentIntentValidationIssue = {
  code: string;
  message: string;
  productId?: string;
  lineItemId?: string;
  availableQuantity?: number;
};

const stepPathMap: Record<CheckoutStepKey, string> = {
  shipping: "/checkout",
  payment: "/checkout/payment",
  review: "/checkout/review",
  confirmation: "/checkout/confirmation",
};

const initialPaymentIntentState: PaymentIntentState = {
  status: "idle",
  clientSecret: null,
  paymentIntentId: null,
  summary: null,
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
  hasHydrated: boolean;
  addresses: CheckoutAddresses | null;
  submitAddresses: (addresses: CheckoutAddresses) => void;
  submitPaymentDetails: () => void;
  resolvedBillingAddress: OrderAddress | null;
  resolvedShippingAddress: OrderAddress | null;
  canAccessPayment: boolean;
  canAccessReview: boolean;
  canAccessConfirmation: boolean;
  paymentIntent: PaymentIntentState;
  retryPaymentIntent: () => void;
  cartRecoveryMessage: string | null;
  placeOrderState: PlaceOrderState;
  setPlaceOrderState: (state: PlaceOrderState) => void;
  placedOrder: PlacedOrder | null;
  completeOrder: (order: PlacedOrder) => void;
  // The order was not saved and its PaymentIntent was declined, so it must never
  // be confirmed or reused: lower or drop the lines another order left short and
  // start a new PaymentIntent for whatever is left.
  restartCheckout: (input: { limits: CartLineLimit[]; message: string }) => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, promoCode, discountUsd, shippingUsd, subtotalUsd, totalUsd, clearCart, limitItems } = useCart();
  const [step, setStep] = useState<CheckoutStepKey>("shipping");
  const [addresses, setAddresses] = useState<CheckoutAddresses | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentState>(initialPaymentIntentState);
  const [cartRecoveryMessage, setCartRecoveryMessage] = useState<string | null>(null);
  const [placeOrderState, setPlaceOrderState] = useState<PlaceOrderState>(initialPlaceOrderState);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [paymentIntentRetryCount, setPaymentIntentRetryCount] = useState(0);
  const paymentIntentIdRef = useRef<string | null>(null);
  const hasTrackedBeginCheckout = useRef(false);
  const trackedFunnelSteps = useRef(new Set<FunnelStepEventName>());

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      setAddresses(parseStoredCheckoutAddresses(storedValue ? (JSON.parse(storedValue) as unknown) : null));
      window.localStorage.removeItem(LEGACY_CHECKOUT_STORAGE_KEY);
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
      addresses,
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(storedState));
  }, [addresses, hasHydrated]);

  useEffect(() => {
    function handlePopState() {
      setStep(getStepFromPathname(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const hasCartItems = items.length > 0;
  const resolvedShippingAddress = useMemo<OrderAddress | null>(
    () => (addresses ? toOrderAddress(addresses.shipping) : null),
    [addresses],
  );
  const resolvedBillingAddress = useMemo<OrderAddress | null>(
    () => (addresses ? toOrderAddress(addresses.billing ?? addresses.shipping) : null),
    [addresses],
  );

  const canAccessPayment = hasCartItems && Boolean(addresses);
  // Deliberately Boolean(clientSecret) rather than status === "ready": a
  // mid-checkout reprice (e.g. the cart changing while on Review) cycles
  // status through "ready" -> "creating" -> "ready" but keeps clientSecret
  // populated the whole time (see the reprice effect below, which spreads
  // `current` when it flips to "creating"). Gating on clientSecret instead
  // means a reprice-in-progress no longer evicts the customer from Review;
  // only a genuine failure (which nulls clientSecret) does.
  const canAccessReview = canAccessPayment && Boolean(paymentIntent.clientSecret) && !placedOrder;
  const canAccessConfirmation = Boolean(placedOrder);

  // Backward guard: if the browser lands on a step's URL (back button, hard
  // refresh, stale bookmark) before its prerequisites are met, fall back to
  // the furthest step that is actually ready.
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    // Once an order is placed, there's nothing left to edit — browser-back
    // into Shipping/Payment/Review (which would otherwise still show
    // an enabled "Place order" for an already-completed order) redirects
    // straight back to the receipt instead.
    if (placedOrder && step !== "confirmation") {
      setStep("confirmation");
      return;
    }

    if (step === "confirmation" && !canAccessConfirmation) {
      setStep(canAccessReview ? "review" : "shipping");
      return;
    }

    if (step === "review" && !canAccessReview) {
      setStep(canAccessPayment ? "payment" : "shipping");
      return;
    }

    if (step === "payment" && !canAccessPayment) {
      setStep("shipping");
    }
  }, [canAccessConfirmation, canAccessPayment, canAccessReview, hasHydrated, placedOrder, step]);

  useEffect(() => {
    if (!hasHydrated || hasTrackedBeginCheckout.current || !items.length || placedOrder) {
      return;
    }

    hasTrackedBeginCheckout.current = true;
    trackCommerceEvent({
      name: "begin_checkout",
      items: toCommerceItems(items),
      coupon: promoCode ?? undefined,
      discountUsd,
    });
  }, [discountUsd, hasHydrated, items, placedOrder, promoCode]);

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
            summary: result.summary,
            message: null,
          });
          return;
        }

        if (result.status === "validation-error") {
          // A validation-error can mean specific cart lines went stale (sold
          // out, or fewer units left than the line asks for, between page load
          // and this request) rather than the whole draft being broken.
          // Self-heal that narrow case by lowering or dropping only those
          // lines, but only when every reported issue names a line actually
          // in the cart. Any other issue (a bad promo code, a missing address
          // field) is a real error, not a reason to change the cart around it.
          const issues = result.issues ?? [];
          const limits = issues.flatMap((issue) => {
            const item = items.find((candidate) => candidate.id === issue.lineItemId);

            return item ? [{ id: item.id, availableQuantity: issue.availableQuantity ?? 0 }] : [];
          });

          if (limits.length > 0 && limits.length === issues.length) {
            limitItems(limits);
            setCartRecoveryMessage(describeLimitedLines(items, limits));

            // Don't touch paymentIntent here: it's already "creating" (set
            // above) and changing the stale line(s) changes draftSignature,
            // which naturally re-triggers this effect with the corrected
            // cart moments from now.
            return;
          }
        }

        setPaymentIntent({
          status: "error",
          clientSecret: null,
          paymentIntentId: null,
          summary: null,
          message: result.message,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setPaymentIntent({
            status: "error",
            clientSecret: null,
            paymentIntentId: null,
            summary: null,
            message: "Could not prepare payment for this order. Check your connection and try again.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessPayment, draftSignature, paymentIntentRetryCount]);

  function goToStep(next: CheckoutStepKey) {
    setStep(next);
    setCartRecoveryMessage(null);
    window.history.pushState(null, "", stepPathMap[next]);
  }

  function trackFunnelStepOnce(name: FunnelStepEventName) {
    if (trackedFunnelSteps.current.has(name)) {
      return;
    }

    trackedFunnelSteps.current.add(name);
    const funnelEvent = {
      items: toCommerceItems(items),
      coupon: promoCode ?? undefined,
      discountUsd,
    };

    trackCommerceEvent(
      name === "add_shipping_info"
        ? {
            ...funnelEvent,
            name,
            shippingTier: shippingUsd === 0 ? "Free shipping" : "Flat rate shipping",
          }
        : { ...funnelEvent, name },
    );
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
    hasHydrated,
    addresses,
    submitAddresses(nextAddresses) {
      setAddresses(nextAddresses);
      trackFunnelStepOnce("add_shipping_info");
      goToStep("payment");
    },
    submitPaymentDetails() {
      trackFunnelStepOnce("add_payment_info");
      goToStep("review");
    },
    resolvedBillingAddress,
    resolvedShippingAddress,
    canAccessPayment,
    canAccessReview,
    canAccessConfirmation,
    paymentIntent,
    retryPaymentIntent() {
      setPaymentIntentRetryCount((count) => count + 1);
    },
    cartRecoveryMessage,
    placeOrderState,
    setPlaceOrderState,
    placedOrder,
    completeOrder(order) {
      // Fired from this handler rather than an effect so a re-render or a
      // reload of the confirmation page cannot send it again.
      trackCommerceEvent({
        name: "purchase",
        transactionId: order.orderNumber,
        items: toCommerceItems(items),
        coupon: promoCode ?? undefined,
        discountUsd,
        shippingUsd,
      });
      setPlacedOrder(order);
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      clearCart();
      goToStep("confirmation");
    },
    restartCheckout({ limits, message }) {
      limitItems(limits);
      paymentIntentIdRef.current = null;
      setPlaceOrderState(initialPlaceOrderState);
      setPaymentIntentRetryCount((count) => count + 1);
      goToStep(limitCartItems(items, limits).length > 0 ? "payment" : "shipping");
      setCartRecoveryMessage(message);
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

function describeLimitedLines(items: CartStoreItem[], limits: CartLineLimit[]) {
  const removedCount = limits.filter((limit) => limit.availableQuantity < 1).length;
  const lowered = limits.flatMap((limit) => {
    const item = items.find((candidate) => candidate.id === limit.id);

    return item && limit.availableQuantity >= 1
      ? [`${item.name}: only ${limit.availableQuantity} left, so we changed your quantity.`]
      : [];
  });

  return [
    removedCount > 1
      ? "A few pieces in your order are no longer available, so we removed them."
      : removedCount === 1
        ? "A piece in your order is no longer available, so we removed it."
        : "",
    ...lowered,
    "Your total has been updated.",
  ]
    .filter(Boolean)
    .join(" ");
}

function getStepFromPathname(pathname: string): CheckoutStepKey {
  if (pathname === stepPathMap.payment) {
    return "payment";
  }

  if (pathname === stepPathMap.review) {
    return "review";
  }

  if (pathname === stepPathMap.confirmation) {
    return "confirmation";
  }

  return "shipping";
}

function parseStoredCheckoutAddresses(value: unknown): CheckoutAddresses | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<StoredCheckoutState>;
  const addresses = candidate.addresses as Partial<CheckoutAddresses> | null | undefined;

  if (candidate.version !== CHECKOUT_STORAGE_VERSION || !addresses || !isAddressFormValues(addresses.shipping)) {
    return null;
  }

  if (addresses.billing !== null && !isAddressFormValues(addresses.billing)) {
    return null;
  }

  return { shipping: addresses.shipping, billing: addresses.billing };
}

function isAddressFormValues(value: unknown): value is AddressFormValues {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const requiredFields = ["fullName", "email", "address1", "city", "state", "postalCode"];
  const optionalFields = ["phone", "address2"];

  return (
    requiredFields.every((field) => typeof candidate[field] === "string") &&
    optionalFields.every((field) => candidate[field] === undefined || typeof candidate[field] === "string")
  );
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
  summary: AuthorizedOrderSummary | null;
  issues?: PaymentIntentValidationIssue[];
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
