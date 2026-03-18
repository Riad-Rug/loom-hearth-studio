import { siteConfig } from "@/config/site";
import { hasAuthenticatedHeaderSession } from "@/lib/auth/header-session";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const isAuthenticated = await hasAuthenticatedHeaderSession();

  return (
    <SiteHeaderClient
      announcement={siteConfig.announcement}
      brandName={siteConfig.name}
      tagline={siteConfig.tagline}
      primaryNav={siteConfig.primaryNav}
      isAuthenticated={isAuthenticated}
    />
  );
}
