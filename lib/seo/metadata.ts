import type { Metadata } from "next";

import { normalizePublicUrl, siteConfig } from "@/config/site";
import { getSeoSetting } from "@/lib/seo/settings";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
};

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
  type = "website",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImageUrl,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
}: BuildMetadataOptions): Metadata {
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
        width: ogImageWidth,
        height: ogImageHeight,
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
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedOgImage],
    },
    other: type === "product" ? { "og:type": "product" } : undefined,
  };
}

export async function buildManagedMetadata({
  entityType,
  entityKey,
  title,
  description,
  path,
  noIndex = false,
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
  const brandName = escapeRegExp(siteConfig.name);
  const brandSuffixPattern = new RegExp(`\\s*(?:[|\\-–—:]\\s*)${brandName}\\s*$`, "iu");
  let next = value.trim();

  while (brandSuffixPattern.test(next)) {
    next = next.replace(brandSuffixPattern, "").trim();
  }

  return next || siteConfig.name;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
