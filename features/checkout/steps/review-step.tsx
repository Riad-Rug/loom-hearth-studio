"use client";

import { useState } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";

import Link from "next/link";

import { formatUsd } from "@/features/cart/cart-provider";
import { useCheckout } from "@/features/checkout/checkout-provider";

import styles from "@/features/checkout/checkout-page.module.css";

type CompleteOrderResponse = {
  status: string;
  order: {
    orderNumber: string;
    totalUsd: number;
    currency: "USD";
    paymentIntentId: string;
    items: Array<{ id: string; name: string; quantity: number; sku: string | null }>;
  } | null;
  message: string;
};

export function ReviewStep() {
  const stripe = useStripe();
  const elements = useElements();
  const {
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
    goToStep,
  } = useCheckout();

  const [localError, setLocalError] = useState<string | null>(null);

  async function handlePlaceOrder() {
    if (!stripe || !elements || !paymentIntent.clientSecret || !paymentIntent.paymentIntentId) {
      return;
    }

    setLocalError(null);
    setPlaceOrderState({ status: "confirming", message: null });

    // stripe.confirmPayment() normally resolves with { error } rather than
    // throwing, but it can reject outright (network failure, unexpected
    // Elements state) — without this catch-all, a rejection here leaves the
    // button frozen on "Authorizing card…" forever with no way to recover.
    let error;
    let confirmedIntent;
    try {
      ({ error, paymentIntent: confirmedIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/review`,
        },
        redirect: "if_required",
      }));
    } catch (thrown) {
      setPlaceOrderState({ status: "error", message: null });
      setLocalError(
        thrown instanceof Error
          ? `Payment could not be authorized: ${thrown.message}`
          : "Payment could not be authorized. Check your card details and try again.",
      );
      return;
    }

    if (error) {
      setPlaceOrderState({ status: "error", message: null });
      setLocalError(error.message ?? "Payment could not be authorized. Check your card details and try again.");
      return;
    }

    if (confirmedIntent?.status !== "requires_capture" && confirmedIntent?.status !== "succeeded") {
      setPlaceOrderState({ status: "error", message: null });
      setLocalError("Payment was not authorized. Please try again.");
      return;
    }

    setPlaceOrderState({ status: "creating-order", message: null });

    try {
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.paymentIntentId }),
      });
      const result = (await response.json()) as CompleteOrderResponse;

      if (!response.ok || !result.order) {
        setPlaceOrderState({ status: "error", message: null });
        setLocalError(
          "Your card was authorized, but we could not finalize your order. Contact the studio and reference your payment confirmation.",
        );
        return;
      }

      setPlaceOrderState({ status: "idle", message: null });
      completeOrder(result.order);
    } catch {
      setPlaceOrderState({ status: "error", message: null });
      setLocalError(
        "Your card was authorized, but we could not finalize your order. Contact the studio and reference your payment confirmation.",
      );
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
          <h3>Billing Address</h3>
          <button className={styles.editLink} type="button" onClick={() => goToStep("billing")}>
            Edit
          </button>
        </div>
        {resolvedBillingAddress ? (
          <>
            <p>{resolvedBillingAddress.fullName}</p>
            <p>{resolvedBillingAddress.address1}{resolvedBillingAddress.address2 ? `, ${resolvedBillingAddress.address2}` : ""}</p>
            <p>{resolvedBillingAddress.city}, {resolvedBillingAddress.state} {resolvedBillingAddress.postalCode}</p>
            <p>{resolvedBillingAddress.email}</p>
          </>
        ) : (
          <p>Complete billing details before reviewing your order.</p>
        )}
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3>Shipping Address</h3>
          <button className={styles.editLink} type="button" onClick={() => goToStep("shipping")}>
            Edit
          </button>
        </div>
        {resolvedShippingAddress ? (
          <>
            <p>{resolvedShippingAddress.fullName}</p>
            <p>{resolvedShippingAddress.address1}{resolvedShippingAddress.address2 ? `, ${resolvedShippingAddress.address2}` : ""}</p>
            <p>{resolvedShippingAddress.city}, {resolvedShippingAddress.state} {resolvedShippingAddress.postalCode}</p>
          </>
        ) : (
          <p>Complete shipping details before reviewing your order.</p>
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
      </div>

      {localError ? (
        <div className={styles.reviewCardError}>
          <h3>We couldn&apos;t finish placing your order</h3>
          <p role="alert">{localError}</p>
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
        Card authorized now, charged only after you approve pre-shipment photos and videos.
      </p>

      <div className={styles.stepActions}>
        <button className={styles.secondaryAction} type="button" onClick={() => goToStep("payment")}>
          Back
        </button>
        <button
          className={styles.primaryAction}
          disabled={!stripe || !elements || paymentIntent.status !== "ready" || isPlacing}
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
