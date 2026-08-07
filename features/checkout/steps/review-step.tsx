"use client";

import { useState } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";

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
  } = useCheckout();

  const [localError, setLocalError] = useState<string | null>(null);

  async function handlePlaceOrder() {
    if (!stripe || !elements || !paymentIntent.clientSecret || !paymentIntent.paymentIntentId) {
      return;
    }

    setLocalError(null);
    setPlaceOrderState({ status: "confirming", message: null });

    const { error, paymentIntent: confirmedIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: paymentIntent.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/review`,
      },
      redirect: "if_required",
    });

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
        <p className={styles.eyebrow}>Step 4</p>
        <h2>Review</h2>
      </div>

      <div className={styles.reviewCard}>
        <h3>Billing Address</h3>
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
        <h3>Shipping Address</h3>
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
        <h3>Items</h3>
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

      <div className={styles.reviewCard}>
        <h3>Payment</h3>
        <p>Card authorized now, charged only after you approve pre-shipment photos and videos.</p>
      </div>

      {localError ? (
        <div className={styles.reviewCard}>
          <h3>Checkout Update</h3>
          <p role="alert">{localError}</p>
        </div>
      ) : null}

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
  );
}
