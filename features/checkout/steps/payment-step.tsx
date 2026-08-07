"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { useCheckout } from "@/features/checkout/checkout-provider";

import styles from "@/features/checkout/checkout-page.module.css";

export function PaymentStep() {
  const stripe = useStripe();
  const elements = useElements();
  const { paymentIntent, goToStep } = useCheckout();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await elements.submit();

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message ?? "Check your payment details and try again.");
      return;
    }

    goToStep("review");
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Step 3</p>
        <h2>Payment</h2>
      </div>

      <div className={styles.reviewCard}>
        <h3>Secure Payment</h3>
        <p>
          Your card is authorized now and charged only after you approve pre-shipment photos and
          videos of your exact piece — usually within 24 to 48 hours.
        </p>
      </div>

      {paymentIntent.status === "creating" || paymentIntent.status === "idle" || !stripe || !elements ? (
        <div className={styles.reviewCard}>
          <p>Preparing secure payment…</p>
        </div>
      ) : paymentIntent.status === "error" ? (
        <div className={styles.reviewCard}>
          <h3>Payment Unavailable</h3>
          <p>{paymentIntent.message ?? "We could not prepare payment for this order. Please try again."}</p>
        </div>
      ) : (
        <div className={styles.paymentShell}>
          <PaymentElement />
        </div>
      )}

      {submitError ? (
        <p role="alert" className={styles.fieldError}>
          {submitError}
        </p>
      ) : null}

      <button
        className={styles.primaryAction}
        disabled={!stripe || !elements || paymentIntent.status !== "ready" || isSubmitting}
        type="button"
        onClick={() => {
          void handleContinue();
        }}
      >
        {isSubmitting ? "Checking details…" : "Continue to review"}
      </button>
    </div>
  );
}
