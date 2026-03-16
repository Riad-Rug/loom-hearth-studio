"use client";

import Link from "next/link";

import {
  checkoutLineItems,
  checkoutSteps,
  checkoutSummary,
  usStates,
  type CheckoutStepKey,
} from "@/features/checkout/checkout-data";
import { formatUsd, getCartItemLabel, useCart } from "@/features/cart/cart-provider";
import {
  checkoutFoundationTodos,
  useCheckout,
} from "@/features/checkout/checkout-provider";
import {
  createOrderSubmissionPayload,
  createOrderSubmissionPreview,
  orderSubmissionTodo,
} from "@/lib/order";
import {
  createStripeCheckoutPaymentDraft,
  createStripeOrderPaymentInput,
  stripeHelpersTodo,
} from "@/lib/stripe";

import styles from "./checkout-page.module.css";

type CheckoutPageViewProps = {
  step: CheckoutStepKey;
};

export function CheckoutPageView({ step }: CheckoutPageViewProps) {
  const { items, shippingUsd, subtotalUsd, totalUsd } = useCart();
  const {
    canAccessPayment,
    canAccessShipping,
    continueFromInformation,
    continueFromPayment,
    continueFromReview,
    continueFromShipping,
    information,
    orderDraft,
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
      : checkoutLineItems;
  const summary = {
    subtotalUsdLabel: items.length > 0 ? formatUsd(subtotalUsd) : checkoutSummary.subtotalUsdLabel,
    shippingUsdLabel: items.length > 0 ? formatUsd(shippingUsd) : checkoutSummary.shippingUsdLabel,
    taxUsdLabel: checkoutSummary.taxUsdLabel,
    totalUsdLabel: items.length > 0 ? formatUsd(totalUsd) : checkoutSummary.totalUsdLabel,
    guestLabel: checkoutSummary.guestLabel,
    marketLabel: checkoutSummary.marketLabel,
    currencyLabel: checkoutSummary.currencyLabel,
  };
  const stripeOrderPaymentInput = createStripeOrderPaymentInput({
    checkoutMode: orderDraft.checkoutMode,
    email: orderDraft.shippingAddress?.email,
    subtotalUsd: orderDraft.subtotalUsd,
    shippingUsd: orderDraft.shippingUsd,
    taxUsd: orderDraft.taxUsd,
    totalUsd: orderDraft.totalUsd,
    currency: orderDraft.currency,
    items: orderDraft.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      priceUsd: item.priceUsd,
    })),
  });
  const stripePaymentDraft = createStripeCheckoutPaymentDraft(stripeOrderPaymentInput);
  const orderSubmissionPayload = createOrderSubmissionPayload({
    orderDraft,
    stripePaymentDraft,
    stripeOrderPaymentInput,
  });
  const derivedSubmissionPreview = createOrderSubmissionPreview(orderSubmissionPayload);

  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Checkout</p>
            <h1>Guest checkout UI shell</h1>
            <p className={styles.lede}>
              This slice implements the PRD checkout structure only. Payment, order
              creation, cart wiring, tax handling, email, and provider integrations remain
              unresolved.
            </p>
          </div>
          <div className={styles.badges}>
            <span>{summary.guestLabel}</span>
            <span>{summary.marketLabel}</span>
            <span>{summary.currencyLabel}</span>
          </div>
        </div>

        <ol className={styles.steps} aria-label="Checkout steps">
          {checkoutSteps.map((item, index) => {
            const isActive = item.key === step;
            const isComplete =
              step !== "start" &&
              checkoutSteps.findIndex((candidate) => candidate.key === step) > index;

            return (
              <li
                key={item.key}
                className={`${styles.stepItem} ${isActive ? styles.stepActive : ""} ${
                  isComplete ? styles.stepComplete : ""
                }`}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <div className={styles.stepCopy}>
                  <strong>{item.label}</strong>
                  <span>{isComplete ? "Complete preview" : "Placeholder step"}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.contentGrid}>
          <div className={styles.mainCard}>
            {renderStep(step, {
              canAccessPayment,
              canAccessShipping,
              continueFromInformation,
              continueFromPayment,
              continueFromReview,
              continueFromShipping,
              information,
              orderDraft,
              orderSubmissionPayload,
              submissionPreview: submissionPreview ?? derivedSubmissionPreview,
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
              {lineItems.map((item) => (
                <article key={item.id} className={styles.itemRow}>
                  <div>
                    <p className={styles.itemType}>{item.typeLabel}</p>
                    <h3>{item.name}</h3>
                    <p className={styles.itemQty}>{item.quantityLabel}</p>
                  </div>
                  <strong>{item.priceUsdLabel}</strong>
                </article>
              ))}
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
              <div className={styles.summaryRow}>
                <span>Estimated tax</span>
                <strong>{summary.taxUsdLabel}</strong>
              </div>
              <p className={styles.summaryNote}>{checkoutFoundationTodos.tax}</p>
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
  canAccessShipping: boolean;
  continueFromInformation: () => void;
  continueFromPayment: () => void;
  continueFromReview: (submissionPreview: {
    status: "placeholder";
    orderReference: string;
    paymentStatus: "pending";
    confirmationLabel: string;
  } | null) => void;
  continueFromShipping: () => void;
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
    paymentMethod: "stripe-placeholder";
  };
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
    mode: "checkout" | "elements" | null;
    publishableKeyReady: boolean;
    session: {
      id: string;
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
            <h2>Checkout route shell</h2>
          </div>
          <p className={styles.panelBody}>
            Guest checkout is the only supported mode in the PRD. Use the step links below
            to move through the existing 5-step flow using the current client-side
            checkout state.
          </p>
          <Link className={styles.primaryAction} href="/checkout/information">
            Start guest checkout
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
          <p className={styles.summaryNote}>
            Guest email and US shipping address are stored in local client state only for
            this slice.
          </p>
          <button
            className={styles.primaryAction}
            disabled={!props.canAccessShipping}
            type="button"
            onClick={props.continueFromInformation}
          >
            Continue to shipping
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
              <strong>Standard shipping</strong>
              <p>United States only</p>
            </div>
            <strong>$0.00</strong>
          </div>
          <p className={styles.panelBody}>
            Shipping is fixed at $0.00 for launch in the PRD. No shipping provider or rate
            calculation logic is implemented in this slice.
          </p>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={props.continueFromShipping}
          >
            Continue to payment
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
          <div className={styles.paymentShell}>
            <div className={styles.cardPreview}>
              <span>
                {props.stripePaymentDraft.provider} {props.stripePaymentDraft.method}
              </span>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Cardholder name</span>
                <input placeholder="Jordan Smith" type="text" />
              </label>
              <label className={styles.field}>
                <span>Card details</span>
                <input placeholder="•••• •••• •••• ••••" type="text" />
              </label>
            </div>
          </div>
          <p className={styles.panelBody}>
            Stripe is confirmed, but this page is UI only. No payment capture, webhook
            handling, or order creation is implemented yet.
          </p>
          <div className={styles.reviewCard}>
            <h3>Stripe boundary state</h3>
            <p>Mode: {props.stripePaymentDraft.mode ?? "Undecided placeholder"}</p>
            <p>
              Publishable key:{" "}
              {props.stripePaymentDraft.publishableKeyReady
                ? "Configured"
                : "Missing placeholder env"}
            </p>
            <p>
              Session:{" "}
              {props.stripePaymentDraft.session
                ? props.stripePaymentDraft.session.id
                : "Not created"}
            </p>
            <p>Status: {props.stripePaymentDraft.paymentStatus}</p>
          </div>
          <p className={styles.summaryNote}>{checkoutFoundationTodos.payment}</p>
          <p className={styles.summaryNote}>{stripeHelpersTodo.checkoutState}</p>
          <button
            className={styles.primaryAction}
            disabled={!props.canAccessPayment}
            type="button"
            onClick={props.continueFromPayment}
          >
            Continue to review
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
            {props.orderDraft.shippingAddress ? (
              <>
                <p>{props.orderDraft.shippingAddress.fullName}</p>
                <p>{props.orderDraft.shippingAddress.address1}</p>
                {props.orderDraft.shippingAddress.address2 ? (
                  <p>{props.orderDraft.shippingAddress.address2}</p>
                ) : null}
                <p>
                  {props.orderDraft.shippingAddress.city}, {props.orderDraft.shippingAddress.state}{" "}
                  {props.orderDraft.shippingAddress.postalCode}
                </p>
                <p>United States</p>
                <p>{props.orderDraft.shippingAddress.email}</p>
              </>
            ) : (
              <p>Guest information must be completed before review.</p>
            )}
          </div>
          <div className={styles.reviewCard}>
            <h3>Shipping method</h3>
            <p>
              {props.orderDraft.shippingMethod
                ? `${props.orderDraft.shippingMethod.label} (${formatUsd(
                    props.orderDraft.shippingMethod.priceUsd,
                  )})`
                : "Standard shipping will be set in the shipping step."}
            </p>
          </div>
          <div className={styles.reviewCard}>
            <h3>Payment</h3>
            <p>
              {props.orderDraft.paymentMethod === "stripe-placeholder"
                ? "Stripe placeholder boundary preserved for a future payment slice."
                : ""}
            </p>
          </div>
          <div className={styles.reviewCard}>
            <h3>Order submission boundary</h3>
            {props.orderSubmissionPayload ? (
              <>
                <p>Email: {props.orderSubmissionPayload.email}</p>
                <p>Items: {props.orderSubmissionPayload.items.length}</p>
                <p>Payment method: {props.orderSubmissionPayload.paymentMethod}</p>
                <p>Status: {props.orderSubmissionPayload.paymentStatus}</p>
              </>
            ) : (
              <p>Submission payload requires completed guest shipping details.</p>
            )}
          </div>
          <p className={styles.panelBody}>
            This review step is presentation only. Place-order behavior and confirmation
            side effects remain out of scope for this slice.
          </p>
          <p className={styles.summaryNote}>{checkoutFoundationTodos.submission}</p>
          <p className={styles.summaryNote}>{orderSubmissionTodo}</p>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={() => props.continueFromReview(props.submissionPreview)}
          >
            Place order UI placeholder
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
            <strong>
              {props.submissionPreview?.confirmationLabel ?? "Order draft confirmation UI shell"}
            </strong>
            <p>{props.orderDraft.shippingAddress?.fullName ?? "Guest checkout draft"}</p>
            {props.submissionPreview ? <p>{props.submissionPreview.orderReference}</p> : null}
            <p>
              Confirmation, order submission, payment execution, and email delivery are not
              implemented in this slice. This page exists to complete the PRD checkout flow
              shell with client-side draft state only.
            </p>
            {props.submissionPreview ? <p>{props.submissionPreview.paymentStatus}</p> : null}
            {props.shippingMethod ? <p>{props.shippingMethod.label}</p> : null}
          </div>
          <Link className={styles.secondaryAction} href="/shop">
            Return to shop
          </Link>
        </div>
      );
    default:
      return null;
  }
}
