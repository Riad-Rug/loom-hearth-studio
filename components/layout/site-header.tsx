import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { getHeaderAuthState } from "@/lib/auth/header-session";
import {
  listUnavailableCategoryHrefs,
  listUnavailableRugStyleHrefs,
} from "@/lib/catalog/service";

export async function SiteHeader() {
  // Category and rug-style routes with nothing to buy stay in the menu but
  // render inert (see SiteHeaderClient), and come back on their own the moment
  // stock lands. Both sets feed the one unavailableHrefs list so the client
  // keeps a single notion of "inert row".
  const [{ isAuthenticated, firstName }, unavailableCategoryHrefs, unavailableRugStyleHrefs] =
    await Promise.all([
      getHeaderAuthState(),
      listUnavailableCategoryHrefs(),
      listUnavailableRugStyleHrefs(),
    ]);

  const unavailableHrefs = [...unavailableCategoryHrefs, ...unavailableRugStyleHrefs];

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
