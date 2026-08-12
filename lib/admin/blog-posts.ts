import type { BlogPostRecord } from "@/features/blog/blog-post-data";
import { createBlogPostRepository } from "@/lib/db/repositories/blog-post-repository";
import { createBlogPostSeoAudit } from "@/lib/seo/blog-post-audit";
import type { BlogPostStatus } from "@/lib/blog/blog-post-validation";

export type AdminBlogPostFormValues = {
  id?: string;
  slug: string;
  categorySlug: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  body: string;
  bodyFormat: "plain" | "markdown";
  publishedAt: string;
  readTime: string;
  status: BlogPostStatus;
  imageAlt: string;
  imageSrc: string;
  seoTitle: string;
  seoDescription: string;
  targetKeyword: string;
  ctaLabel: string;
  updatedAt: string;
  previewPath: string;
};

export type AdminBlogPostListItem = {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryLabel: string;
  targetKeyword: string;
  status: BlogPostRecord["status"];
  updatedAt: string;
  updatedAtLabel: string;
  seoScore: number;
  previewPath: string;
};

export type AdminBlogPostsPageData = {
  description: string;
  items: AdminBlogPostListItem[];
};

export type AdminBlogPostFormPageData = {
  title: string;
  description: string;
  post: AdminBlogPostFormValues;
};

export async function getAdminBlogPostsPageData(): Promise<AdminBlogPostsPageData> {
  const posts = await createBlogPostRepository().listForAdmin();

  return {
    description:
      "Persisted journal articles load here for editing, SEO review, and publish status control.",
    items: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      categorySlug: post.categorySlug,
      categoryLabel: post.categoryLabel,
      targetKeyword: post.targetKeyword,
      status: post.status,
      updatedAt: post.updatedAt,
      updatedAtLabel: formatAdminDateLabel(new Date(post.updatedAt)),
      seoScore: createBlogPostSeoAudit(post).score,
      previewPath: `/blog/${post.categorySlug}/${post.slug}`,
    })),
  };
}

export async function getAdminBlogPostFormPageData(
  id: string,
): Promise<AdminBlogPostFormPageData | null> {
  const post = await createBlogPostRepository().getById(id);

  if (!post) {
    return null;
  }

  return {
    title: `Edit ${post.title}`,
    description:
      "Edit the persisted draft. The live preview below the form updates automatically as fields change.",
    post: createAdminBlogPostFormValues(post),
  };
}

export function getNewAdminBlogPostFormPageData(): AdminBlogPostFormPageData {
  return {
    title: "Create post",
    description:
      "Draft a new journal article. Saving creates the persisted record and opens it for further editing.",
    post: createEmptyAdminBlogPostFormValues(),
  };
}

export function createEmptyAdminBlogPostFormValues(): AdminBlogPostFormValues {
  return {
    id: undefined,
    slug: "",
    categorySlug: "",
    categoryLabel: "",
    title: "",
    excerpt: "",
    body: "",
    bodyFormat: "plain",
    publishedAt: "",
    readTime: "",
    status: "draft",
    imageAlt: "",
    imageSrc: "",
    seoTitle: "",
    seoDescription: "",
    targetKeyword: "",
    ctaLabel: "Read the story",
    updatedAt: "",
    previewPath: "",
  };
}

function createAdminBlogPostFormValues(post: BlogPostRecord): AdminBlogPostFormValues {
  return {
    id: post.id,
    slug: post.slug,
    categorySlug: post.categorySlug,
    categoryLabel: post.categoryLabel,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    bodyFormat: post.bodyFormat === "markdown" ? "markdown" : "plain",
    publishedAt: post.publishedAt ?? "",
    readTime: post.readTime,
    status: post.status === "active" || post.status === "archived" ? post.status : "draft",
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    targetKeyword: post.targetKeyword,
    ctaLabel: post.ctaLabel,
    updatedAt: post.updatedAt,
    previewPath: `/blog/${post.categorySlug}/${post.slug}`,
  };
}

function formatAdminDateLabel(value: Date) {
  const now = new Date();
  const diffDays = Math.round((value.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) <= 6) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffDays, "day");
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}
