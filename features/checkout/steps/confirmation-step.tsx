"use client";

import Link from "next/link";
import { useState } from "react";

import { formatUsd } from "@/features/cart/cart-provider";
import { useCheckout } from "@/features/checkout/checkout-provider";

import styles from "@/features/checkout/checkout-page.module.css";

export function ConfirmationStep() {
  const { placedOrder } = useCheckout();
  const [notes, setNotes] = useState("");
  const [notesState, setNotesState] = useState<"idle" | "submitting" | "saved" | "error">("idle");

  async function handleSubmitNotes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!placedOrder) {
      return;
    }

    setNotesState("submitting");

    try {
      const response = await fetch("/api/orders/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: placedOrder.paymentIntentId, notes }),
      });

      setNotesState(response.ok ? "saved" : "error");
    } catch {
      setNotesState("error");
    }
  }

  if (!placedOrder) {
    return (
      <div className={styles.panelStack}>
        <div className={styles.panelHeader}>
          <p className={styles.eyebrow}>Confirmation</p>
          <h2>No order to confirm</h2>
        </div>
        <p className={styles.panelBody}>Start a new checkout from your cart to place an order.</p>
        <Link className={styles.primaryAction} href="/shop">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Confirmation</p>
        <h2>Thank you</h2>
      </div>

      <div className={styles.confirmationCard}>
        <strong>Your order is confirmed and your card has been authorized.</strong>
        <p>
          Thank you for your trust. We&apos;ll be in touch within 24 to 48 hours with photos and
          videos of your exact piece for your approval — your card is charged only after you approve,
          and not before.
        </p>
        <p>Order number: {placedOrder.orderNumber}</p>
        <p>Total: {formatUsd(placedOrder.totalUsd)}</p>
      </div>

      <div className={styles.reviewCard}>
        <h3>Items</h3>
        {placedOrder.items.map((item) => (
          <p key={item.id}>
            {item.name} × {item.quantity}
            {item.sku ? ` — SKU ${item.sku}` : ""}
          </p>
        ))}
      </div>

      <div className={styles.reviewCard}>
        <h3>Have a Request for Your Photos or Video?</h3>
        <p>
          If you&apos;d like a specific angle, lighting condition, or anything else shown before you
          approve, tell us here — or leave it blank and submit.
        </p>
        <form className={styles.panelStack} onSubmit={handleSubmitNotes}>
          <label className={styles.field} htmlFor="confirmation-notes">
            <span>Instructions (optional)</span>
            <textarea
              id="confirmation-notes"
              className={styles.notesTextarea}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="For example: please show the back of the rug in daylight."
              rows={4}
              maxLength={2000}
            />
          </label>
          <button className={styles.secondaryAction} disabled={notesState === "submitting"} type="submit">
            {notesState === "submitting" ? "Submitting…" : "Submit"}
          </button>
          {notesState === "saved" ? <p>Thanks — we&apos;ve got it.</p> : null}
          {notesState === "error" ? <p role="alert">Could not save your note. Please try again.</p> : null}
        </form>
      </div>

      <div className={styles.reviewCard}>
        <h3>Next Step Support</h3>
        <p>
          If you need to clarify delivery timing, product questions, or project details after
          checkout, reply to the confirmation email or contact the studio directly.
        </p>
      </div>

      <div className={styles.formGrid}>
        <Link className={styles.secondaryAction} href="/shop">
          Return to Shop
        </Link>
        <Link className={styles.secondaryAction} href="/contact?inquiryType=order-question">
          Contact the Studio
        </Link>
      </div>
    </div>
  );
}
