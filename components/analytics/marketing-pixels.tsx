"use client";

import Script from "next/script";

import { ConsentGate } from "@/components/compliance/cookie-consent-provider";
import { GOOGLE_ADS_ID, META_PIXEL_ID, PINTEREST_TAG_ID } from "@/lib/analytics/pixels";

export function MarketingPixels() {
  if (!GOOGLE_ADS_ID && !META_PIXEL_ID && !PINTEREST_TAG_ID) {
    return null;
  }

  return (
    <ConsentGate category="marketing">
      <>
        {GOOGLE_ADS_ID ? <GoogleAdsTag conversionId={GOOGLE_ADS_ID} /> : null}
        {META_PIXEL_ID ? <MetaPixel pixelId={META_PIXEL_ID} /> : null}
        {PINTEREST_TAG_ID ? <PinterestTag tagId={PINTEREST_TAG_ID} /> : null}
      </>
    </ConsentGate>
  );
}

function GoogleAdsTag({ conversionId }: { conversionId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${conversionId}`} strategy="afterInteractive" />
      <Script id="loom-hearth-google-ads" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
window.gtag('js', new Date());
window.gtag('config', '${conversionId}');`}
      </Script>
    </>
  );
}

function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script id="loom-hearth-meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
    </Script>
  );
}

function PinterestTag({ tagId }: { tagId: string }) {
  return (
    <Script id="loom-hearth-pinterest-tag" strategy="afterInteractive">
      {`!function(e){if(!window.pintrk){window.pintrk=function(){
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
var n=window.pintrk;n.queue=[],n.version="3.0";
var t=document.createElement("script");t.async=!0,t.src=e;
var r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '${tagId}');
pintrk('page');`}
    </Script>
  );
}
