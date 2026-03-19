import type { HomePageContent, HomePageImage, HomePageSectionKey } from "@/features/home/home-page-data";
import {
  isImageAltReady,
  isMetaDescriptionReady,
  isSeoTitleAlignedWithHeading,
  isSeoTitleReady,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  SEO_TITLE_MIN_LENGTH,
} from "@/lib/seo/content-audit";

export type UploadStatus = {
  status: "idle" | "uploading" | "success" | "error";
  message: string | null;
};

export type SeoAudit = {
  score: number;
  items: { id: string; label: string; detail: string; passed: boolean }[];
};

export function assignValueAtPath(target: HomePageContent, path: string, value: unknown) {
  const segments = path.split(".");
  let current: Record<string, unknown> | Array<unknown> = target as unknown as Record<string, unknown>;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const nextIsArrayIndex = /^\d+$/.test(segments[index + 1] ?? "");

    if (Array.isArray(current)) {
      const arrayIndex = Number(segment);

      if (isLast) {
        current[arrayIndex] = value;
        return;
      }

      const existing = current[arrayIndex];
      if (!existing || typeof existing !== "object") {
        current[arrayIndex] = nextIsArrayIndex ? [] : {};
      }
      current = current[arrayIndex] as Record<string, unknown> | Array<unknown>;
      return;
    }

    if (isLast) {
      current[segment] = value;
      return;
    }

    const existing = current[segment];

    if (!existing || typeof existing !== "object") {
      current[segment] = nextIsArrayIndex ? [] : {};
    }

    current = current[segment] as Record<string, unknown> | Array<unknown>;
  });
}

export function readImageAtPath(content: HomePageContent, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) {
      return current[Number(segment)];
    }

    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, content) as HomePageImage;
}

export function createSectionScoreMap(content: HomePageContent): Record<HomePageSectionKey, SeoAudit> {
  return {
    hero: createSeoAudit(content.hero.title, content.hero.seo.seoTitle, content.hero.seo.metaDescription, content.hero.image.alt),
    badges: createSeoAudit(content.badges.items.filter((item) => item.visible).map((item) => item.label).join(" "), content.badges.seo.seoTitle, content.badges.seo.metaDescription),
    categories: createSeoAudit(content.categories.title, content.categories.seo.seoTitle, content.categories.seo.metaDescription, content.categories.cards.find((card) => card.visible)?.image.alt),
    brandStory: createSeoAudit(content.brandStory.title, content.brandStory.seo.seoTitle, content.brandStory.seo.metaDescription),
    designDirection: createSeoAudit(content.designDirection.title, content.designDirection.seo.seoTitle, content.designDirection.seo.metaDescription),
    featured: createSeoAudit(content.featured.title, content.featured.seo.seoTitle, content.featured.seo.metaDescription, content.featured.cards.find((card) => card.visible)?.image.alt),
    guide: createSeoAudit(content.guide.title, content.guide.seo.seoTitle, content.guide.seo.metaDescription),
    newsletter: createSeoAudit(content.newsletter.title, content.newsletter.seo.seoTitle, content.newsletter.seo.metaDescription),
    footer: createSeoAudit(content.footer.introTitle, content.footer.seo.seoTitle, content.footer.seo.metaDescription),
  };
}

export function createSeoAudit(title: string, seoTitle: string, metaDescription: string, imageAlt?: string): SeoAudit {
  const seoTitlePassed = isSeoTitleReady(seoTitle);
  const metaPassed = isMetaDescriptionReady(metaDescription);
  const alignmentPassed = isSeoTitleAlignedWithHeading(title, seoTitle);
  const imageAltPassed = imageAlt ? isImageAltReady(imageAlt) : true;

  const items = [
    {
      id: "seo-title",
      label: "SEO title readiness",
      detail: seoTitlePassed
        ? `SEO title length is ${seoTitle.trim().length} characters.`
        : `SEO title length is ${seoTitle.trim().length} characters; target ${SEO_TITLE_MIN_LENGTH} to ${SEO_TITLE_MAX_LENGTH}.`,
      passed: seoTitlePassed,
      points: 15,
    },
    {
      id: "meta-description",
      label: "Meta description readiness",
      detail: metaPassed
        ? `Meta description length is ${metaDescription.trim().length} characters.`
        : `Meta description length is ${metaDescription.trim().length} characters; target ${META_DESCRIPTION_MIN_LENGTH} to ${META_DESCRIPTION_MAX_LENGTH}.`,
      passed: metaPassed,
      points: 15,
    },
    {
      id: "alignment",
      label: "Heading and SEO title alignment",
      detail: alignmentPassed
        ? "The SEO title still reflects the visible heading."
        : "The SEO title drifts away from the visible heading.",
      passed: alignmentPassed,
      points: 10,
    },
    {
      id: "image-alt",
      label: "Image alt text",
      detail: imageAlt
        ? imageAltPassed
          ? "Image alt text is present and descriptive."
          : "Image alt text is present but still thin for SEO and accessibility."
        : "No image attached to this section, so image alt text is not scored here.",
      passed: imageAltPassed,
      points: 10,
    },
  ];

  return {
    score: items.reduce((total, item) => total + (item.passed ? item.points : 0), 0),
    items,
  };
}

export async function readUploadErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };

    return payload.error?.message || "Cloudinary upload failed before media metadata was returned.";
  } catch {
    return "Cloudinary upload failed before media metadata was returned.";
  }
}

export function createDefaultAltText(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}
