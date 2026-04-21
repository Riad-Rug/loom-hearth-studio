"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { ConsentGate } from "@/components/compliance/cookie-consent-provider";
import { trackPageView } from "@/lib/analytics/gtag";

type GoogleAnalyticsProps = {
  measurementId: string;
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) {
    return null;
  }

  return (
    <ConsentGate category="analytics">
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="loom-hearth-ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
window.loomHearthGaMeasurementId = '${measurementId}';
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false });`}
        </Script>
        <PageViewTracker measurementId={measurementId} />
      </>
    </ConsentGate>
  );
}

function PageViewTracker({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    trackPageView({ measurementId, path, title: document.title });
  }, [measurementId, pathname, searchParams]);

  return null;
}
