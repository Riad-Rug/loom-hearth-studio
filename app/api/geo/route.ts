import { NextResponse } from "next/server";

import { countryRequiresOptIn, normalizeCountryCode } from "@/lib/security/consent-region";

/*
 * Per-visitor region lookup for the cookie consent default. Pages stay cached
 * and region-neutral; the consent provider calls this from the browser instead.
 * The response must never be shared between visitors, so every cache layer
 * (browser, Vercel, Cloudflare) is told not to store it.
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country =
    normalizeCountryCode(request.headers.get("cf-ipcountry")) ??
    normalizeCountryCode(request.headers.get("x-vercel-ip-country"));

  return NextResponse.json(
    {
      country,
      requiresOptIn: countryRequiresOptIn(country),
      gpc: request.headers.get("sec-gpc") === "1",
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Cloudflare-CDN-Cache-Control": "no-store",
      },
    },
  );
}
