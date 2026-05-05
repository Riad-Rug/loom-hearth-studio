"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";

import { contactData } from "@/features/content-pages/content-pages-data";
import { ProductCard } from "@/features/catalog/product-card";
import { trackGenerateLead } from "@/lib/analytics/gtag";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./content-pages.module.css";

type InquiryType = "product-inquiry" | "trade-request" | "order-question";

type ContactSubmissionState = {
  tone: "success" | "error";
  message: string;
  name?: string;
  email?: string;
  values?: {
    inquiryType?: InquiryType;
    name?: string;
    email?: string;
    orderNumber?: string;
    studioName?: string;
    message?: string;
    productName?: string;
  };
};

type ContactPageViewProps = {
  defaults?: {
    inquiryType?: string;
    message?: string;
    productName?: string;
  };
  recommendationContent?: {
    title: string;
    copy: string;
  };
  recommendedProducts: CatalogProductCardViewModel[];
  submitAction: (
    state: ContactSubmissionState | null,
    formData: FormData,
  ) => Promise<ContactSubmissionState>;
};

const inquiryOptions: Array<{ value: InquiryType; label: string }> = [
  { value: "product-inquiry", label: "Product" },
  { value: "trade-request", label: "Trade / project" },
  { value: "order-question", label: "Order help" },
];

const messagePlaceholders: Record<InquiryType, string> = {
  "product-inquiry":
    "Which rug are you interested in? If you know your room size or a rough timeline, that helps us reply with something specific.",
  "trade-request":
    "Tell us about the project - rooms, sizes, timeline, and whether you'd like trade pricing.",
  "order-question": "Share your order number, what happened, and what you need next.",
};

