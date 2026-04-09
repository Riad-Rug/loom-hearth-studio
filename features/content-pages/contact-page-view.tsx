"use client";

import { useId, useState } from "react";

import {
  getSupportedInquiryCountry,
  supportedInquiryCountries,
} from "@/config/inquiry-countries";
import { contactData } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

type ContactPageViewProps = {
  defaults?: {
    inquiryType?: string;
    message?: string;
    productName?: string;
  };
  submitAction: (formData: FormData) => Promise<void>;
  submissionState?: {
    tone: "success" | "error";
    message: string;
    requestNumber?: string;
  };
};

export function ContactPageView({
  defaults,
  submitAction,
  submissionState,
}: ContactPageViewProps) {
  const countrySelectId = useId();
  const cityInputId = useId();
  const regionInputId = useId();
  const postalCodeInputId = useId();
  const address1InputId = useId();
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const selectedCountry = getSupportedInquiryCountry(selectedCountryCode);
  const regionLabel = selectedCountry?.regionLabel ?? "State, province, or region";
  const postalCodeLabel = selectedCountry?.postalCodeLabel ?? "Postal code";
  const regionRequired = selectedCountry?.requiresRegion ?? false;
  const postalCodeRequired = selectedCountry?.requiresPostalCode ?? false;
  const shippingAvailabilityNote = selectedCountry?.shippingAvailabilityNote;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>{contactData.eyebrow}</p>
          <h1>{contactData.title}</h1>
          {contactData.body.split("\n\n").map((paragraph) => (
            <p key={paragraph} className={styles.lede}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.contactGrid}>
        <div className={`${styles.card} ${styles.contactPanel}`}>
          <div className={styles.cardBody}>
            <h2>{contactData.formTitle}</h2>
            <p className={styles.body}>{contactData.formBody}</p>
            {defaults?.productName ? (
              <p className={styles.body}>
                Inquiry prepared for <strong>{defaults.productName}</strong>.
              </p>
            ) : null}
          </div>

          <form action={submitAction} className={styles.contactForm}>
            {submissionState ? (
              <div
                className={`${styles.contactFormNote} ${
                  submissionState.tone === "success"
                    ? styles.contactFormSuccess
                    : styles.contactFormError
                }`}
                role="status"
              >
                <p className={styles.contactFormNoteTitle}>
                  {submissionState.tone === "success"
                    ? "Inquiry received"
                    : "We could not send your inquiry"}
                </p>
                <p className={styles.contactFormNoteMessage}>{submissionState.message}</p>
                {submissionState.requestNumber ? (
                  <div className={styles.contactRequestNumberBlock}>
                    <span className={styles.contactRequestNumberLabel}>Request number</span>
                    <strong className={styles.contactRequestNumberValue}>
                      {submissionState.requestNumber}
                    </strong>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                autoComplete="name"
                className={styles.contactInput}
                name="name"
                placeholder="Your name"
                required
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                autoComplete="email"
                className={styles.contactInput}
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-inquiry-type">
                Inquiry type
              </label>
              <select
                id="contact-inquiry-type"
                className={styles.contactInput}
                defaultValue={defaults?.inquiryType ?? ""}
                name="inquiryType"
                required
              >
                <option value="" disabled>
                  Select an inquiry type
                </option>
                <option value="product-inquiry">Product inquiry</option>
                <option value="custom-request">Custom request</option>
                <option value="order-question">Order question</option>
              </select>
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor={countrySelectId}>
                Destination country
              </label>
              <select
                id={countrySelectId}
                className={styles.contactInput}
                name="country"
                required
                value={selectedCountryCode}
                onChange={(event) => setSelectedCountryCode(event.target.value)}
              >
                <option value="" disabled>
                  Select destination country
                </option>
                {supportedInquiryCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
              {shippingAvailabilityNote ? (
                <p className={styles.contactFieldHint}>{shippingAvailabilityNote}</p>
              ) : null}
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor={cityInputId}>
                City
              </label>
              <input
                id={cityInputId}
                autoComplete="address-level2"
                className={styles.contactInput}
                name="city"
                placeholder="City"
                required
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor={regionInputId}>
                {regionLabel}
              </label>
              <input
                id={regionInputId}
                autoComplete="address-level1"
                className={styles.contactInput}
                name="region"
                placeholder={regionLabel}
                required={regionRequired}
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor={postalCodeInputId}>
                {postalCodeLabel}
              </label>
              <input
                id={postalCodeInputId}
                autoComplete="postal-code"
                className={styles.contactInput}
                name="postalCode"
                placeholder={postalCodeLabel}
                required={postalCodeRequired}
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor={address1InputId}>
                Address line 1 (optional)
              </label>
              <input
                id={address1InputId}
                autoComplete="address-line1"
                className={styles.contactInput}
                name="address1"
                placeholder="Street address"
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                className={styles.contactTextarea}
                name="message"
                defaultValue={defaults?.message}
                placeholder={"Your message ? product name, room dimensions, or any question about the collection."}
                required
                rows={7}
              />
            </div>

            <div className={styles.contactFormFooter}>
              <button className={styles.primaryAction} type="submit">
                {contactData.ctaLabel}
              </button>
            </div>
          </form>
        </div>

        <div className={`${styles.card} ${styles.contactMeta}`} id="contact-details">
          <div className={styles.cardBody}>
            <h2>{contactData.supportTitle}</h2>
            <p className={styles.body}>{contactData.supportBody}</p>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Legal business name</span>
            <p>{contactData.legalNameLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Public address</span>
            <p>{contactData.addressLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Email</span>
            <p>{contactData.emailLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Complaints</span>
            <p>{contactData.complaintsLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Business hours</span>
            <p>{contactData.hoursLabel}</p>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{contactData.reassuranceLabel}</span>
            <p>{contactData.reassuranceText}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{contactData.responseTimeLabel}</span>
            <p>{contactData.responseTimeText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
