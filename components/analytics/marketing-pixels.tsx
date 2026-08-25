"use client";

import Script from "next/script";

import { ConsentGate } from "@/components/compliance/cookie-consent-provider";

type MarketingPixelsProps = {
  metaPixelId: string;
  pinterestTagId: string;
};

export function MarketingPixels({
  metaPixelId,
  pinterestTagId,
}: MarketingPixelsProps) {
  if (!metaPixelId && !pinterestTagId) {
    return null;
  }

  return (
    <ConsentGate category="marketing">
      <>
        {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
        {pinterestTagId ? <PinterestTag tagId={pinterestTagId} /> : null}
      </>
    </ConsentGate>
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
