import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { allRugsNavLink } from "@/features/catalog/rug-style-collections";
import { getHeaderAuthState } from "@/lib/auth/header-session";
import { listRugFacetLinks, listUnavailableCategoryHrefs } from "@/lib/catalog/service";

export async function SiteHeader() {
  // Categories with nothing to buy stay in the menu but render inert (see
  // SiteHeaderClient). Rug Type and Region pages with nothing to buy are left
  // out of the Rugs submenu instead, and return on their own when stock lands.
  const [{ isAuthenticated, firstName }, unavailableHrefs, rugFacetLinks] = await Promise.all([
    getHeaderAuthState(),
    listUnavailableCategoryHrefs(),
    listRugFacetLinks(),
  ]);
  const typeLinks = rugFacetLinks.filter((link) => link.kind === "type");
  const regionLinks = rugFacetLinks.filter((link) => link.kind === "region");
  const rugSubmenu = [
    allRugsNavLink,
    ...(typeLinks.length ? [{ heading: "By type" }, ...typeLinks] : []),
    ...(regionLinks.length ? [{ heading: "By region" }, ...regionLinks] : []),
  ];
  const primaryNav = siteConfig.primaryNav.map((item) =>
    "items" in item
      ? {
          ...item,
          items: item.items.map((subItem) =>
            subItem.href === "/shop/rugs" ? { ...subItem, items: rugSubmenu } : subItem,
          ),
        }
      : item,
  );

  return (
    <SiteHeaderClient
      announcementDesktop={siteConfig.announcementDesktop}
      announcementMobile={siteConfig.announcementMobile}
      brandName={siteConfig.name}
      primaryNav={primaryNav}
      unavailableHrefs={unavailableHrefs}
      isAuthenticated={isAuthenticated}
      accountFirstName={firstName}
    />
  );
}