export function ContactPageView({
  defaults,
  recommendationContent,
  recommendedProducts,
  submitAction,
}: ContactPageViewProps) {
  const defaultInquiryType = sanitizeInquiryType(defaults?.inquiryType);
  const formRef = useRef<HTMLFormElement | null>(null);
  const nameErrorId = useId();
  const emailHintId = useId();
  const emailErrorId = useId();
  const orderHintId = useId();
  const orderErrorId = useId();
  const messageHintId = useId();
  const messageErrorId = useId();
  const [state, formAction, isPending] = useActionState(submitAction, null);
  const [selectedInquiryType, setSelectedInquiryType] =
    useState<InquiryType>(defaultInquiryType);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const preservedValues = state?.tone === "error" ? state.values : undefined;

  useEffect(() => {
    if (preservedValues?.inquiryType) {
      setSelectedInquiryType(preservedValues.inquiryType);
    }
  }, [preservedValues?.inquiryType]);

  function validateField(name: string, value: FormDataEntryValue | null) {
    const stringValue = typeof value === "string" ? value.trim() : "";

    if (name === "name" && !stringValue) {
      return "Please add your name so we know how to reply.";
    }

    if (name === "email") {
      if (!stringValue) {
        return "We need an email to send our reply.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
        return "That email looks off - mind double-checking?";
      }
    }

    if (name === "orderNumber" && selectedInquiryType === "order-question" && !stringValue) {
      return "Add your order number so we can look up the request quickly.";
    }

    if (name === "message") {
      if (!stringValue) {
        return "Add a short message so we can reply with something useful.";
      }

      if (stringValue.length < 10) {
        return "A sentence or two helps us respond properly.";
      }
    }

    return "";
  }

  function handleBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const fieldName = event.currentTarget.name;
    const fieldValue = event.currentTarget.value;
    const error = validateField(fieldName, fieldValue);

    setFieldErrors((current) => ({
      ...current,
      [fieldName]: error,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = {
      name: validateField("name", formData.get("name")),
      email: validateField("email", formData.get("email")),
      orderNumber: validateField("orderNumber", formData.get("orderNumber")),
      message: validateField("message", formData.get("message")),
    };
    const firstInvalidField = Object.entries(nextErrors).find((entry) => Boolean(entry[1]))?.[0];
    const hasErrors = Object.values(nextErrors).some(Boolean);

    setFieldErrors(nextErrors);

    if (hasErrors) {
      event.preventDefault();
      const invalidField = form.elements.namedItem(firstInvalidField ?? "");
      if (invalidField instanceof HTMLElement) {
        invalidField.focus();
      }
      return;
    }

    trackGenerateLead({
      inquiryType: selectedInquiryType,
      productName: defaults?.productName,
    });
  }

  if (state?.tone === "success") {
    return (
      <div className={styles.page}>
        <ContactHero />

        <section className={styles.contactGrid}>
          <ContactSupportCard />

          <div className={`${styles.card} ${styles.contactPanel}`}>
            <div className={styles.contactSuccessState} role="status">
              <p className={styles.contactFormNoteTitle}>Message received.</p>
              <p className={styles.contactFormNoteMessage}>{state.message}</p>
              <div className={styles.contactSuccessLinks} aria-label="Suggested next steps">
                <span>Keep browsing while we reply:</span>
                <Link href="/shop">See the full collection</Link>
                <Link href="/lookbook">Browse the lookbook</Link>
              </div>
            </div>

              {recommendedProducts.length ? (
                <section className={styles.contactRecommendationSection}>
                  <div className={styles.contactRecommendationIntro}>
                    <p className={styles.contactFormNoteTitle}>
                      {recommendationContent?.title ?? "Recommended pieces"}
                    </p>
                    <p className={styles.contactRecommendationCopy}>
                      {recommendationContent?.copy ??
                        "A few pieces to keep in view while the studio reviews your message."}
                    </p>
                  </div>
                <div className={styles.contactRecommendationGrid}>
                  {recommendedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>

        <ContactBusinessLine />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ContactHero />

      <section className={styles.contactGrid}>
        <ContactSupportCard />

        <div className={`${styles.card} ${styles.contactPanel}`}>
          <div className={styles.cardBody}>
            <h2>Send a message</h2>
          </div>

          <form
            ref={formRef}
            action={formAction}
            className={styles.contactForm}
            noValidate
            onSubmit={handleSubmit}
          >
            <input
              aria-hidden="true"
              className={styles.contactHoneypot}
              name="ref_40"
              tabIndex={-1}
              type="text"
            />
            {preservedValues?.productName || defaults?.productName ? (
              <input
                name="productName"
                type="hidden"
                value={preservedValues?.productName ?? defaults?.productName}
              />
            ) : null}

            <fieldset className={styles.contactSegmentGroup}>
              <legend className={styles.contactSegmentLegend}>Inquiry type</legend>
              <div className={styles.contactSegmentGrid}>
                {inquiryOptions.map((option) => (
                  <label key={option.value} className={styles.contactSegmentLabel}>
                    <input
                      checked={selectedInquiryType === option.value}
                      name="inquiryType"
                      onChange={() => setSelectedInquiryType(option.value)}
                      required
                      type="radio"
                      value={option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.contactIdentityGrid}>
              <ValidatedField error={fieldErrors.name} errorId={nameErrorId}>
                <label className={styles.contactLabel} htmlFor="contact-name">
                  Your name <span className={styles.contactRequiredMarker}>*</span>
                </label>
                <input
                  aria-describedby={fieldErrors.name ? nameErrorId : undefined}
                  aria-invalid={Boolean(fieldErrors.name)}
                  autoComplete="name"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.name}
                  id="contact-name"
                  name="name"
                  onBlur={handleBlur}
                  required
                  type="text"
                />
              </ValidatedField>

              <ValidatedField error={fieldErrors.email} errorId={emailErrorId}>
                <label className={styles.contactLabel} htmlFor="contact-email">
                  Email <span className={styles.contactRequiredMarker}>*</span>
                </label>
                <input
                  aria-describedby={
                    fieldErrors.email ? `${emailHintId} ${emailErrorId}` : emailHintId
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.email}
                  id="contact-email"
                  inputMode="email"
                  name="email"
                  onBlur={handleBlur}
                  required
                  spellCheck={false}
                  type="email"
                />
                <p className={styles.contactFieldHint} id={emailHintId}>
                  Required. We only use this to reply.
                </p>
              </ValidatedField>
            </div>

            {selectedInquiryType === "order-question" ? (
              <ValidatedField error={fieldErrors.orderNumber} errorId={orderErrorId}>
                <label className={styles.contactLabel} htmlFor="contact-order-number">
                  Order number <span className={styles.contactRequiredMarker}>*</span>
                </label>
                <input
                  aria-describedby={
                    fieldErrors.orderNumber
                      ? `${orderHintId} ${orderErrorId}`
                      : orderHintId
                  }
                  aria-invalid={Boolean(fieldErrors.orderNumber)}
                  autoComplete="off"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.orderNumber}
                  id="contact-order-number"
                  inputMode="text"
                  name="orderNumber"
                  onBlur={handleBlur}
                  required
                  spellCheck={false}
                  type="text"
                />
                <p className={styles.contactFieldHint} id={orderHintId}>
                  Required for order-help requests. Use the reference from your confirmation email.
                </p>
              </ValidatedField>
            ) : null}

            {selectedInquiryType === "trade-request" ? (
              <ValidatedField>
                <label className={styles.contactLabel} htmlFor="contact-studio-name">
                  Studio or company
                </label>
                <input
                  className={styles.contactInput}
                  defaultValue={preservedValues?.studioName}
                  id="contact-studio-name"
                  name="studioName"
                  type="text"
                />
              </ValidatedField>
            ) : null}

            <ValidatedField error={fieldErrors.message} errorId={messageErrorId}>
              <label className={styles.contactLabel} htmlFor="contact-message">
                How can we help? <span className={styles.contactRequiredMarker}>*</span>
              </label>
              <textarea
                aria-describedby={
                  fieldErrors.message ? `${messageHintId} ${messageErrorId}` : messageHintId
                }
                aria-invalid={Boolean(fieldErrors.message)}
                className={styles.contactTextarea}
                defaultValue={preservedValues?.message ?? defaults?.message}
                id="contact-message"
                name="message"
                onBlur={handleBlur}
                placeholder={messagePlaceholders[selectedInquiryType]}
                required
                rows={7}
              />
              <p className={styles.contactFieldHint} id={messageHintId}>
                Required. Mention the rug name, room size, timeline, or the delivery issue if you
                already know it.
              </p>
            </ValidatedField>

            <div className={styles.contactFormFooter}>
              {state?.tone === "error" ? (
                <div
                  className={`${styles.contactFormNote} ${styles.contactFormError}`}
                  role="status"
                >
                  <p className={styles.contactFormNoteTitle}>We could not send your message</p>
                  <p className={styles.contactFormNoteMessage}>{state.message}</p>
                </div>
              ) : null}
              <button className={styles.primaryAction} disabled={isPending} type="submit">
                {isPending ? (
                  <>
                    <span className={styles.contactSpinner} aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
              <p className={styles.contactFieldHint}>
                Required fields are marked in red. Personal reply within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <ContactBusinessLine />
    </div>
  );
}

function ContactHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBody}>
        <h1>{contactData.title}</h1>
        <p className={styles.lede}>{contactData.body}</p>
      </div>
    </section>
  );
}

function ContactSupportCard() {
  return (
    <aside className={`${styles.card} ${styles.contactMeta}`} id="contact-details">
      <div className={styles.cardBody}>
        <h2>Prefer a direct message?</h2>
        <p className={styles.body}>
          Write to <a href={`mailto:${contactData.emailLabel}`}>{contactData.emailLabel}</a> and
          we&apos;ll reply within 24 hours.
        </p>
        <p className={styles.contactFieldHint}>Hours: {contactData.hoursLabel}</p>
      </div>

      <a
        className={styles.whatsappAction}
        href={contactData.whatsappUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <WhatsAppIcon />
        WhatsApp {contactData.whatsappLabel}
      </a>
    </aside>
  );
}

function ContactBusinessLine() {
  return (
    <p className={styles.contactBusinessLine}>
      {contactData.legalNameLabel} - Marrakech, Morocco - Wyoming, USA - Complaints by email
    </p>
  );
}

function ValidatedField({
  children,
  error,
  errorId,
}: {
  children: React.ReactNode;
  error?: string;
  errorId?: string;
}) {
  return (
    <div className={styles.contactFieldGroup}>
      {children}
      {error ? (
        <p className={styles.contactFieldError} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function sanitizeInquiryType(value: string | undefined): InquiryType {
  return value === "trade-request" || value === "order-question"
    ? value
    : "product-inquiry";
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="M12.02 2.4a9.61 9.61 0 0 0-8.33 14.4L2 22l5.38-1.62a9.62 9.62 0 1 0 4.64-17.98Zm0 17.45a7.97 7.97 0 0 1-4.06-1.11l-.29-.17-3.19.96.99-3.1-.19-.31a7.97 7.97 0 1 1 6.74 3.73Zm4.37-5.97c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.91-1.18-.7-.63-1.18-1.4-1.32-1.64-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.41-.41-.56-.42h-.48c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.68 2.57 4.08 3.6.57.25 1.02.4 1.37.51.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z"
        fill="currentColor"
      />
    </svg>
  );
}
