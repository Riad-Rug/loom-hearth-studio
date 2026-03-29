"use client";

import { useCookieConsent } from "@/components/compliance/cookie-consent-provider";

export function CookieConsentBanner() {
  const { consent, hasResolved, acceptAll, declineAll } = useCookieConsent();

  if (!hasResolved || consent) {
    return null;
  }

  return (
    <aside className="cookie-banner" role="region" aria-label="Cookie preferences">
      <div className="cookie-banner__eyebrow">Privacy preferences</div>
      <p className="cookie-banner__title">Choose whether to allow optional tracking.</p>
      <p className="cookie-banner__copy">
        Strictly necessary cookies always stay on. Analytics and marketing cookies stay off unless
        you accept them.
      </p>
      <ul className="cookie-banner__list" aria-label="Cookie categories">
        <li>Strictly necessary</li>
        <li>Analytics</li>
        <li>Marketing</li>
      </ul>
      <div className="cookie-banner__actions">
        <button className="cookie-banner__button" type="button" onClick={declineAll}>
          Decline
        </button>
        <button className="cookie-banner__button" type="button" onClick={acceptAll}>
          Accept
        </button>
      </div>
    </aside>
  );
}
