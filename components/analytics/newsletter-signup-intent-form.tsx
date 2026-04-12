"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitNewsletterSignupAction } from "@/app/actions/newsletter";
import {
  initialNewsletterSignupActionState,
  type NewsletterSignupActionState,
} from "@/lib/newsletter/actions-shared";
import { trackNewsletterInterest } from "@/lib/analytics/gtag";

import styles from "@/features/home/home-page.module.css";

type NewsletterSignupIntentFormProps = {
  inputLabel: string;
  inputPlaceholder: string;
  ctaLabel: string;
};

export function NewsletterSignupIntentForm(props: NewsletterSignupIntentFormProps) {
  const [email, setEmail] = useState("");
  const [actionState, formAction] = useActionState<NewsletterSignupActionState, FormData>(
    submitNewsletterSignupAction,
    initialNewsletterSignupActionState,
  );

  useEffect(() => {
    if (actionState.status === "success") {
      trackNewsletterInterest({ location: "homepage" });
      setEmail("");
    }
  }, [actionState.status]);

  return (
    <form className={styles.newsletterForm} action={formAction}>
      <label className={styles.newsletterLabel} htmlFor="newsletter-email">
        {props.inputLabel}
      </label>
      <div className={styles.newsletterControls}>
        <input
          id="newsletter-email"
          className={styles.newsletterInput}
          name="email"
          type="email"
          placeholder={props.inputPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <SubmitButton ctaLabel={props.ctaLabel} />
      </div>
      {actionState.message ? (
        <p className={styles.sectionBody} role="status">
          {actionState.message}
        </p>
      ) : null}
      <div className={styles.newsletterDisclosure}>
        <p>New arrivals, lookbook updates, and early access to new pieces.</p>
        <p>
          By joining you agree to our {" "}
          <Link className={styles.newsletterPolicyLink} href="/privacy-policy">
            Privacy Policy
          </Link>
          .
        </p>
        <p>Unsubscribe any time via the link in our emails.</p>
      </div>
    </form>
  );
}

function SubmitButton({ ctaLabel }: { ctaLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.newsletterButton} type="submit" disabled={pending}>
      {pending ? "Joining..." : ctaLabel}
    </button>
  );
}
