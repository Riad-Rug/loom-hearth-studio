import type { Prisma } from "@prisma/client";

import type { HomePageContent } from "@/features/home/home-page-data";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

const HOMEPAGE_CONTENT_KEY = "homepage";

export interface HomepageContentRepository {
  get(): Promise<{ id: string; key: string; content: Prisma.JsonValue; updatedAt: Date } | null>;
  save(content: HomePageContent): Promise<void>;
}

export class PrismaHomepageContentRepository implements HomepageContentRepository {
  constructor(private readonly context: RepositoryContext) {}

  async get() {
    return this.context.client.homepageContentRecord.findUnique({
      where: {
        key: HOMEPAGE_CONTENT_KEY,
      },
      select: {
        id: true,
        key: true,
        content: true,
        updatedAt: true,
      },
    });
  }

  async save(content: HomePageContent) {
    await this.context.client.homepageContentRecord.upsert({
      where: {
        key: HOMEPAGE_CONTENT_KEY,
      },
      update: {
        content: content as Prisma.InputJsonValue,
      },
      create: {
        key: HOMEPAGE_CONTENT_KEY,
        content: content as Prisma.InputJsonValue,
      },
    });
  }
}

export function createHomepageContentRepository(context = createRepositoryContext()) {
  return new PrismaHomepageContentRepository(context);
}
