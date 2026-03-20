import type { Prisma } from "@prisma/client";

import type { BlogAuthor } from "@/types/domain";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

const DEFAULT_BLOG_AUTHOR_KEY = "default-author";

export interface BlogAuthorRepository {
  get(): Promise<{ id: string; key: string; content: Prisma.JsonValue; updatedAt: Date } | null>;
  save(content: BlogAuthor): Promise<void>;
}

export class PrismaBlogAuthorRepository implements BlogAuthorRepository {
  constructor(private readonly context: RepositoryContext) {}

  async get() {
    return this.context.client.blogAuthorRecord.findUnique({
      where: {
        key: DEFAULT_BLOG_AUTHOR_KEY,
      },
      select: {
        id: true,
        key: true,
        content: true,
        updatedAt: true,
      },
    });
  }

  async save(content: BlogAuthor) {
    await this.context.client.blogAuthorRecord.upsert({
      where: {
        key: DEFAULT_BLOG_AUTHOR_KEY,
      },
      update: {
        content: content as Prisma.InputJsonValue,
      },
      create: {
        key: DEFAULT_BLOG_AUTHOR_KEY,
        content: content as Prisma.InputJsonValue,
      },
    });
  }
}

export function createBlogAuthorRepository(context = createRepositoryContext()) {
  return new PrismaBlogAuthorRepository(context);
}
