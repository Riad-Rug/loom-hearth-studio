"use client";

import Script from "next/script";

import { ConsentGate } from "@/components/compliance/cookie-consent-provider";

type MicrosoftClarityProps = {
  projectId: string;
};

export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  if (!projectId) {
    return null;
  }

  return (
    <ConsentGate category="analytics">
      <Script id="loom-hearth-microsoft-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");`}
      </Script>
    </ConsentGate>
  );
}
