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
  const { consent, mode, hasResolved, acceptAll, declineAll, keepDefaults } = useCookieConsent();

  if (!hasResolved || consent) {
    return null;
  }

  /*
   * Opt-out regions (outside the EU/EEA, UK and CH): analytics is already on,
   * so this is a notice rather than a question. "Opt out" and "OK" get the same
   * treatment, and marketing tags still need an explicit yes via the inline
   * link.
   */
  if (mode === "opt-out") {
    return (
      <aside className="cookie-banner" role="region" aria-label="Cookie notice">
        <div className="cookie-banner__inner">
          <div className="cookie-banner__text">
            <p className="cookie-banner__title">We use analytics cookies to improve this site.</p>
            <p className="cookie-banner__copy">
              <span className="cookie-banner__copy-full">
                Google Analytics and Microsoft Clarity help us see how the site is used. You can opt
                out at any time. Marketing cookies stay off unless you{" "}
              </span>
              <span className="cookie-banner__copy-short">
                Analytics helps us improve the site. Marketing cookies stay off unless you{" "}
              </span>
              <button className="cookie-banner__inline-button" type="button" onClick={acceptAll}>
                allow them
              </button>
              .
            </p>
          </div>
          <div className="cookie-banner__actions">
            <button className="cookie-banner__button" type="button" onClick={declineAll}>
              Opt out
            </button>
            <button className="cookie-banner__button" type="button" onClick={keepDefaults}>
              OK
            </button>
          </div>
        </div>
      </aside>
    );
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
