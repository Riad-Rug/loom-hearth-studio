"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";

import { trackGenerateLead } from "@/lib/analytics/gtag";
import { contactData } from "@/features/content-pages/content-pages-data";

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
  "order-question": "Share your order number and what you need.",
};

export function ContactPageView({
  defaults,
  submitAction,
}: ContactPageViewProps) {
  const defaultInquiryType = sanitizeInquiryType(defaults?.inquiryType);
  const nameErrorId = useId();
  const emailHintId = useId();
  const emailErrorId = useId();
  const messageHintId = useId();
  const messageErrorId = useId();
  const [state, formAction, isPending] = useActionState(
    submitAction,
    null,
  );
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
    const error = validateField(event.currentTarget.name, event.currentTarget.value);

    setFieldErrors((current) => ({
      ...current,
      [event.currentTarget.name]: error,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = {
      name: validateField("name", formData.get("name")),
      email: validateField("email", formData.get("email")),
      message: validateField("message", formData.get("message")),
    };
    const hasErrors = Object.values(nextErrors).some(Boolean);

    setFieldErrors(nextErrors);

    if (hasErrors) {
      event.preventDefault();
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
                <span>In the meantime:</span>
                <Link href="/lookbook">Browse the lookbook</Link>
                <Link href="/shop">See new arrivals</Link>
              </div>
            </div>
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

          <form action={formAction} className={styles.contactForm} noValidate onSubmit={handleSubmit}>
            <input aria-hidden="true" className={styles.contactHoneypot} name="ref_40" tabIndex={-1} type="text" />
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
                  Your name
                </label>
                <input
                  aria-describedby={fieldErrors.name ? nameErrorId : undefined}
                  aria-invalid={Boolean(fieldErrors.name)}
                  id="contact-name"
                  autoComplete="name"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.name}
                  name="name"
                  onBlur={handleBlur}
                  required
                  type="text"
                />
              </ValidatedField>

              <ValidatedField error={fieldErrors.email} errorId={emailErrorId}>
                <label className={styles.contactLabel} htmlFor="contact-email">
                  Email
                </label>
                <input
                  aria-describedby={
                    fieldErrors.email ? `${emailHintId} ${emailErrorId}` : emailHintId
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  id="contact-email"
                  autoComplete="email"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.email}
                  name="email"
                  onBlur={handleBlur}
                  required
                  type="email"
                />
                <p className={styles.contactFieldHint} id={emailHintId}>
                  We'll only use this to reply.
                </p>
              </ValidatedField>
            </div>

            {selectedInquiryType === "trade-request" ? (
              <ValidatedField>
                <label className={styles.contactLabel} htmlFor="contact-studio-name">
                  Studio or company
                </label>
                <input
                  id="contact-studio-name"
                  className={styles.contactInput}
                  defaultValue={preservedValues?.studioName}
                  name="studioName"
                  type="text"
                />
              </ValidatedField>
            ) : null}

            <ValidatedField error={fieldErrors.message} errorId={messageErrorId}>
              <label className={styles.contactLabel} htmlFor="contact-message">
                How can we help?
              </label>
              <textarea
                aria-describedby={
                  fieldErrors.message ? `${messageHintId} ${messageErrorId}` : messageHintId
                }
                aria-invalid={Boolean(fieldErrors.message)}
                id="contact-message"
                className={styles.contactTextarea}
                name="message"
                defaultValue={preservedValues?.message ?? defaults?.message}
                onBlur={handleBlur}
                placeholder={messagePlaceholders[selectedInquiryType]}
                required
                rows={7}
              />
              <p className={styles.contactFieldHint} id={messageHintId}>
                Mention the rug name, room size, and timeline if you know them. We can send
                extra photos or a video before you decide.
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
                    Sending
                  </>
                ) : (
                  "Send message"
                )}
              </button>
              <p className={styles.contactFieldHint}>
                Personal reply within 24h - Colour confirmed before payment
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
          Write to{" "}
          <a href={`mailto:${contactData.emailLabel}`}>{contactData.emailLabel}</a> and we'll
          reply within 24 hours.
        </p>
        <p className={styles.contactFieldHint}>Hours: {contactData.hoursLabel}</p>
      </div>

      <a
        className={styles.whatsappAction}
        href={contactData.whatsappUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
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
