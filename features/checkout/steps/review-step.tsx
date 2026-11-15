"use client";

import { useRef, useState } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import type { PaymentIntent, Stripe, StripeElements } from "@stripe/stripe-js";

import Link from "next/link";

import { formatUsd } from "@/features/cart/cart-provider";
import { useCheckout } from "@/features/checkout/checkout-provider";
import type { CompleteOrderResponse } from "@/lib/checkout/complete-order-response";
import { storePromise, storePromiseCopy } from "@/lib/order/store-promise";

import styles from "@/features/checkout/checkout-page.module.css";

const finalizeFailedMessage =
  "Your card was authorized, but we could not finalize your order. Contact the studio and reference your payment confirmation.";

// "oversold": the payment went through and the server saved an order the studio
// will refund, so the buyer gets that order number instead of a payment reference.
type PlaceOrderProblem =
  | { kind: "error"; message: string }
  | { kind: "oversold"; orderNumber: string | null; message: string };

// Resolves to null once the card is authorized, or to what to tell the buyer.
// A confirm that failed in transit, or one Stripe refused because the card was
// already authorized, leaves the PaymentIntent's own status as the answer.
async function authorizeCard(stripe: Stripe, elements: StripeElements, clientSecret: string): Promise<string | null> {
  let problem: string;

  // stripe.confirmPayment() normally resolves with { error } rather than
  // throwing, but it can reject outright (network failure, unexpected
  // Elements state) — without this catch-all, a rejection here leaves the
  // button frozen on "Authorizing card…" forever with no way to recover.
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/review`,
      },
      redirect: "if_required",
    });

    if (!error && isAuthorized(paymentIntent)) {
      return null;
    }

    problem = error
      ? (error.message ?? "Payment could not be authorized. Check your card details and try again.")
      : "Payment was not authorized. Please try again.";
  } catch (thrown) {
    problem =
      thrown instanceof Error
        ? `Payment could not be authorized: ${thrown.message}`
        : "Payment could not be authorized. Check your card details and try again.";
  }

  const current = await stripe.retrievePaymentIntent(clientSecret).catch(() => null);

  return isAuthorized(current?.paymentIntent) ? null : problem;
}

function isAuthorized(paymentIntent: PaymentIntent | undefined) {
  return paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded";
}

export function ReviewStep() {
  const stripe = useStripe();
  const elements = useElements();
  const {
    addresses,
    resolvedBillingAddress,
    resolvedShippingAddress,
    items,
    subtotalUsd,
    shippingUsd,
    discountUsd,
    totalUsd,
    paymentIntent,
    placeOrderState,
    setPlaceOrderState,
    completeOrder,
    restartCheckout,
    goToStep,
  } = useCheckout();

  const [problem, setProblem] = useState<PlaceOrderProblem | null>(null);
  // Set synchronously, so a second click before the button re-renders disabled starts nothing.
  const isPlacingRef = useRef(false);
  // Stripe refuses to confirm a PaymentIntent twice, so once this one is authorized
  // a retry after a failed complete call only asks the server again.
  const authorizedPaymentIntentIdRef = useRef<string | null>(null);

  function fail(message: string) {
    setPlaceOrderState({ status: "error", message: null });
    setProblem({ kind: "error", message });
  }

  async function handlePlaceOrder() {
    const { clientSecret, paymentIntentId } = paymentIntent;

    if (isPlacingRef.current || !stripe || !elements || !clientSecret || !paymentIntentId) {
      return;
    }

    isPlacingRef.current = true;
    setProblem(null);

    try {
      if (authorizedPaymentIntentIdRef.current !== paymentIntentId) {
        setPlaceOrderState({ status: "confirming", message: null });
        const authorizationProblem = await authorizeCard(stripe, elements, clientSecret);

        if (authorizationProblem) {
          fail(authorizationProblem);
          return;
        }

        authorizedPaymentIntentIdRef.current = paymentIntentId;
      }

      setPlaceOrderState({ status: "creating-order", message: null });
      await finishOrder(paymentIntentId);
    } finally {
      isPlacingRef.current = false;
    }
  }

  async function finishOrder(paymentIntentId: string) {
    try {
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });
      const result = (await response.json()) as CompleteOrderResponse;

      switch (result.status) {
        case "created":
          setPlaceOrderState({ status: "idle", message: null });
          completeOrder(result.order);
          return;
        case "unavailable":
        case "not-placed":
          restartCheckout({
            limits:
              result.status === "unavailable"
                ? result.unavailableItems.map((item) => ({ id: item.lineId, availableQuantity: item.availableQuantity }))
                : [],
            // The studio needs the old payment to release a hold Stripe would not let go.
            message:
              result.cardHold === "unresolved" ? `${result.message} Reference: ${paymentIntentId}.` : result.message,
          });
          return;
        case "oversold":
          setPlaceOrderState({ status: "error", message: null });
          setProblem({ kind: "oversold", orderNumber: result.orderNumber, message: result.message });
          return;
        default:
          fail(finalizeFailedMessage);
      }
    } catch {
      fail(finalizeFailedMessage);
    }
  }

  const isPlacing = placeOrderState.status === "confirming" || placeOrderState.status === "creating-order";

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <h2>Review</h2>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3>Contact & shipping</h3>
          <button className={styles.editLink} type="button" onClick={() => goToStep("shipping")}>
            Edit
          </button>
        </div>
        {resolvedShippingAddress ? (
          <>
            <p>{resolvedShippingAddress.fullName}</p>
            <p>{resolvedShippingAddress.address1}{resolvedShippingAddress.address2 ? `, ${resolvedShippingAddress.address2}` : ""}</p>
            <p>{resolvedShippingAddress.city}, {resolvedShippingAddress.state} {resolvedShippingAddress.postalCode}</p>
            <p>{resolvedShippingAddress.email}</p>
          </>
        ) : (
          <p>Complete shipping details before reviewing your order.</p>
        )}
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3>Billing address</h3>
          <button className={styles.editLink} type="button" onClick={() => goToStep("shipping")}>
            Edit
          </button>
        </div>
        {addresses?.billing === null ? (
          <p>Same as shipping address</p>
        ) : resolvedBillingAddress ? (
          <>
            <p>{resolvedBillingAddress.fullName}</p>
            <p>{resolvedBillingAddress.address1}{resolvedBillingAddress.address2 ? `, ${resolvedBillingAddress.address2}` : ""}</p>
            <p>{resolvedBillingAddress.city}, {resolvedBillingAddress.state} {resolvedBillingAddress.postalCode}</p>
          </>
        ) : (
          <p>Complete billing details before reviewing your order.</p>
        )}
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3>Items</h3>
          <button className={styles.editLink} type="button" onClick={() => goToStep("payment")}>
            Edit payment
          </button>
        </div>
        {items.map((item) => (
          <p key={item.id}>
            {item.name} × {item.quantity} — {formatUsd(item.priceUsd * item.quantity)}
          </p>
        ))}
        <p>Subtotal: {formatUsd(subtotalUsd)}</p>
        <p>Shipping: {shippingUsd === 0 ? "Free" : formatUsd(shippingUsd)}</p>
        {discountUsd > 0 ? <p>Discount: -{formatUsd(discountUsd)}</p> : null}
        <p>
          <strong>Total: {formatUsd(totalUsd)}</strong>
        </p>
        <p className={styles.summaryNote}>{storePromiseCopy.duties}</p>
      </div>

      {problem?.kind === "oversold" ? (
        <div className={styles.reviewCardError}>
          <h3>A piece in your order was no longer available</h3>
          {problem.orderNumber ? (
            <p>
              Order number: <strong>{problem.orderNumber}</strong>
            </p>
          ) : null}
          <p role="alert">{problem.message}</p>
          <Link className={styles.secondaryAction} href="/contact?inquiryType=order-question">
            Contact the Studio
          </Link>
        </div>
      ) : problem ? (
        <div className={styles.reviewCardError}>
          <h3>We couldn&apos;t finish placing your order</h3>
          <p role="alert">{problem.message}</p>
          {paymentIntent.paymentIntentId ? (
            <p className={styles.summaryNote}>
              Reference: {paymentIntent.paymentIntentId} — your card was authorized, not charged.
            </p>
          ) : null}
          <Link className={styles.secondaryAction} href="/contact?inquiryType=order-question">
            Contact the Studio
          </Link>
        </div>
      ) : null}

      <p className={styles.promiseLine}>
        Card authorized now, charged only after you approve pre-shipment {storePromise.approvalMedia}.
      </p>

      <div className={styles.stepActions}>
        <button className={styles.secondaryAction} type="button" onClick={() => goToStep("payment")}>
          Back
        </button>
        <button
          className={styles.primaryAction}
          disabled={
            !stripe || !elements || paymentIntent.status !== "ready" || isPlacing || problem?.kind === "oversold"
          }
          type="button"
          onClick={() => {
            void handlePlaceOrder();
          }}
        >
          {placeOrderState.status === "confirming"
            ? "Authorizing card…"
            : placeOrderState.status === "creating-order"
              ? "Placing order…"
              : "Place order"}
        </button>
      </div>
    </div>
  );
}
