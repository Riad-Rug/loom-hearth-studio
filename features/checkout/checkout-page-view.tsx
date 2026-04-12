"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  checkoutSteps,
  checkoutSummary,
  usStates,
  type CheckoutStepKey,
} from "@/features/checkout/checkout-data";
import { formatUsd, getCartItemLabel, useCart } from "@/features/cart/cart-provider";
import { useCheckout } from "@/features/checkout/checkout-provider";
import {
  createOrderConfirmationEmailPayload,
  createOrderConfirmationEmailPreview,
} from "@/lib/email";
import { trackPurchase } from "@/lib/analytics/gtag";
import {
  createCheckoutNonConfirmationRouteViewModel,
  createCheckoutConfirmationViewModel,
  createCheckoutReviewViewModel,
  createOrderSubmissionFailure,
  createOrderSubmissionPayload,
  createOrderSubmissionPreview,
} from "@/lib/order";

import styles from "./checkout-page.module.css";

type CheckoutPageViewProps = {
  step: CheckoutStepKey;
};

export function CheckoutPageView({ step }: CheckoutPageViewProps) {
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
  const {
    canAccessPayment,
    canAccessReview,
    canAccessShipping,
    continueFromInformation,
    executeCheckoutSession,
    continueFromPayment,
    continueFromReview,
    continueFromShipping,
    checkoutExecutionAttempt,
    information,
    orderDraft,
    stripeOrderPaymentInput,
    stripePaymentDraft,
    submissionAttempt,
    submissionPreview,
    shippingMethod,
    updateInformation,
  } = useCheckout();
  const lineItems =
    items.length > 0
      ? items.map((item) => ({
          id: item.id,
          name: item.name,
          quantityLabel: `Qty ${item.quantity}`,
          typeLabel: getCartItemLabel(item),
          priceUsdLabel: formatUsd(item.priceUsd),
        }))
      : [];
  const summary = {
    subtotalUsdLabel: items.length > 0 ? formatUsd(subtotalUsd) : checkoutSummary.subtotalUsdLabel,
    shippingUsdLabel: items.length > 0 ? formatUsd(shippingUsd) : checkoutSummary.shippingUsdLabel,
    taxUsdLabel: checkoutSummary.taxUsdLabel,
    totalUsdLabel: items.length > 0 ? formatUsd(totalUsd) : checkoutSummary.totalUsdLabel,
    guestLabel: checkoutSummary.guestLabel,
    marketLabel: checkoutSummary.marketLabel,
    currencyLabel: checkoutSummary.currencyLabel,
  };
  const orderSubmissionPayload = createOrderSubmissionPayload({
    orderDraft,
    stripePaymentDraft,
    stripeOrderPaymentInput,
  });
  const derivedSubmissionPreview = createOrderSubmissionPreview(orderSubmissionPayload);
  const resolvedSubmissionPreview = submissionPreview ?? derivedSubmissionPreview;
  const orderConfirmationEmailPayload = createOrderConfirmationEmailPayload({
    submissionPayload: orderSubmissionPayload,
    submissionPreview:
      submissionAttempt.status === "success" ? resolvedSubmissionPreview : null,
  });
  const orderConfirmationEmailPreview = createOrderConfirmationEmailPreview(
    orderConfirmationEmailPayload,
  );

  useEffect(() => {
    setPromoDraft(promoCode ?? "");
  }, [promoCode]);

  useEffect(() => {
    if (step !== "confirmation" || !resolvedSubmissionPreview || !orderSubmissionPayload) {
      return;
    }

    const sessionKey = `loom-hearth.purchase.${resolvedSubmissionPreview.orderReference}`;

    if (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    trackPurchase({
      transactionId: resolvedSubmissionPreview.orderReference,
      currency: "USD",
      value: orderDraft.totalUsd,
      items: orderSubmissionPayload.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
      })),
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(sessionKey, "sent");
    }
  }, [orderDraft.totalUsd, orderSubmissionPayload, resolvedSubmissionPreview, step]);
  const confirmationViewModel = createCheckoutConfirmationViewModel({
    submissionAttempt,
    submissionPreview: resolvedSubmissionPreview,
    orderConfirmationEmailPayload,
    orderConfirmationEmailPreview,
    customerName: orderDraft.shippingAddress?.fullName ?? null,
    shippingLabel: shippingMethod?.label ?? null,
  });
  const submissionFailure = createOrderSubmissionFailure({
    hasPayload: Boolean(orderSubmissionPayload),
    hasPaymentConfig: stripePaymentDraft.publishableKeyReady,
  });
  const reviewViewModel = createCheckoutReviewViewModel({
    orderDraft,
    orderSubmissionPayload,
    submissionFailure,
    submissionPreview: resolvedSubmissionPreview,
    submissionState: submissionAttempt.status,
    stripePaymentDraft,
  });
  const nonConfirmationRouteViewModel = createCheckoutNonConfirmationRouteViewModel({
    step,
    checkoutSteps,
    hasCartItems: items.length > 0,
    canAccessShipping,
    canAccessReview,
    checkoutExecutionAttempt,
    stripePaymentDraft,
  });

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
            <p className={styles.eyebrow}>{nonConfirmationRouteViewModel.shell.eyebrow}</p>
            <h1>{nonConfirmationRouteViewModel.shell.title}</h1>
            <p className={styles.lede}>{nonConfirmationRouteViewModel.shell.body}</p>
          </div>
          <div className={styles.badges}>
            <span>{summary.guestLabel}</span>
            <span>{summary.marketLabel}</span>
            <span>{summary.currencyLabel}</span>
          </div>
        </div>

        <ol className={styles.steps} aria-label="Checkout steps">
          {nonConfirmationRouteViewModel.stepIndicators.map((item, index) => {
            return (
              <li
                key={item.key}
                className={`${styles.stepItem} ${item.isActive ? styles.stepActive : ""} ${
                  item.isComplete ? styles.stepComplete : ""
                }`}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <div className={styles.stepCopy}>
                  <strong>{item.label}</strong>
                  <span>{item.stateLabel}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.contentGrid}>
          <div className={styles.mainCard}>
            {renderStep(step, {
              canAccessPayment,
              canAccessReview,
              canAccessShipping,
              continueFromInformation,
              executeCheckoutSession,
              continueFromPayment,
              continueFromReview,
              continueFromShipping,
              checkoutExecutionAttempt,
              information,
              orderDraft,
              orderConfirmationEmailPayload,
              orderConfirmationEmailPreview,
              orderSubmissionPayload,
              nonConfirmationRouteViewModel,
              confirmationViewModel,
              reviewViewModel,
              submissionAttempt,
              submissionFailure,
              submissionPreview: resolvedSubmissionPreview,
              shippingMethod,
              stripePaymentDraft,
              updateInformation,
            })}
          </div>
          <aside className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <p className={styles.eyebrow}>Order summary</p>
              <h2>Checkout summary</h2>
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
                  <strong>Your cart is empty.</strong>
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
              <div className={styles.freeShippingLine}>Shipping fixed at $0.00</div>
              <form className={styles.promoForm} onSubmit={handlePromoSubmit}>
                <label className={styles.promoLabel} htmlFor="checkout-promo-code">
                  Promo code
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
                {promoFeedback || promoMessage ? <p className={styles.promoFeedback}>{promoFeedback ?? promoMessage}</p> : null}
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
              <p className={styles.summaryNote}>Taxes and duties, if applicable, are confirmed before payment is captured.</p>
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

type CheckoutStepRenderProps = {
  canAccessPayment: boolean;
  canAccessReview: boolean;
  canAccessShipping: boolean;
  continueFromInformation: () => void;
  executeCheckoutSession: () => Promise<void>;
  continueFromPayment: () => void;
  continueFromReview: (input: {
    submissionPreview: {
      status: "placeholder";
      orderReference: string;
      paymentStatus: "pending";
      confirmationLabel: string;
    } | null;
    submissionFailure: {
      status: "placeholder";
      code: "missing-payload" | "missing-payment-config";
      message: string;
    } | null;
  }) => void;
  continueFromShipping: () => void;
  checkoutExecutionAttempt: {
    status: "idle" | "submitting" | "success" | "failure";
    result: {
      status: "created" | "configuration-error" | "api-error" | "validation-error";
      session: {
        id: string;
        mode: "checkout";
        url?: string;
        expiresAt?: string;
        status: "placeholder" | "created";
      } | null;
      redirectTarget: string | null;
      validationIssues: Array<{
        code: string;
        message: string;
      }>;
      message: string;
    } | null;
    message: string | null;
  };
  information: {
    email: string;
    fullName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: "US";
  };
  orderDraft: {
    shippingAddress: {
      fullName: string;
      email: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: "US";
    } | null;
    shippingMethod: {
      label: string;
      priceUsd: 0;
    } | null;
    promoCode?: string | null;
    discountUsd: number;
    paymentMethod: "stripe-placeholder";
  };
  orderConfirmationEmailPayload: {
    to: string;
    orderReference: string;
    customerName: string;
    shippingLabel: string;
    totalUsd: number;
    currency: "USD";
    itemCount: number;
  } | null;
  orderConfirmationEmailPreview: {
    status: "placeholder";
    subject: string;
    message: {
      to: string;
      subject: string;
    };
  } | null;
  orderSubmissionPayload: {
    email: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
    paymentMethod: "stripe-placeholder";
    paymentStatus: "pending";
  } | null;
  nonConfirmationRouteViewModel: {
    start: {
      title: string;
      body: string;
      actionLabel: string;
      actionHref: string;
    };
    information: {
      note: string;
      actionLabel: string;
    };
    shipping: {
      optionTitle: string;
      optionBody: string;
      optionPriceLabel: string;
      body: string;
      actionLabel: string;
    };
    payment: {
      body: string;
      launchModeLabel: string;
      handoffLabel: string;
      boundary: {
        modeLabel: string;
        statusLabel: string;
        publishableKeyLabel: string;
        missingConfigLabel: string | null;
        sessionResponseLabel: string;
        sessionResponseStatusLabel: string;
        paymentStatusLabel: string;
        readinessLabel: string;
      };
      checkoutService: {
        statusLabel: string;
        endpointLabel: string;
        successUrlLabel: string;
        cancelUrlLabel: string;
        missingClientConfigLabel: string | null;
        missingServerConfigLabel: string | null;
      };
      checkoutExecution: {
        statusLabel: string;
        endpointLabel: string;
        redirectTargetLabel: string | null;
        missingServerConfigLabel: string | null;
      };
      executionAttempt: {
        stateLabel: string;
        messageLabel: string | null;
        redirectTargetLabel: string | null;
        actionLabel: string;
      };
      checkoutSessionRequest: {
        customerEmailLabel: string | null;
        lineItemsLabel: string | null;
        totalLabel: string | null;
        emptyLabel: string | null;
      };
      actionLabel: string;
    };
  };
  confirmationViewModel: {
    headline: string;
    customerLabel: string;
    submissionStateLabel: string;
    orderReference: string | null;
    body: string;
    failureMessage: string | null;
    paymentStatusLabel: string | null;
    shippingLabel: string | null;
    emailBoundary: {
      headline: string;
      stateLabel: string;
      toLabel: string | null;
      subjectLabel: string | null;
      itemCountLabel: string | null;
      totalLabel: string | null;
      previewTextLabel: string | null;
    };
  };
  reviewViewModel: {
    shippingAddressLines: string[] | null;
    shippingMethodLabel: string;
    paymentLabel: string;
    submissionBoundary: {
      emailLabel: string | null;
      itemCountLabel: string | null;
      paymentMethodLabel: string | null;
      paymentStatusLabel: string | null;
      emptyLabel: string | null;
    };
    submissionAttempt: {
      stateLabel: string;
      failureMessage: string | null;
      previewReference: string | null;
    };
    placeOrderLabel: string;
    stripeBoundary: {
      modeLabel: string;
      statusLabel: string;
    };
  };
  submissionAttempt: {
    status: "idle" | "submitting" | "success" | "failure";
    preview: {
      status: "placeholder";
      orderReference: string;
      paymentStatus: "pending";
      confirmationLabel: string;
    } | null;
    failure: {
      status: "placeholder";
      code: "missing-payload" | "missing-payment-config";
      message: string;
    } | null;
  };
  submissionFailure: {
    status: "placeholder";
    code: "missing-payload" | "missing-payment-config";
    message: string;
  } | null;
  submissionPreview: {
    status: "placeholder";
    orderReference: string;
    paymentStatus: "pending";
    confirmationLabel: string;
  } | null;
  shippingMethod: {
    label: string;
    priceUsd: 0;
  } | null;
  stripePaymentDraft: {
    provider: "stripe";
    method: "stripe-placeholder";
    mode: "checkout";
    publishableKeyReady: boolean;
    launchMode: "checkout";
    missingConfig: Array<"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY">;
    isReadyForPlaceholderFlow: boolean;
    paymentStepStatus: "launch-mode-missing-config" | "ready-placeholder";
    checkoutService: {
      mode: "checkout";
      status: "missing-client-config" | "missing-server-config" | "ready-placeholder";
      sessionEndpointPath: string;
      successUrl: string;
      cancelUrl: string;
      missingClientConfig: Array<"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY">;
      missingServerConfig: Array<"STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET">;
    };
    checkoutExecution: {
      endpointPath: string;
      status: "missing-server-config" | "ready";
      redirectTarget: string | null;
      missingServerConfig: Array<"STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET">;
    };
    checkoutSessionRequest: {
      mode: "checkout";
      customerEmail?: string;
      successUrl: string;
      cancelUrl: string;
      currency: "USD";
      subtotalUsd: number;
      shippingUsd: 0;
      taxUsd: number;
      totalUsd: number;
      lineItems: Array<{
        id: string;
        name: string;
        quantity: number;
        unitAmountUsd: number;
      }>;
      metadata: {
        checkoutMode: "guest";
      };
    } | null;
    checkoutSessionResponse: {
      id: string;
      mode: "checkout";
      url?: string;
      expiresAt?: string;
      status: "placeholder" | "created";
    } | null;
    paymentStatus: "pending";
  };
  updateInformation: (
    field:
      | "email"
      | "fullName"
      | "address1"
      | "address2"
      | "city"
      | "state"
      | "postalCode"
      | "country",
    value: string,
  ) => void;
};

function renderStep(step: CheckoutStepKey, props: CheckoutStepRenderProps) {
  switch (step) {
    case "start":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Start</p>
            <h2>{props.nonConfirmationRouteViewModel.start.title}</h2>
          </div>
          <p className={styles.panelBody}>{props.nonConfirmationRouteViewModel.start.body}</p>
          <Link
            className={styles.primaryAction}
            href={props.nonConfirmationRouteViewModel.start.actionHref as Route}
          >
            {props.nonConfirmationRouteViewModel.start.actionLabel}
          </Link>
        </div>
      );
    case "information":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Step 1</p>
            <h2>Information</h2>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                placeholder="name@example.com"
                type="email"
                value={props.information.email}
                onChange={(event) => props.updateInformation("email", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                placeholder="Jordan Smith"
                type="text"
                value={props.information.fullName}
                onChange={(event) => props.updateInformation("fullName", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Address line 1</span>
              <input
                placeholder="123 Main Street"
                type="text"
                value={props.information.address1}
                onChange={(event) => props.updateInformation("address1", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Address line 2</span>
              <input
                placeholder="Apartment, suite, etc."
                type="text"
                value={props.information.address2}
                onChange={(event) => props.updateInformation("address2", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>City</span>
              <input
                placeholder="Los Angeles"
                type="text"
                value={props.information.city}
                onChange={(event) => props.updateInformation("city", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>State</span>
              <select
                value={props.information.state}
                onChange={(event) => props.updateInformation("state", event.target.value)}
              >
                <option disabled value="">
                  Select a state
                </option>
                {usStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>ZIP code</span>
              <input
                placeholder="90001"
                type="text"
                value={props.information.postalCode}
                onChange={(event) => props.updateInformation("postalCode", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Country</span>
              <input readOnly value="United States" />
            </label>
          </div>
          <p className={styles.summaryNote}>{props.nonConfirmationRouteViewModel.information.note}</p>
          <div className={styles.reviewCard}>
            <h3>Need help before you continue?</h3>
            <p>If you are checking out a one-of-one rug and want guidance before payment, use the inquiry flow and we will review the piece with you directly.</p>
            <Link className={styles.secondaryAction} href="/contact">
              Contact the studio
            </Link>
          </div>
          <button
            className={styles.primaryAction}
            disabled={!props.canAccessShipping}
            type="button"
            onClick={props.continueFromInformation}
          >
            {props.nonConfirmationRouteViewModel.information.actionLabel}
          </button>
        </div>
      );
    case "shipping":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Step 2</p>
            <h2>Shipping</h2>
          </div>
          <div className={styles.optionCard}>
            <div>
              <strong>{props.nonConfirmationRouteViewModel.shipping.optionTitle}</strong>
              <p>{props.nonConfirmationRouteViewModel.shipping.optionBody}</p>
            </div>
            <strong>{props.nonConfirmationRouteViewModel.shipping.optionPriceLabel}</strong>
          </div>
          <p className={styles.panelBody}>{props.nonConfirmationRouteViewModel.shipping.body}</p>
          <div className={styles.reviewCard}>
            <h3>Shipping review</h3>
            <p>We review the destination and shipping conditions before payment is captured. If anything needs clarification, we contact you before moving forward.</p>
          </div>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={props.continueFromShipping}
          >
            {props.nonConfirmationRouteViewModel.shipping.actionLabel}
          </button>
        </div>
      );
    case "payment":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Step 3</p>
            <h2>Payment</h2>
          </div>
          <div className={styles.reviewCard}>
            <h3>Secure payment</h3>
            <p>{props.nonConfirmationRouteViewModel.payment.body}</p>
          </div>
          <div className={styles.reviewCard}>
            <h3>What happens next</h3>
            <p>
              You will be redirected to Stripe Checkout to review your payment details. After
              checkout, we confirm your order details, destination, and next steps by email before
              payment is captured.
            </p>
          </div>
          <div className={styles.reviewCard}>
            <h3>Prefer a reviewed buying path?</h3>
            <p>For one-of-one rugs or project purchases, you can contact the studio instead of continuing through checkout.</p>
            <Link className={styles.secondaryAction} href="/contact?inquiryType=product-inquiry">
              Start an inquiry instead
            </Link>
          </div>
          {props.checkoutExecutionAttempt.message ? (
            <div className={styles.reviewCard}>
              <h3>Checkout update</h3>
              <p>{props.checkoutExecutionAttempt.message}</p>
            </div>
          ) : null}
          <button
            className={styles.secondaryAction}
            disabled={
              !props.canAccessPayment ||
              props.checkoutExecutionAttempt.status === "submitting"
            }
            type="button"
            onClick={() => {
              void props.executeCheckoutSession();
            }}
          >
            {props.nonConfirmationRouteViewModel.payment.executionAttempt.actionLabel}
          </button>
          <button
            className={styles.primaryAction}
            disabled={!props.canAccessReview}
            type="button"
            onClick={props.continueFromPayment}
          >
            {props.nonConfirmationRouteViewModel.payment.actionLabel}
          </button>
        </div>
      );
    case "review":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Step 4</p>
            <h2>Review</h2>
          </div>
          <div className={styles.reviewCard}>
            <h3>Shipping address</h3>
            {props.reviewViewModel.shippingAddressLines ? (
              <>
                {props.reviewViewModel.shippingAddressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </>
            ) : (
              <p>Complete your shipping details before reviewing your order.</p>
            )}
          </div>
          <div className={styles.reviewCard}>
            <h3>Shipping method</h3>
            <p>{props.reviewViewModel.shippingMethodLabel}</p>
          </div>
          <div className={styles.reviewCard}>
            <h3>Payment</h3>
            <p>{props.reviewViewModel.paymentLabel}</p>
          </div>
          <p className={styles.panelBody}>
            Review your details before continuing. After checkout, we confirm the piece,
            destination, and next steps by email before payment is captured.
          </p>
          <div className={styles.reviewCard}>
            <h3>Final review</h3>
            <p>This step confirms your checkout details in our system. If you need to switch to a more guided inquiry flow, contact the studio before proceeding.</p>
          </div>
          {props.reviewViewModel.submissionAttempt.failureMessage ? (
            <div className={styles.reviewCard}>
              <h3>Checkout update</h3>
              <p>{props.reviewViewModel.submissionAttempt.failureMessage}</p>
            </div>
          ) : null}
          <button
            className={styles.primaryAction}
            type="button"
            onClick={() =>
              props.continueFromReview({
                submissionPreview: props.submissionPreview,
                submissionFailure: props.submissionFailure,
              })
            }
          >
            {props.reviewViewModel.placeOrderLabel}
          </button>
        </div>
      );
    case "confirmation":
      return (
        <div className={styles.panelStack}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Step 5</p>
            <h2>Confirmation</h2>
          </div>
          <div className={styles.confirmationCard}>
            <strong>{props.confirmationViewModel.headline}</strong>
            <p>{props.confirmationViewModel.customerLabel}</p>
            <p>{props.confirmationViewModel.body}</p>
            {props.confirmationViewModel.failureMessage ? (
              <p>{props.confirmationViewModel.failureMessage}</p>
            ) : null}
            {props.confirmationViewModel.orderReference ? (
              <p>Reference: {props.confirmationViewModel.orderReference}</p>
            ) : null}
            {props.confirmationViewModel.shippingLabel ? (
              <p>{props.confirmationViewModel.shippingLabel}</p>
            ) : null}
          </div>
          <div className={styles.reviewCard}>
            <h3>Next step support</h3>
            <p>If you need to clarify delivery timing, product questions, or project details after checkout, reply to the confirmation email or contact the studio directly.</p>
          </div>
          <div className={styles.formGrid}>
            <Link className={styles.secondaryAction} href="/shop">
              Return to shop
            </Link>
            <Link className={styles.secondaryAction} href="/contact?inquiryType=order-question">
              Contact the studio
            </Link>
          </div>
        </div>
      );
    default:
      return null;
  }
}
