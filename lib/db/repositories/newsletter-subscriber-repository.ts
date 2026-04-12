import type { NewsletterSubscriberRecord } from "@prisma/client";

import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

export interface NewsletterSubscriberRepository {
  list(): Promise<NewsletterSubscriberRecord[]>;
  getByEmail(email: string): Promise<NewsletterSubscriberRecord | null>;
  save(input: {
    email: string;
    source: string;
    status: string;
    mailchimpAudienceId: string | null;
    mailchimpMemberId: string | null;
    tags: string[];
    consentedAt: Date | null;
    unsubscribedAt: Date | null;
    lastSyncedAt: Date | null;
  }): Promise<NewsletterSubscriberRecord>;
  updateStatusByEmail(input: {
    email: string;
    status: string;
    unsubscribedAt?: Date | null;
    lastSyncedAt?: Date | null;
  }): Promise<NewsletterSubscriberRecord>;
}

export class PrismaNewsletterSubscriberRepository implements NewsletterSubscriberRepository {
  constructor(private readonly context: RepositoryContext) {}

  async list() {
    return this.context.client.newsletterSubscriberRecord.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async getByEmail(email: string) {
    return this.context.client.newsletterSubscriberRecord.findUnique({
      where: { email },
    });
  }

  async save(input: {
    email: string;
    source: string;
    status: string;
    mailchimpAudienceId: string | null;
    mailchimpMemberId: string | null;
    tags: string[];
    consentedAt: Date | null;
    unsubscribedAt: Date | null;
    lastSyncedAt: Date | null;
  }) {
    return this.context.client.newsletterSubscriberRecord.upsert({
      where: { email: input.email },
      update: {
        source: input.source,
        status: input.status,
        mailchimpAudienceId: input.mailchimpAudienceId,
        mailchimpMemberId: input.mailchimpMemberId,
        tags: input.tags,
        consentedAt: input.consentedAt,
        unsubscribedAt: input.unsubscribedAt,
        lastSyncedAt: input.lastSyncedAt,
      },
      create: {
        email: input.email,
        source: input.source,
        status: input.status,
        mailchimpAudienceId: input.mailchimpAudienceId,
        mailchimpMemberId: input.mailchimpMemberId,
        tags: input.tags,
        consentedAt: input.consentedAt,
        unsubscribedAt: input.unsubscribedAt,
        lastSyncedAt: input.lastSyncedAt,
      },
    });
  }

  async updateStatusByEmail(input: {
    email: string;
    status: string;
    unsubscribedAt?: Date | null;
    lastSyncedAt?: Date | null;
  }) {
    return this.context.client.newsletterSubscriberRecord.update({
      where: { email: input.email },
      data: {
        status: input.status,
        unsubscribedAt: input.unsubscribedAt,
        lastSyncedAt: input.lastSyncedAt,
      },
    });
  }
}

export function createNewsletterSubscriberRepository(context = createRepositoryContext()) {
  return new PrismaNewsletterSubscriberRepository(context);
}
