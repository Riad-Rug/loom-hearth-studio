import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { getHeaderAuthState } from "@/lib/auth/header-session";
import { listUnavailableCategoryHrefs } from "@/lib/catalog/service";

export async function SiteHeader() {
  // Category routes with nothing purchasable behind them stay in the menu but
  // render inert (see SiteHeaderClient) — live check, so they come back on
  // their own the moment stock lands.
  const [{ isAuthenticated, firstName }, unavailableHrefs] = await Promise.all([
    getHeaderAuthState(),
    listUnavailableCategoryHrefs(),
  ]);

  return (
    <SiteHeaderClient
      announcementDesktop={siteConfig.announcementDesktop}
      announcementMobile={siteConfig.announcementMobile}
      brandName={siteConfig.name}
      primaryNav={siteConfig.primaryNav}
      unavailableHrefs={unavailableHrefs}
      isAuthenticated={isAuthenticated}
      accountFirstName={firstName}
    />
  );
}
