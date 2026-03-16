"use client";

import { useState } from "react";

export function CookieConsentBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent banner">
      <p className="cookie-banner__copy">
        Cookie consent banner placeholder. Real consent persistence and category management
        are not implemented yet.
      </p>
      <div className="cookie-banner__actions">
        <button className="cookie-banner__button" type="button" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
