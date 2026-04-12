import type { SeoSetting } from "@prisma/client";

import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

export interface SeoSettingRepository {
  list(): Promise<SeoSetting[]>;
  getByEntity(input: { entityType: string; entityKey: string }): Promise<SeoSetting | null>;
  save(input: {
    entityType: string;
    entityKey: string;
    title: string | null;
    description: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
  }): Promise<SeoSetting>;
}

export class PrismaSeoSettingRepository implements SeoSettingRepository {
  constructor(private readonly context: RepositoryContext) {}

  async list() {
    return this.context.client.seoSetting.findMany({
      orderBy: [{ entityType: "asc" }, { entityKey: "asc" }],
    });
  }

  async getByEntity(input: { entityType: string; entityKey: string }) {
    return this.context.client.seoSetting.findUnique({
      where: {
        entityType_entityKey: {
          entityType: input.entityType,
          entityKey: input.entityKey,
        },
      },
    });
  }

  async save(input: {
    entityType: string;
    entityKey: string;
    title: string | null;
    description: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
  }) {
    return this.context.client.seoSetting.upsert({
      where: {
        entityType_entityKey: {
          entityType: input.entityType,
          entityKey: input.entityKey,
        },
      },
      update: {
        title: input.title,
        description: input.description,
        canonicalUrl: input.canonicalUrl,
        robotsIndex: input.robotsIndex,
        ogTitle: input.ogTitle,
        ogDescription: input.ogDescription,
        ogImageUrl: input.ogImageUrl,
      },
      create: {
        entityType: input.entityType,
        entityKey: input.entityKey,
        title: input.title,
        description: input.description,
        canonicalUrl: input.canonicalUrl,
        robotsIndex: input.robotsIndex,
        ogTitle: input.ogTitle,
        ogDescription: input.ogDescription,
        ogImageUrl: input.ogImageUrl,
      },
    });
  }
}

export function createSeoSettingRepository(context = createRepositoryContext()) {
  return new PrismaSeoSettingRepository(context);
}