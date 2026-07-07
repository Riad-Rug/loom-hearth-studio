import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { hasAuthenticatedHeaderSession } from "@/lib/auth/header-session";

export async function SiteHeader() {
  const isAuthenticated = await hasAuthenticatedHeaderSession();

  return (
    <SiteHeaderClient
      announcementItems={siteConfig.announcementItems}
      brandName={siteConfig.name}
      primaryNav={siteConfig.primaryNav}
      isAuthenticated={isAuthenticated}
    />
  );
}
