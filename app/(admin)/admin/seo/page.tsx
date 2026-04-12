import { AdminSeoPageView } from "@/features/admin/admin-seo-page-view";
import { siteConfig } from "@/config/site";
import { listSeoRouteRegistry } from "@/lib/seo/registry";
import { listSeoSettings } from "@/lib/seo/settings";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const [settings, registry] = await Promise.all([listSeoSettings(), listSeoRouteRegistry()]);

  const records = registry.map((item) => {
    const setting = settings.find(
      (candidate) =>
        candidate.entityType === item.entityType && candidate.entityKey === item.entityKey,
    );

    return {
      id: item.id,
      label: item.label,
      entityType: item.entityType,
      entityKey: item.entityKey,
      path: item.path,
      fallbackTitle: item.fallbackTitle,
      fallbackDescription: item.fallbackDescription,
      fields: {
        title: setting?.title ?? "",
        description: setting?.description ?? "",
        canonicalUrl: setting?.canonicalUrl ?? "",
        robotsIndex: setting?.robotsIndex ?? true,
        ogTitle: setting?.ogTitle ?? "",
        ogDescription: setting?.ogDescription ?? "",
        ogImageUrl: setting?.ogImageUrl ?? "",
      },
    };
  });

  return (
    <AdminSeoPageView
      defaultOgImagePath={siteConfig.ogImagePath}
      records={records}
      robotsUrl={`${siteConfig.siteUrl}/robots.txt`}
      sitemapUrl={`${siteConfig.siteUrl}/sitemap.xml`}
      siteUrl={siteConfig.siteUrl}
    />
  );
}
