"use client";

import { useEffect, useState } from "react";

import { getDefaultCookieConsentState } from "@/lib/security/helpers";
import type { CookieConsentState } from "@/lib/security/types";

const CONSENT_COOKIE_NAME = "loom_hearth_cookie_consent";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type ConsentStatus = "idle" | "ready" | "handled";

function readConsentCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const value = match.slice(CONSENT_COOKIE_NAME.length + 1);

  try {
    return JSON.parse(decodeURIComponent(value)) as CookieConsentState;
  } catch {
    return null;
  }
}

function persistConsent(state: CookieConsentState) {
  const serialized = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE_NAME}=${serialized}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; samesite=lax`;
}

export function CookieConsentBanner() {
  const [status, setStatus] = useState<ConsentStatus>("idle");

  useEffect(() => {
    const existingConsent = readConsentCookie();
    setStatus(existingConsent ? "handled" : "ready");
  }, []);

  if (status !== "ready") {
    return null;
  }

  const handleConsent = (state: CookieConsentState) => {
    persistConsent(state);
    setStatus("handled");
  };

  return (
    <aside className="cookie-banner" role="region" aria-label="Cookie preferences">
      <div className="cookie-banner__eyebrow">Privacy preferences</div>
      <p className="cookie-banner__title">A better browsing experience, on your terms.</p>
      <p className="cookie-banner__copy">
        We use cookies to keep the store secure, remember your preferences, and improve the
        experience. You can accept all cookies or keep it to necessary cookies only.
      </p>
      <div className="cookie-banner__actions">
        <button
          className="cookie-banner__button cookie-banner__button--secondary"
          type="button"
          onClick={() => handleConsent(getDefaultCookieConsentState())}
        >
          Necessary only
        </button>
        <button
          className="cookie-banner__button cookie-banner__button--primary"
          type="button"
          onClick={() =>
            handleConsent({
              necessary: true,
              analytics: true,
              marketing: true,
            })
          }
        >
          Accept all cookies
        </button>
      </div>
    </aside>
  );
}
