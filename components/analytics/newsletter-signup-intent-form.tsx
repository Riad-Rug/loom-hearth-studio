"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitNewsletterSignupAction } from "@/app/actions/newsletter";
import {
  initialNewsletterSignupActionState,
  type NewsletterSignupActionState,
  type NewsletterSignupSource,
} from "@/lib/newsletter/actions-shared";
import { trackNewsletterInterest } from "@/lib/analytics/gtag";

import styles from "@/features/home/home-page.module.css";

type NewsletterSignupIntentFormProps = {
  inputLabel: string;
  inputPlaceholder: string;
  ctaLabel: string;
  source: NewsletterSignupSource;
};

export function NewsletterSignupIntentForm(props: NewsletterSignupIntentFormProps) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [actionState, formAction] = useActionState<NewsletterSignupActionState, FormData>(
    submitNewsletterSignupAction,
    initialNewsletterSignupActionState,
  );

  useEffect(() => {
    if (actionState.status === "success") {
      trackNewsletterInterest({ location: props.source });
      setEmail("");
    }
  }, [actionState.status, props.source]);

  return (
    <form className={styles.newsletterForm} action={formAction}>
      <input type="hidden" name="source" value={props.source} />
      <label className={styles.newsletterLabel} htmlFor={inputId}>
        {props.inputLabel}
      </label>
      <div className={styles.newsletterControls}>
        <input
          id={inputId}
          className={styles.newsletterInput}
          name="email"
          type="email"
          placeholder={props.inputPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoCapitalize="none"
          autoComplete="email"
          spellCheck={false}
          required
        />
        <SubmitButton ctaLabel={props.ctaLabel} />
      </div>
      {actionState.message ? (
        <p
          className={styles.newsletterStatus}
          data-status={actionState.status}
          role={actionState.status === "error" ? "alert" : "status"}
        >
          {actionState.message}
        </p>
      ) : null}
      <p className={styles.newsletterDisclosure}>
        By joining you agree to our{" "}
        <Link className={styles.newsletterPolicyLink} href="/privacy-policy">
          Privacy Policy
        </Link>
        . Unsubscribe any time via the link in our emails.
      </p>
    </form>
  );
}

function SubmitButton({ ctaLabel }: { ctaLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.newsletterButton} type="submit" disabled={pending}>
      {pending ? "Joining…" : ctaLabel}
    </button>
  );
}
