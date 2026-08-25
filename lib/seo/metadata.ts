import type { Metadata } from "next";

import { normalizePublicUrl, siteConfig } from "@/config/site";
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
  ogImageWidth = defaultOgImageWidth,
  ogImageHeight = defaultOgImageHeight,
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

/**
 * Words an admin may append to the brand name when hand-typing a `seoTitle`.
 * The legal/marketing name of the business is "Loom & Hearth Studio" (see the
 * domain) while `siteConfig.name` — and therefore the root title template — is
 * the shorter "Loom & Hearth", so both spellings show up in admin-entered
 * titles and both have to be recognised as a brand suffix.
 */
const brandSuffixQualifiers = ["studio"];

/**
 * Matches a trailing `<separator> <brand>` suffix, tolerating the ways a human
 * actually types the brand: any casing, loose spacing, "and" for "&", and an
 * optional trailing qualifier such as "Studio".
 *
 * Deliberately anchored with `$` so a product name that merely CONTAINS the
 * brand mid-string is never truncated.
 */
function buildBrandSuffixPattern() {
  const brandCore = escapeRegExp(siteConfig.name)
    .replace(/\s+/gu, "\\s+")
    .replace(/&/gu, "(?:&|and)");
  const qualifier = `(?:\\s+(?:${brandSuffixQualifiers.join("|")}))?`;

  return new RegExp(`\\s*(?:[|\\-–—:]\\s*)${brandCore}${qualifier}\\s*$`, "iu");
}

function normalizeTemplatedTitle(value: string) {
  const brandSuffixPattern = buildBrandSuffixPattern();
  let next = value.trim();

  while (brandSuffixPattern.test(next)) {
    next = next.replace(brandSuffixPattern, "").trim();
  }

  return next || siteConfig.name;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
