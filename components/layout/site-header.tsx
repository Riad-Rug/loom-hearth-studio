import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { siteConfig } from "@/config/site";
import { hasAuthenticatedHeaderSession } from "@/lib/auth/header-session";
import { getHomepageContent } from "@/lib/homepage/content";

export async function SiteHeader() {
  const isAuthenticated = await hasAuthenticatedHeaderSession();
  const content = await getHomepageContent();
  const tagline =
    content.brand.tagline === "Admin-managed studio tagline"
      ? siteConfig.tagline
      : content.brand.tagline;

  return (
    <SiteHeaderClient
      announcementItems={siteConfig.announcementItems}
      brandName={content.brand.logoText}
      logoImageAlt={content.brand.logoImageAlt}
      logoImageUrl={content.brand.logoImageUrl}
      tagline={tagline}
      primaryNav={siteConfig.primaryNav}
      isAuthenticated={isAuthenticated}
    />
  );
}
