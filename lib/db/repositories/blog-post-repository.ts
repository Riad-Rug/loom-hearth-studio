import { Prisma, type BlogPostEntry } from "@prisma/client";

import type { BlogPostRecord } from "@/features/blog/blog-post-data";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";
import type { BlogPostMutationInput } from "@/lib/blog/blog-post-validation";

export interface BlogPostRepository {
  listForAdmin(): Promise<BlogPostRecord[]>;
  listPublished(): Promise<BlogPostRecord[]>;
  getById(id: string): Promise<BlogPostRecord | null>;
  getBySlug(categorySlug: string, slug: string): Promise<BlogPostRecord | null>;
  create(input: BlogPostMutationInput): Promise<BlogPostRecord>;
  update(input: BlogPostMutationInput & { id: string }): Promise<BlogPostRecord>;
  delete(id: string): Promise<void>;
  slugExists(input: { slug: string; categorySlug: string; excludeId?: string }): Promise<boolean>;
}

export class PrismaBlogPostRepository implements BlogPostRepository {
  constructor(private readonly context: RepositoryContext) {}

  async listForAdmin() {
    const records = await this.context.client.blogPostEntry.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map(mapBlogPostEntryToDomain);
  }

  async listPublished() {
    const records = await this.context.client.blogPostEntry.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map(mapBlogPostEntryToDomain);
  }

  async getById(id: string) {
    const record = await this.context.client.blogPostEntry.findUnique({
      where: {
        id,
      },
    });

    return record ? mapBlogPostEntryToDomain(record) : null;
  }

  async getBySlug(categorySlug: string, slug: string) {
    const record = await this.context.client.blogPostEntry.findFirst({
      where: {
        categorySlug,
        slug,
      },
    });

    return record ? mapBlogPostEntryToDomain(record) : null;
  }

  async create(input: BlogPostMutationInput) {
    const record = await this.context.client.blogPostEntry.create({
      data: mapMutationInputToCreateInput(input),
    });

    return mapBlogPostEntryToDomain(record);
  }

  async update(input: BlogPostMutationInput & { id: string }) {
    const record = await this.context.client.blogPostEntry.update({
      where: {
        id: input.id,
      },
      data: mapMutationInputToUpdateInput(input),
    });

    return mapBlogPostEntryToDomain(record);
  }

  async delete(id: string) {
    await this.context.client.blogPostEntry.delete({
      where: {
        id,
      },
    });
  }

  async slugExists(input: { slug: string; categorySlug: string; excludeId?: string }) {
    const existingRecord = await this.context.client.blogPostEntry.findFirst({
      where: {
        slug: input.slug,
        categorySlug: input.categorySlug,
        ...(input.excludeId
          ? {
              id: {
                not: input.excludeId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    return Boolean(existingRecord);
  }
}

export function createBlogPostRepository(context = createRepositoryContext()) {
  return new PrismaBlogPostRepository(context);
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function mapBlogPostEntryToDomain(record: BlogPostEntry): BlogPostRecord {
  return {
    id: record.id,
    slug: record.slug,
    categorySlug: record.categorySlug,
    categoryLabel: record.categoryLabel,
    title: record.title,
    excerpt: record.excerpt,
    body: record.body,
    bodyFormat: record.bodyFormat === "markdown" ? "markdown" : "plain",
    publishedAt: record.publishedAt,
    readTime: record.readTime,
    status: mapStatus(record.status),
    images: parseBlogPostImages(record.images),
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    targetKeyword: record.targetKeyword,
    updatedAt: record.updatedAt.toISOString(),
    ctaLabel: record.ctaLabel,
  };
}

function parseBlogPostImages(value: unknown): BlogPostRecord["images"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const src = typeof candidate.src === "string" ? candidate.src : "";

    if (!src) {
      return [];
    }

    return [
      {
        id: typeof candidate.id === "string" && candidate.id ? candidate.id : src,
        src,
        alt: typeof candidate.alt === "string" ? candidate.alt : "",
      },
    ];
  });
}

function mapMutationInputToCreateInput(
  input: BlogPostMutationInput,
): Prisma.BlogPostEntryCreateInput {
  const baseInput: Prisma.BlogPostEntryCreateInput = {
    slug: input.slug,
    categorySlug: input.categorySlug,
    categoryLabel: input.categoryLabel,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    bodyFormat: input.bodyFormat ?? "plain",
    publishedAt: input.publishedAt,
    readTime: input.readTime,
    status: input.status,
    images: input.images as Prisma.InputJsonValue,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    targetKeyword: input.targetKeyword,
    ctaLabel: input.ctaLabel,
  };

  return input.id ? { ...baseInput, id: input.id } : baseInput;
}

function mapMutationInputToUpdateInput(
  input: BlogPostMutationInput,
): Prisma.BlogPostEntryUpdateInput {
  return {
    slug: input.slug,
    categorySlug: input.categorySlug,
    categoryLabel: input.categoryLabel,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    bodyFormat: input.bodyFormat ?? "plain",
    publishedAt: input.publishedAt,
    readTime: input.readTime,
    status: input.status,
    images: input.images as Prisma.InputJsonValue,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    targetKeyword: input.targetKeyword,
    ctaLabel: input.ctaLabel,
  };
}

function mapStatus(status: string): BlogPostRecord["status"] {
  if (status === "draft" || status === "active" || status === "archived") {
    return status;
  }

  return "draft";
}
