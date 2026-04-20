import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { getSeoSetting } from "@/lib/seo/settings";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: "website" | "article";
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
};

type BuildManagedMetadataOptions = BuildMetadataOptions & {
  entityType: string;
  entityKey: string;
};

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
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
}: BuildMetadataOptions): Metadata {
  const canonical = canonicalUrl || absoluteUrl(path);
  const defaultOgImage = absoluteUrl(siteConfig.ogImagePath);
  const resolvedOgImage = ogImageUrl || defaultOgImage;
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;

  return {
    title,
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
    openGraph: {
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: resolvedOgImage,
          alt: siteConfig.name,
        },
      ],
    },
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
  type = "website",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImageUrl,
}: BuildManagedMetadataOptions): Promise<Metadata> {
  const setting = await getSeoSetting({ entityType, entityKey });
  const managedTitle = cleanManagedString(setting?.title);
  const managedDescription = cleanManagedString(setting?.description);
  const managedCanonicalUrl = cleanManagedString(setting?.canonicalUrl);
  const managedOgTitle = cleanManagedString(setting?.ogTitle);
  const managedOgDescription = cleanManagedString(setting?.ogDescription);
  const managedOgImageUrl = cleanManagedString(setting?.ogImageUrl);

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
    ogImageUrl: managedOgImageUrl || ogImageUrl,
  });
}

function cleanManagedString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
