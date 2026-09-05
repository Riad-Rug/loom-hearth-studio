"use client";

import { useCookieConsent } from "@/components/compliance/cookie-consent-provider";

/*
 * A slim strip pinned to the bottom edge of the viewport, not a floating card.
 * As a card it landed on top of the hero CTA on the mobile homepage and on the
 * "Reserve this piece" button on the desktop product page; every piece here is
 * a one-off with quantity fixed at 1, so a covered buy button costs the sale.
 *
 * The consent mechanism itself is untouched: the provider still owns the
 * cookie, and Decline and Accept remain equally prominent — deliberately the
 * same button treatment, since nudging towards Accept would be a consent
 * defect rather than a design choice.
 */
export function CookieConsentBanner() {
  const { consent, hasResolved, acceptAll, declineAll } = useCookieConsent();

  if (!hasResolved || consent) {
    return null;
  }

  return (
    <aside className="cookie-banner" role="region" aria-label="Cookie preferences">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p className="cookie-banner__title">Choose whether to allow optional tracking.</p>
          <div className="cookie-banner__detail">
            <p className="cookie-banner__copy">
              <span className="cookie-banner__copy-full">
                Strictly necessary cookies always stay on. Analytics and marketing cookies stay off
                unless you accept them.
              </span>
              <span className="cookie-banner__copy-short">
                Necessary cookies always stay on. Optional ones stay off unless you accept.
              </span>
            </p>
            <ul className="cookie-banner__list" aria-label="Cookie categories">
              <li>Strictly necessary</li>
              <li>Analytics</li>
              <li>Marketing</li>
            </ul>
          </div>
        </div>
        <div className="cookie-banner__actions">
          <button className="cookie-banner__button" type="button" onClick={declineAll}>
            Decline
          </button>
          <button className="cookie-banner__button" type="button" onClick={acceptAll}>
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
}
