import { siteConfig } from "@/config/site";
import { getCurrentAuthenticatedUser } from "@/lib/auth/service";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const authenticatedUser = await getCurrentAuthenticatedUser();

  return (
    <SiteHeaderClient
      announcement={siteConfig.announcement}
      brandName={siteConfig.name}
      tagline={siteConfig.tagline}
      primaryNav={siteConfig.primaryNav}
      isAuthenticated={Boolean(authenticatedUser)}
    />
  );
}
