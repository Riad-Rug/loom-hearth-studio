"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitNewsletterSignupAction } from "@/app/actions/newsletter";
import { useCart } from "@/features/cart/cart-provider";
import { trackNewsletterInterest } from "@/lib/analytics/gtag";
import {
  initialNewsletterSignupActionState,
  type NewsletterSignupActionState,
} from "@/lib/newsletter/actions-shared";

import styles from "./exit-intent-capture.module.css";

const DISMISSED_STORAGE_KEY = "loom-hearth-studio.exit-intent.dismissed-at";
const SUBSCRIBED_STORAGE_KEY = "loom-hearth-studio.exit-intent.subscribed";
const SESSION_STORAGE_KEY = "loom-hearth-studio.exit-intent.shown";
const DISMISS_SUPPRESSION_DAYS = 14;
const MINIMUM_ENGAGEMENT_MS = 9000;

export function ExitIntentCapture() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [canTrigger, setCanTrigger] = useState(false);
  const [actionState, formAction] = useActionState<NewsletterSignupActionState, FormData>(
    submitNewsletterSignupAction,
    initialNewsletterSignupActionState,
  );

  const shouldSkipRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/terms-and-conditions");

  useEffect(() => {
    if (shouldSkipRoute || hasRecentCaptureInteraction()) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCanTrigger(true), MINIMUM_ENGAGEMENT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [shouldSkipRoute]);

  useEffect(() => {
    if (!canTrigger || isOpen || shouldSkipRoute) {
      return;
    }

    const openCapture = () => {
      if (hasRecentCaptureInteraction()) {
        return;
      }

      window.sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) {
        openCapture();
      }
    };

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isReturningTowardTop = lastScrollY - currentScrollY > 80 && currentScrollY < 260;
      lastScrollY = currentScrollY;

      if (isReturningTowardTop && (itemCount > 0 || document.body.scrollHeight > window.innerHeight * 1.8)) {
        openCapture();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [canTrigger, isOpen, itemCount, shouldSkipRoute]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissCapture();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (actionState.status !== "success") {
      return;
    }

    trackNewsletterInterest({ location: "exit-intent" });
    window.localStorage.setItem(SUBSCRIBED_STORAGE_KEY, "true");
    const timeoutId = window.setTimeout(() => setIsOpen(false), 900);

    return () => window.clearTimeout(timeoutId);
  }, [actionState.status]);

  if (!isOpen) {
    return null;
  }

  function dismissCapture() {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, String(Date.now()));
    setIsOpen(false);
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={dismissCapture}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close newsletter guide offer"
          onClick={dismissCapture}
        >
          ×
        </button>
        <div>
          <p className={styles.eyebrow}>{itemCount > 0 ? "Before you leave" : "Free sourcing guide"}</p>
          <h2 id={titleId} className={styles.title}>
            10 things to check before buying a Moroccan rug.
          </h2>
        </div>
        <p className={styles.body}>
          Take the guide with you. It covers wool, construction, repair signs, sizing, and the details that separate a
          durable handwoven piece from a costly mistake.
        </p>
        <form className={styles.form} action={formAction}>
          <input type="hidden" name="source" value="exit-intent" />
          <label className={styles.label} htmlFor="exit-intent-email">
            Email address
          </label>
          <div className={styles.controls}>
            <input
              id="exit-intent-email"
              className={styles.input}
              name="email"
              type="email"
              placeholder="Your email address"
              autoComplete="email"
              required
            />
            <SubmitButton />
          </div>
          {actionState.message ? (
            <p className={styles.status} role="status">
              {actionState.message}
            </p>
          ) : null}
          <p className={styles.disclosure}>
            By joining you agree to our <Link href="/privacy-policy">Privacy Policy</Link>. Unsubscribe any time.
          </p>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send the guide"}
    </button>
  );
}

function hasRecentCaptureInteraction() {
  if (typeof window === "undefined") {
    return true;
  }

  if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === "true") {
    return true;
  }

  if (window.localStorage.getItem(SUBSCRIBED_STORAGE_KEY) === "true") {
    return true;
  }

  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_STORAGE_KEY) ?? 0);

  if (!Number.isFinite(dismissedAt) || dismissedAt <= 0) {
    return false;
  }

  const dismissalAgeMs = Date.now() - dismissedAt;
  return dismissalAgeMs < DISMISS_SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;
}
