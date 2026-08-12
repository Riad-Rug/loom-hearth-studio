import type { BlogPostRecord } from "@/features/blog/blog-post-data";
import type { AdminBlogPostFormValues } from "@/lib/admin/blog-posts";

const PREVIEW_DRAFT_ID = "preview-draft";

/**
 * Maps the admin editor's all-strings form draft into the exact shape
 * BlogPostPageView expects, so the live preview reuses the real public
 * article template instead of a second approximate copy.
 */
export function toPreviewPost(draft: AdminBlogPostFormValues): BlogPostRecord {
  return {
    id: draft.id || PREVIEW_DRAFT_ID,
    slug: draft.slug || "preview",
    categorySlug: draft.categorySlug || "journal",
    categoryLabel: draft.categoryLabel || "Journal",
    title: draft.title || "Untitled article",
    excerpt: draft.excerpt,
    body: draft.body,
    bodyFormat: draft.bodyFormat,
    publishedAt: draft.publishedAt || "Draft — not yet published",
    readTime: draft.readTime || estimateReadTime(draft.body),
    status: draft.status,
    images: draft.images,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    targetKeyword: draft.targetKeyword,
    updatedAt: draft.updatedAt || new Date().toISOString(),
    ctaLabel: draft.ctaLabel || "Read the story",
  };
}

function estimateReadTime(body: string) {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));

  return `${minutes} min read`;
}
