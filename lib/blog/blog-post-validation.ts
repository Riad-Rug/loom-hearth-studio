import { allowedImageHostnames } from "@/lib/media/allowed-image-hosts";

export const blogPostStatusOptions = ["draft", "active", "archived"] as const;
export const blogPostMaxImages = 5;
export const blogPostMinImages = 1;

export type BlogPostStatus = (typeof blogPostStatusOptions)[number];

export type BlogPostImage = {
  id: string;
  src: string;
  alt: string;
};

export type BlogPostMutationInput = {
  id?: string;
  slug: string;
  categorySlug: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  body: string;
  bodyFormat?: "plain" | "markdown";
  publishedAt: string;
  readTime: string;
  status: BlogPostStatus;
  images: BlogPostImage[];
  seoTitle: string;
  seoDescription: string;
  targetKeyword: string;
  ctaLabel: string;
};

const allowedImageHosts = new Set<string>(allowedImageHostnames);

export type BlogPostMutationFieldErrors = Partial<Record<string, string>>;

export type BlogPostMutationValidationResult =
  | {
      status: "valid";
      value: BlogPostMutationInput;
    }
  | {
      status: "invalid";
      message: string;
      fieldErrors: BlogPostMutationFieldErrors;
    };

export function parseBlogPostFormData(formData: FormData): BlogPostMutationInput {
  const raw = formData.get("postJson");
  const parsed = typeof raw === "string" ? safeParseJsonRecord(raw) : {};
  const statusValue = readField(parsed, "status");

  return {
    id: readOptionalField(parsed, "id"),
    slug: normalizeSlug(readField(parsed, "slug")),
    categorySlug: normalizeSlug(readField(parsed, "categorySlug")),
    categoryLabel: readField(parsed, "categoryLabel"),
    title: readField(parsed, "title"),
    excerpt: readField(parsed, "excerpt"),
    body: readField(parsed, "body"),
    bodyFormat: readField(parsed, "bodyFormat") === "markdown" ? "markdown" : "plain",
    publishedAt: readField(parsed, "publishedAt"),
    readTime: readField(parsed, "readTime"),
    status: isBlogPostStatus(statusValue) ? statusValue : "draft",
    images: parseBlogPostImages(parsed.images),
    seoTitle: readField(parsed, "seoTitle"),
    seoDescription: readField(parsed, "seoDescription"),
    targetKeyword: readField(parsed, "targetKeyword"),
    ctaLabel: readField(parsed, "ctaLabel"),
  };
}

export function validateBlogPostMutationInput(
  input: BlogPostMutationInput,
): BlogPostMutationValidationResult {
  const fieldErrors: BlogPostMutationFieldErrors = {};

  if (!input.title.trim()) {
    fieldErrors.title = "Title is required.";
  }

  if (!input.slug.trim()) {
    fieldErrors.slug = "Slug is required.";
  }

  if (!input.categorySlug.trim()) {
    fieldErrors.categorySlug = "Category slug is required.";
  }

  if (!input.categoryLabel.trim()) {
    fieldErrors.categoryLabel = "Category label is required.";
  }

  if (!input.excerpt.trim()) {
    fieldErrors.excerpt = "Excerpt is required.";
  }

  if (!input.body.trim()) {
    fieldErrors.body = "Body is required.";
  }

  if (!input.seoTitle.trim()) {
    fieldErrors.seoTitle = "SEO title is required.";
  }

  if (!input.seoDescription.trim()) {
    fieldErrors.seoDescription = "SEO description is required.";
  }

  const trimmedImages = input.images
    .map((image) => ({
      id: image.id.trim() || image.src.trim(),
      src: image.src.trim(),
      alt: image.alt.trim(),
    }))
    .filter((image) => image.src)
    .slice(0, blogPostMaxImages);

  if (trimmedImages.length < blogPostMinImages) {
    fieldErrors.images = "At least one image (the hero/cover image) is required.";
  } else {
    const missingAltIndex = trimmedImages.findIndex((image) => image.src && !image.alt);

    if (missingAltIndex >= 0) {
      fieldErrors.images = `Image ${missingAltIndex + 1} needs alt text before it can be saved.`;
    } else {
      const invalidHostIndex = trimmedImages.findIndex((image) => !isAllowedBlogImageUrl(image.src));

      if (invalidHostIndex >= 0) {
        fieldErrors.images = `Image ${invalidHostIndex + 1} uses an unsupported image host.`;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "invalid",
      message: "Fix the highlighted fields before saving.",
      fieldErrors,
    };
  }

  return {
    status: "valid",
    value: {
      ...input,
      title: input.title.trim(),
      slug: input.slug.trim(),
      categorySlug: input.categorySlug.trim(),
      categoryLabel: input.categoryLabel.trim(),
      excerpt: input.excerpt.trim(),
      seoTitle: input.seoTitle.trim(),
      seoDescription: input.seoDescription.trim(),
      images: trimmedImages,
    },
  };
}

function isAllowedBlogImageUrl(value: string) {
  try {
    const parsed = new URL(value);

    return parsed.protocol === "https:" && allowedImageHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isBlogPostStatus(value: string): value is BlogPostStatus {
  return (blogPostStatusOptions as readonly string[]).includes(value);
}

function safeParseJsonRecord(value: string): Record<string, unknown> {
  try {
    const result: unknown = JSON.parse(value);
    return result && typeof result === "object" && !Array.isArray(result)
      ? (result as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function readField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readOptionalField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseBlogPostImages(value: unknown): BlogPostImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const src = typeof candidate.src === "string" ? candidate.src : "";
    const alt = typeof candidate.alt === "string" ? candidate.alt : "";
    const id = typeof candidate.id === "string" && candidate.id ? candidate.id : `image-${index + 1}`;

    if (!src && !alt) {
      return [];
    }

    return [{ id, src, alt }];
  });
}
