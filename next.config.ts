import type { NextConfig } from "next";

import { allowedImageHostnames } from "./lib/media/allowed-image-hosts";

const imageHostOrigins = allowedImageHostnames.map((hostname) => `https://${hostname}`);

/**
 * Content-Security-Policy, ENFORCING.
 *
 * This policy was shipped report-only first and observed against real traffic
 * across the storefront, the checkout/Stripe PaymentElement flow and the admin
 * before being allowed to block. The single blocker to enforcement was Google
 * Ads: its remarketing tag fires a /pagead/1p-user-list pixel against the
 * VISITOR'S LOCAL Google ccTLD (www.google.co.ma, www.google.de, ...), a host
 * set that CSP cannot express because it has no TLD wildcard. The site owner
 * has since removed Google Ads from the site entirely (no campaigns planned),
 * which removes that blocker along with the ad-serving origins it needed.
 *
 * `'unsafe-inline'` in script-src is a pragmatic first pass: the analytics tags
 * in components/analytics/* are inline `next/script` blocks with no nonce
 * wiring. Moving to a nonce-based policy is a follow-up hardening step.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // googletagmanager: GA4 gtag.js. clarity.ms: Microsoft Clarity tag.
  // connect.facebook.net: Meta Pixel. s.pinimg.com: Pinterest tag. js.stripe.com:
  // Stripe.js, required for the embedded PaymentElement.
  // googleads.g.doubleclick.net + googleadservices.com were previously listed
  // here for the Google Ads viewthroughconversion script; both were removed with
  // the Google Ads tag itself.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://connect.facebook.net https://s.pinimg.com https://js.stripe.com",
  // 'unsafe-inline' is genuinely required, verified empirically against a
  // PRODUCTION build: removing it produced 89 violations across the homepage,
  // a product page and the checkout payment step — both style-src-attr (inline
  // style="" attributes in the app's own markup) and style-src-elem (a Next
  // chunk injecting a <style> element at runtime). With it, zero.
  "style-src 'self' 'unsafe-inline'",
  // Vendor tags fall back to 1x1 image beacons when sendBeacon/fetch is
  // unavailable, so the pixel hosts belong in img-src as well as connect-src.
  // The Google Ads ad-serving hosts (googleads.g.doubleclick.net,
  // www.googleadservices.com) were removed with the Google Ads tag, and with
  // them the unsolvable local-ccTLD /pagead/1p-user-list pixel.
  // www.google.com is KEPT: it is not an ad-serving host, and GA4's own
  // consent-mode/conversion-measurement beacon (/ccm/collect) targets it
  // independently of Google Ads whenever Google Signals is on for the property.
  `img-src 'self' data: blob: ${imageHostOrigins.join(" ")} https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.facebook.com https://ct.pinterest.com https://s.pinimg.com https://c.clarity.ms`,
  "font-src 'self' data:",
  // Of the three gtag.js beacons observed under report-only, /g/collect is GA4
  // (google-analytics.com) and /ccm/collect is GA4 consent-mode measurement
  // (www.google.com) — both kept. /rmkt/collect is Google Ads remarketing, so
  // ad.doubleclick.net, googleads.g.doubleclick.net and www.googleadservices.com
  // were removed along with the Ads tag.
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.clarity.ms https://c.clarity.ms https://connect.facebook.net https://www.facebook.com https://ct.pinterest.com https://s.pinimg.com https://api.stripe.com https://m.stripe.com https://m.stripe.network https://js.stripe.com https://www.google.com",
  // js.stripe.com hosts the PaymentElement iframes; hooks.stripe.com hosts 3DS
  // challenge frames. 'self' covers the same-origin admin /blog-preview iframe.
  // ct.pinterest.com was added after observing the Pinterest tag inject its own
  // tracking iframe.
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://ct.pinterest.com",
  // Modern equivalent of X-Frame-Options: SAMEORIGIN, which is set alongside it
  // below for browsers that do not support frame-ancestors.
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Features the app provably does not use — verified by grep across the repo for
 * the corresponding Web APIs, all of which returned zero hits.
 *
 * `payment` is deliberately NOT restricted: Stripe's PaymentElement keeps Apple
 * Pay and Google Pay on `auto` (see features/checkout/steps/payment-step.tsx),
 * and both rely on the Payment Request API inside Stripe's iframes.
 */
const permissionsPolicy = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "usb=()",
  "serial=()",
  // NOTE: `bluetooth=()` is deliberately NOT listed. Chrome does not recognize
  // it as a Permissions-Policy feature and logs
  // "Error with Permissions-Policy header: Unrecognized feature: 'bluetooth'"
  // on every single page load. Verified in-browser during rollout.
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "midi=()",
  "xr-spatial-tracking=()",
].join(", ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHostnames.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  typedRoutes: true,
  async headers() {
    return [
      {
        /**
         * bfcache rescue for `/`.
         *
         * The homepage is deliberately dynamic: listRandomInventoryProductCards()
         * calls unstable_noStore() so the "In stock right now" shuffle is
         * recomputed per request instead of frozen at build time. That is staying
         * exactly as-is. The side effect is that Next's default header for a
         * dynamic route is `private, no-cache, no-store, max-age=0,
         * must-revalidate`, and the `no-store` token alone makes Chrome refuse to
         * put the page in the back/forward cache.
         *
         * `no-store` is not what keeps the route dynamic — Next's Full Route Cache
         * is a server-side concern decided by noStore(), not by this response
         * header. Dropping only `no-store` (keeping `no-cache` +
         * `must-revalidate`) still forces the browser to revalidate with the
         * server on every real navigation, so the shuffle stays fresh, while
         * restoring bfcache eligibility for back/forward navigation, which never
         * touches the network at all.
         */
        source: "/",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // SAMEORIGIN, not DENY: features/admin/admin-blog-preview-frame.tsx
          // renders a same-origin <iframe src="/blog-preview"> for the admin
          // post editor, which DENY would break.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/checkout/information", destination: "/checkout", permanent: false },
      { source: "/checkout/success", destination: "/checkout/confirmation", permanent: false },
      { source: "/search", destination: "/shop", permanent: true },
      {
        source: "/trade/apply",
        destination: "/contact?inquiryType=trade-request",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
