import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { getHeaderAuthState } from "@/lib/auth/header-session";
import {
  listUnavailableCategoryHrefs,
  listUnavailableRugStyleHrefs,
} from "@/lib/catalog/service";

export async function SiteHeader() {
  // Category and rug-style routes with nothing purchasable behind them stay in
  // the menu but render inert (see SiteHeaderClient) — live check, so they come
  // back on their own the moment stock lands. Style pages are served noindex
  // while they are empty, so a crawlable anchor to one would be pointing crawl
  // signal at a page we are asking Google to ignore; both sets feed the one
  // unavailableHrefs list so the client keeps a single notion of "inert row".
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
