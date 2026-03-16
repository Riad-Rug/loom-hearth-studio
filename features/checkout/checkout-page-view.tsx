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
  createOrderConfirmationEmailPayload,
  createOrderConfirmationEmailPreview,
  orderConfirmationEmailTodo,
} from "@/lib/email";
import {
  createCheckoutNonConfirmationRouteViewModel,
  createCheckoutConfirmationViewModel,
  createCheckoutReviewViewModel,
  createOrderSubmissionFailure,
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
    canAccessReview,
    canAccessShipping,
    continueFromInformation,
    continueFromPayment,
    continueFromReview,
    continueFromShipping,
    information,
    orderDraft,
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
  const stripePaymentDraft = createStripeCheckoutPaymentDraft(
    stripeOrderPaymentInput,
  );
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
    canAccessShipping,
    canAccessReview,
    stripePaymentDraft,
  });

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
              continueFromPayment,
              continueFromReview,
              continueFromShipping,
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
  canAccessReview: boolean;
  canAccessShipping: boolean;
  continueFromInformation: () => void;
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
        sessionLabel: string;
        sessionStatusLabel: string;
        paymentStatusLabel: string;
        readinessLabel: string;
      };
      checkoutService: {
        statusLabel: string;
        successUrlLabel: string;
        cancelUrlLabel: string;
        missingClientConfigLabel: string | null;
        missingServerConfigLabel: string | null;
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
      successUrl: string;
      cancelUrl: string;
      missingClientConfig: Array<"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY">;
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
    session: {
      id: string;
      status: "placeholder";
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
          <Link className={styles.primaryAction} href="/checkout/information">
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
          <div className={styles.paymentShell}>
            <div className={styles.cardPreview}>
              <span>
                {props.stripePaymentDraft.provider} {props.stripePaymentDraft.method}
              </span>
            </div>
            <div className={styles.reviewCard}>
              <h3>Stripe launch mode</h3>
              <p>{props.nonConfirmationRouteViewModel.payment.launchModeLabel}</p>
            </div>
            <div className={styles.reviewCard}>
              <h3>Hosted Checkout handoff</h3>
              <p>{props.nonConfirmationRouteViewModel.payment.handoffLabel}</p>
            </div>
            <div className={styles.reviewCard}>
              <h3>Checkout service boundary</h3>
              <p>{props.nonConfirmationRouteViewModel.payment.checkoutService.statusLabel}</p>
              <p>{props.nonConfirmationRouteViewModel.payment.checkoutService.successUrlLabel}</p>
              <p>{props.nonConfirmationRouteViewModel.payment.checkoutService.cancelUrlLabel}</p>
              {props.nonConfirmationRouteViewModel.payment.checkoutService
                .missingClientConfigLabel ? (
                <p>
                  {
                    props.nonConfirmationRouteViewModel.payment.checkoutService
                      .missingClientConfigLabel
                  }
                </p>
              ) : null}
              {props.nonConfirmationRouteViewModel.payment.checkoutService
                .missingServerConfigLabel ? (
                <p>
                  {
                    props.nonConfirmationRouteViewModel.payment.checkoutService
                      .missingServerConfigLabel
                  }
                </p>
              ) : null}
            </div>
            <div className={styles.reviewCard}>
              <h3>Checkout session request</h3>
              {props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest.emptyLabel ? (
                <p>{props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest.emptyLabel}</p>
              ) : (
                <>
                  {props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                    .customerEmailLabel ? (
                    <p>
                      {
                        props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                          .customerEmailLabel
                      }
                    </p>
                  ) : null}
                  {props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                    .lineItemsLabel ? (
                    <p>
                      {
                        props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                          .lineItemsLabel
                      }
                    </p>
                  ) : null}
                  {props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                    .totalLabel ? (
                    <p>
                      {
                        props.nonConfirmationRouteViewModel.payment.checkoutSessionRequest
                          .totalLabel
                      }
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <p className={styles.panelBody}>{props.nonConfirmationRouteViewModel.payment.body}</p>
          <div className={styles.reviewCard}>
            <h3>Stripe boundary state</h3>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.modeLabel}</p>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.statusLabel}</p>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.publishableKeyLabel}</p>
            {props.nonConfirmationRouteViewModel.payment.boundary.missingConfigLabel ? (
              <p>{props.nonConfirmationRouteViewModel.payment.boundary.missingConfigLabel}</p>
            ) : null}
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.sessionLabel}</p>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.sessionStatusLabel}</p>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.paymentStatusLabel}</p>
            <p>{props.nonConfirmationRouteViewModel.payment.boundary.readinessLabel}</p>
          </div>
          <p className={styles.summaryNote}>{checkoutFoundationTodos.payment}</p>
          <p className={styles.summaryNote}>{stripeHelpersTodo.checkoutState}</p>
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
              <p>Guest information must be completed before review.</p>
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
          <div className={styles.reviewCard}>
            <h3>Order submission boundary</h3>
            {props.reviewViewModel.submissionBoundary.emptyLabel ? (
              <p>{props.reviewViewModel.submissionBoundary.emptyLabel}</p>
            ) : (
              <>
                {props.reviewViewModel.submissionBoundary.emailLabel ? (
                  <p>{props.reviewViewModel.submissionBoundary.emailLabel}</p>
                ) : null}
                {props.reviewViewModel.submissionBoundary.itemCountLabel ? (
                  <p>{props.reviewViewModel.submissionBoundary.itemCountLabel}</p>
                ) : null}
                {props.reviewViewModel.submissionBoundary.paymentMethodLabel ? (
                  <p>{props.reviewViewModel.submissionBoundary.paymentMethodLabel}</p>
                ) : null}
                {props.reviewViewModel.submissionBoundary.paymentStatusLabel ? (
                  <p>{props.reviewViewModel.submissionBoundary.paymentStatusLabel}</p>
                ) : null}
              </>
            )}
          </div>
          <p className={styles.panelBody}>
            This review step is presentation only. Place-order behavior and confirmation
            side effects remain out of scope for this slice.
          </p>
          <p className={styles.summaryNote}>{checkoutFoundationTodos.submission}</p>
          <p className={styles.summaryNote}>{orderSubmissionTodo}</p>
          <div className={styles.reviewCard}>
            <h3>Submission attempt state</h3>
            <p>Current state: {props.reviewViewModel.submissionAttempt.stateLabel}</p>
            {props.reviewViewModel.submissionAttempt.failureMessage ? (
              <p>{props.reviewViewModel.submissionAttempt.failureMessage}</p>
            ) : null}
            {props.reviewViewModel.submissionAttempt.previewReference ? (
              <p>{props.reviewViewModel.submissionAttempt.previewReference}</p>
            ) : null}
          </div>
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
            <p>Submission state: {props.confirmationViewModel.submissionStateLabel}</p>
            {props.confirmationViewModel.orderReference ? (
              <p>{props.confirmationViewModel.orderReference}</p>
            ) : null}
            <p>{props.confirmationViewModel.body}</p>
            {props.confirmationViewModel.failureMessage ? (
              <p>{props.confirmationViewModel.failureMessage}</p>
            ) : null}
            {props.confirmationViewModel.paymentStatusLabel ? (
              <p>{props.confirmationViewModel.paymentStatusLabel}</p>
            ) : null}
            {props.confirmationViewModel.shippingLabel ? (
              <p>{props.confirmationViewModel.shippingLabel}</p>
            ) : null}
          </div>
          <div className={styles.confirmationCard}>
            <strong>{props.confirmationViewModel.emailBoundary.headline}</strong>
            <p>{props.confirmationViewModel.emailBoundary.stateLabel}</p>
            {props.confirmationViewModel.emailBoundary.toLabel ? (
              <p>{props.confirmationViewModel.emailBoundary.toLabel}</p>
            ) : null}
            {props.confirmationViewModel.emailBoundary.subjectLabel ? (
              <p>{props.confirmationViewModel.emailBoundary.subjectLabel}</p>
            ) : null}
            {props.confirmationViewModel.emailBoundary.itemCountLabel ? (
              <p>{props.confirmationViewModel.emailBoundary.itemCountLabel}</p>
            ) : null}
            {props.confirmationViewModel.emailBoundary.totalLabel ? (
              <p>{props.confirmationViewModel.emailBoundary.totalLabel}</p>
            ) : null}
            {props.confirmationViewModel.emailBoundary.previewTextLabel ? (
              <p>{props.confirmationViewModel.emailBoundary.previewTextLabel}</p>
            ) : null}
          </div>
          <p className={styles.summaryNote}>{orderConfirmationEmailTodo}</p>
          <Link className={styles.secondaryAction} href="/shop">
            Return to shop
          </Link>
        </div>
      );
    default:
      return null;
  }
}
