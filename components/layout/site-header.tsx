import { siteConfig } from "@/config/site";
import { hasAuthenticatedHeaderSession } from "@/lib/auth/header-session";
import { getHomepageContent } from "@/lib/homepage/content";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const isAuthenticated = await hasAuthenticatedHeaderSession();
  const content = await getHomepageContent();

  return (
    <SiteHeaderClient
      announcement={siteConfig.announcement}
      brandName={content.brand.logoText}
      logoImageAlt={content.brand.logoImageAlt}
      logoImageUrl={content.brand.logoImageUrl}
      tagline={content.brand.tagline}
      primaryNav={siteConfig.primaryNav}
      isAuthenticated={isAuthenticated}
    />
  );
}
