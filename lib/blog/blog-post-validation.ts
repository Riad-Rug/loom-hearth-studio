export const blogPostStatusOptions = ["draft", "active", "archived"] as const;

export type BlogPostStatus = (typeof blogPostStatusOptions)[number];

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
  imageAlt: string;
  imageSrc: string;
  seoTitle: string;
  seoDescription: string;
  targetKeyword: string;
  ctaLabel: string;
};

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
    imageAlt: readField(parsed, "imageAlt"),
    imageSrc: readField(parsed, "imageSrc"),
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
    },
  };
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
