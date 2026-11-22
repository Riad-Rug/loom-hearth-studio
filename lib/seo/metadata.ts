import type { Metadata } from "next";

import { normalizePublicUrl, siteConfig } from "@/config/site";
import { stripBrandSuffix } from "@/lib/seo/brand-suffix";
import { getSeoSetting } from "@/lib/seo/settings";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  /**
   * Blocks indexing while still letting crawlers follow links from this page.
   * Use for pages like internal search results that shouldn't rank themselves
   * but that link to pages (e.g. products) which still need to be discovered.
   * Takes precedence over `noIndex` when both are set.
   */
  noIndexFollow?: boolean;
  /**
   * "product" suppresses Next's own og:type, which cannot express it. The page
   * renders ProductOpenGraphMeta (components/seo) for og:type and the product
   * price tags, because Next's `metadata.other` emits `name=` attributes and
   * Open Graph tags have to be `property=`.
   */
  type?: "website" | "article" | "product";
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
};

/**
 * Intrinsic size of `siteConfig.ogImagePath`, used whenever a caller doesn't
 * pass its own image dimensions. Social scrapers need width/height to reserve
 * layout before the image loads; omitting them degrades the link preview.
 */
const defaultOgImageWidth = 1200;
const defaultOgImageHeight = 630;

type BuildManagedMetadataOptions = BuildMetadataOptions & {
  entityType: string;
  entityKey: string;
};

export function absoluteUrl(path: string) {
  return normalizePublicUrl(path);
}

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  noIndexFollow = false,
  type = "website",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImageUrl,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
}: BuildMetadataOptions): Metadata {
  const shouldIndex = !noIndex && !noIndexFollow;
  const shouldFollow = noIndexFollow || !noIndex;
  const canonical = normalizePublicUrl(canonicalUrl || absoluteUrl(path));
  const defaultOgImage = absoluteUrl(siteConfig.ogImagePath);
  const resolvedOgImage = normalizePublicUrl(ogImageUrl || defaultOgImage);
  const resolvedTitle = normalizeTemplatedTitle(title);
  const resolvedOgTitle = normalizeTemplatedTitle(ogTitle || title);
  const resolvedOgDescription = ogDescription || description;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title: resolvedOgTitle,
    description: resolvedOgDescription,
    url: canonical,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    ...(type === "product" ? {} : { type }),
    images: [
      {
        url: resolvedOgImage,
        alt: ogImageAlt || siteConfig.name,
        // The default image's size is known. A caller's own image with no size
        // given gets none, since a wrong size is worse for scrapers than none.
        ...(ogImageUrl
          ? { width: ogImageWidth, height: ogImageHeight }
          : {
              width: ogImageWidth ?? defaultOgImageWidth,
              height: ogImageHeight ?? defaultOgImageHeight,
            }),
      },
    ],
  };

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
      },
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedOgImage],
    },
  };
}

export async function buildManagedMetadata({
  entityType,
  entityKey,
  title,
  description,
  path,
  noIndex = false,
  noIndexFollow = false,
  type = "website",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImageUrl,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
}: BuildManagedMetadataOptions): Promise<Metadata> {
  const setting = await getSeoSetting({ entityType, entityKey });
  const managedTitle = cleanManagedString(setting?.title);
  const managedDescription = cleanManagedString(setting?.description);
  const managedCanonicalUrl = cleanManagedString(setting?.canonicalUrl);
  const managedOgTitle = cleanManagedString(setting?.ogTitle);
  const managedOgDescription = cleanManagedString(setting?.ogDescription);
  const managedOgImageUrl = cleanManagedString(setting?.ogImageUrl);
  const resolvedManagedOgImageUrl = isDefaultOgImage(managedOgImageUrl)
    ? ""
    : managedOgImageUrl;

  return buildMetadata({
    title: managedTitle || title,
    description: managedDescription || description,
    path,
    noIndex: setting?.robotsIndex === false ? true : noIndex,
    noIndexFollow,
    type,
    canonicalUrl: managedCanonicalUrl || canonicalUrl,
    ogTitle: managedOgTitle || ogTitle || managedTitle || title,
    ogDescription:
      managedOgDescription || ogDescription || managedDescription || description,
    ogImageUrl: resolvedManagedOgImageUrl || ogImageUrl,
    ogImageAlt,
    ogImageWidth,
    ogImageHeight,
  });
}

function cleanManagedString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function isDefaultOgImage(value: string) {
  if (!value) {
    return false;
  }

  return normalizePublicUrl(value) === absoluteUrl(siteConfig.ogImagePath);
}

function normalizeTemplatedTitle(value: string) {
  return stripBrandSuffix(value) || siteConfig.name;
}
