import type { Metadata } from "next";
import type { ReactNode } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/compliance/cookie-consent-banner";
import { CookieConsentProvider } from "@/components/compliance/cookie-consent-provider";
import { AppShell } from "@/components/layout/app-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";
import { CartProvider } from "@/features/cart/cart-provider";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    locale: siteConfig.locale,
    type: "website",
    siteName: siteConfig.name,
    url: siteConfig.siteUrl,
    images: [
      {
        url: siteConfig.ogImagePath,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImagePath],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <CartProvider>
          <CookieConsentProvider>
            <GoogleAnalytics />
            <AppShell
              header={<SiteHeader />}
              footer={<SiteFooter />}
              consentBanner={<CookieConsentBanner />}
            >
              {children}
            </AppShell>
          </CookieConsentProvider>
        </CartProvider>
      </body>
    </html>
  );
}

