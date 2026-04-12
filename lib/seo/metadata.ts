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

  return buildMetadata({
    title: setting?.title || title,
    description: setting?.description || description,
    path,
    noIndex: setting?.robotsIndex === false ? true : noIndex,
    type,
    canonicalUrl: setting?.canonicalUrl || canonicalUrl,
    ogTitle: setting?.ogTitle || ogTitle || setting?.title || title,
    ogDescription:
      setting?.ogDescription || ogDescription || setting?.description || description,
    ogImageUrl: setting?.ogImageUrl || ogImageUrl,
  });
}