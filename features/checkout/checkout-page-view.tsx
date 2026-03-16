import Link from "next/link";

import {
  checkoutLineItems,
  checkoutSteps,
  checkoutSummary,
  usStates,
  type CheckoutStepKey,
} from "@/features/checkout/checkout-data";

import styles from "./checkout-page.module.css";

type CheckoutPageViewProps = {
  step: CheckoutStepKey;
};

export function CheckoutPageView({ step }: CheckoutPageViewProps) {
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
            <span>{checkoutSummary.guestLabel}</span>
            <span>{checkoutSummary.marketLabel}</span>
            <span>{checkoutSummary.currencyLabel}</span>
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
          <div className={styles.mainCard}>{renderStep(step)}</div>
          <aside className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <p className={styles.eyebrow}>Order summary</p>
              <h2>Static checkout summary</h2>
            </div>

            <div className={styles.itemList}>
              {checkoutLineItems.map((item) => (
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
                <strong>{checkoutSummary.subtotalUsdLabel}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>{checkoutSummary.shippingUsdLabel}</strong>
              </div>
              <div className={styles.freeShippingLine}>Shipping fixed at $0.00</div>
              <div className={styles.summaryRow}>
                <span>Estimated tax</span>
                <strong>{checkoutSummary.taxUsdLabel}</strong>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <strong>{checkoutSummary.totalUsdLabel}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function renderStep(step: CheckoutStepKey) {
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
            to preview the 5-step UI structure.
          </p>
          <div className={styles.actionGrid}>
            {checkoutSteps.map((item) => (
              <Link key={item.key} className={styles.linkCard} href={item.href}>
                <strong>{item.label}</strong>
                <span>Open {item.label.toLowerCase()} step</span>
              </Link>
            ))}
          </div>
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
              <input placeholder="name@example.com" type="email" />
            </label>
            <label className={styles.field}>
              <span>Full name</span>
              <input placeholder="Jordan Smith" type="text" />
            </label>
            <label className={styles.field}>
              <span>Address line 1</span>
              <input placeholder="123 Main Street" type="text" />
            </label>
            <label className={styles.field}>
              <span>Address line 2</span>
              <input placeholder="Apartment, suite, etc." type="text" />
            </label>
            <label className={styles.field}>
              <span>City</span>
              <input placeholder="Los Angeles" type="text" />
            </label>
            <label className={styles.field}>
              <span>State</span>
              <select defaultValue="">
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
              <input placeholder="90001" type="text" />
            </label>
            <label className={styles.field}>
              <span>Country</span>
              <input readOnly value="United States" />
            </label>
          </div>
          <Link className={styles.primaryAction} href="/checkout/shipping">
            Continue to shipping
          </Link>
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
          <Link className={styles.primaryAction} href="/checkout/payment">
            Continue to payment
          </Link>
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
              <span>Stripe payment step placeholder</span>
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
          <Link className={styles.primaryAction} href="/checkout/review">
            Continue to review
          </Link>
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
            <p>Jordan Smith</p>
            <p>123 Main Street</p>
            <p>Los Angeles, California 90001</p>
            <p>United States</p>
          </div>
          <div className={styles.reviewCard}>
            <h3>Payment</h3>
            <p>Stripe payment placeholder</p>
          </div>
          <p className={styles.panelBody}>
            This review step is presentation only. Place-order behavior and confirmation
            side effects remain out of scope for this slice.
          </p>
          <Link className={styles.primaryAction} href="/checkout/success">
            Place order UI placeholder
          </Link>
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
            <strong>Order confirmation UI shell</strong>
            <p>Order #LH-0001</p>
            <p>
              Confirmation and email delivery are not implemented in this slice. This page
              exists to complete the PRD checkout flow shell.
            </p>
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
