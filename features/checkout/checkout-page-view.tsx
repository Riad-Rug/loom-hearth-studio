"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";

import { checkoutSteps, checkoutSummary } from "@/features/checkout/checkout-data";
import { formatUsd, getCartItemLabel, useCart } from "@/features/cart/cart-provider";
import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import { useCheckout } from "@/features/checkout/checkout-provider";
import { BillingStep } from "@/features/checkout/steps/billing-step";
import { ShippingStep } from "@/features/checkout/steps/shipping-step";
import { PaymentStep } from "@/features/checkout/steps/payment-step";
import { ReviewStep } from "@/features/checkout/steps/review-step";
import { ConfirmationStep } from "@/features/checkout/steps/confirmation-step";
import { getStripeBrowserClient } from "@/lib/stripe/browser-client";

import styles from "./checkout-page.module.css";

export function CheckoutPageView() {
  const {
    items,
    promoCode,
    promoMessage,
    discountUsd,
    shippingUsd,
    subtotalUsd,
    totalUsd,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const [promoDraft, setPromoDraft] = useState(promoCode ?? "");
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);
  const { step, paymentIntent } = useCheckout();

  useEffect(() => {
    setPromoDraft(promoCode ?? "");
  }, [promoCode]);

  const lineItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    quantityLabel: `Qty ${item.quantity}`,
    typeLabel: getCartItemLabel(item),
    priceUsdLabel: formatUsd(item.priceUsd),
  }));
  const summary = {
    subtotalUsdLabel: items.length > 0 ? formatUsd(subtotalUsd) : checkoutSummary.subtotalUsdLabel,
    shippingUsdLabel: items.length > 0 ? formatUsd(shippingUsd) : checkoutSummary.shippingUsdLabel,
    taxUsdLabel: checkoutSummary.taxUsdLabel,
    totalUsdLabel: items.length > 0 ? formatUsd(totalUsd) : checkoutSummary.totalUsdLabel,
    guestLabel: checkoutSummary.guestLabel,
    marketLabel: checkoutSummary.marketLabel,
    currencyLabel: checkoutSummary.currencyLabel,
  };
  const stepIndex = checkoutSteps.findIndex((item) => item.key === step);
  const isConfirmation = step === "confirmation";

  async function handlePromoSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await applyPromoCode(promoDraft);
    setPromoFeedback(result.message);
  }

  function handlePromoRemove() {
    removePromoCode();
    setPromoFeedback(null);
  }

  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Checkout</p>
            <h1>Secure Checkout</h1>
            <p className={styles.lede}>
              Review your order details, confirm your shipping information, and continue to secure
              payment. Final delivery details are confirmed before payment is captured.
            </p>
          </div>
          <div className={styles.badges}>
            <span>{summary.guestLabel}</span>
            <span>{summary.marketLabel}</span>
            <span>{summary.currencyLabel}</span>
          </div>
        </div>

        {!isConfirmation ? (
          <div className={styles.progressWrap}>
            <p className={styles.progressLabel}>
              Step {stepIndex + 1} of {checkoutSteps.length} — {checkoutSteps[stepIndex]?.label}
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${((stepIndex + 1) / checkoutSteps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className={styles.contentGrid}>
          <div className={styles.mainCard}>{renderStep(step, paymentIntent.clientSecret)}</div>
          <aside className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <p className={styles.eyebrow}>Order summary</p>
              <h2>Checkout Summary</h2>
            </div>

            <div className={styles.itemList}>
              {lineItems.length > 0 ? (
                lineItems.map((item) => (
                  <article key={item.id} className={styles.itemRow}>
                    <div>
                      <p className={styles.itemType}>{item.typeLabel}</p>
                      <h3>{item.name}</h3>
                      <p className={styles.itemQty}>{item.quantityLabel}</p>
                    </div>
                    <strong>{item.priceUsdLabel}</strong>
                  </article>
                ))
              ) : (
                <div className={styles.emptySummaryState}>
                  <strong>Your Cart Is Empty.</strong>
                  <p>Add a product to see a real checkout summary.</p>
                  <Link className={styles.secondaryAction} href="/shop">
                    Continue shopping
                  </Link>
                </div>
              )}
            </div>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{summary.subtotalUsdLabel}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>{summary.shippingUsdLabel}</strong>
              </div>
              <div className={styles.freeShippingLine}>
                {items.length > 0 && shippingUsd === 0
                  ? "Free shipping — order over $150"
                  : "Free shipping on orders of $150 or more"}
              </div>
              <form className={styles.promoForm} onSubmit={handlePromoSubmit}>
                <label className={styles.promoLabel} htmlFor="checkout-promo-code">
                  Promo Code
                </label>
                <div className={styles.promoControls}>
                  <input
                    id="checkout-promo-code"
                    className={styles.promoInput}
                    type="text"
                    value={promoDraft}
                    onChange={(event) => setPromoDraft(event.target.value.toUpperCase())}
                    placeholder="Enter code"
                  />
                  <button className={styles.promoButton} type="submit">
                    Apply
                  </button>
                  {promoCode ? (
                    <button className={styles.promoRemoveButton} type="button" onClick={handlePromoRemove}>
                      Remove
                    </button>
                  ) : null}
                </div>
                {promoCode ? <p className={styles.promoApplied}>Applied: {promoCode}</p> : null}
                {promoFeedback || promoMessage ? (
                  <p className={styles.promoFeedback}>{promoFeedback ?? promoMessage}</p>
                ) : null}
              </form>
              {discountUsd > 0 ? (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <strong>-{formatUsd(discountUsd)}</strong>
                </div>
              ) : null}
              <div className={styles.summaryRow}>
                <span>Estimated tax</span>
                <strong>{summary.taxUsdLabel}</strong>
              </div>
              <p className={styles.summaryNote}>
                Taxes and duties, if applicable, are confirmed before payment is captured.
              </p>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <strong>{summary.totalUsdLabel}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function renderStep(step: CheckoutStepKey, clientSecret: string | null) {
  if (step === "billing") {
    return (
      <div key="billing" className={styles.stepPanel}>
        <BillingStep />
      </div>
    );
  }

  if (step === "shipping") {
    return (
      <div key="shipping" className={styles.stepPanel}>
        <ShippingStep />
      </div>
    );
  }

  // Payment, review, and confirmation share one Elements instance so the
  // in-progress payment survives moving from "enter card" to "review" to
  // "confirm" — remounting Elements between those steps would lose it. Only
  // the inner content re-keys per step, for the slide-in transition.
  if (!clientSecret) {
    return (
      <div key="payment-loading" className={styles.stepPanel}>
        <div className={styles.panelHeader}>
          <p className={styles.eyebrow}>Step 3</p>
          <h2>Payment</h2>
        </div>
        <div className={styles.reviewCard}>
          <p>Preparing secure payment…</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={getStripeBrowserClient()} options={{ clientSecret }}>
      <div key={step} className={styles.stepPanel}>
        {step === "payment" ? <PaymentStep /> : step === "review" ? <ReviewStep /> : <ConfirmationStep />}
      </div>
    </Elements>
  );
}
