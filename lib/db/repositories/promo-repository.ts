import type { PromoRecord, PromoRedemptionRecord } from "@prisma/client";

import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

export interface PromoRepository {
  list(): Promise<PromoRecord[]>;
  getByCode(code: string): Promise<PromoRecord | null>;
  create(input: {
    code: string;
    type: "percent" | "fixed";
    amount: number;
    active: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    minimumSubtotalUsd: number | null;
    scopeType: "all" | "category" | "product";
    scopeCategory: string | null;
    scopeProductIds: string[];
    notes: string | null;
  }): Promise<PromoRecord>;
  toggleActive(id: string, active: boolean): Promise<PromoRecord>;
  incrementUsage(input: { promoId: string }): Promise<PromoRecord>;
  createRedemption(input: {
    promoId: string;
    orderId: string | null;
    customerEmail: string | null;
    code: string;
    discountUsd: number;
  }): Promise<PromoRedemptionRecord>;
}

export class PrismaPromoRepository implements PromoRepository {
  constructor(private readonly context: RepositoryContext) {}

  async list() {
    return this.context.client.promoRecord.findMany({ orderBy: [{ createdAt: "desc" }] });
  }

  async getByCode(code: string) {
    return this.context.client.promoRecord.findUnique({ where: { code } });
  }

  async create(input: {
    code: string;
    type: "percent" | "fixed";
    amount: number;
    active: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    minimumSubtotalUsd: number | null;
    scopeType: "all" | "category" | "product";
    scopeCategory: string | null;
    scopeProductIds: string[];
    notes: string | null;
  }) {
    return this.context.client.promoRecord.create({
      data: {
        code: input.code,
        type: input.type,
        amount: input.amount,
        active: input.active,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        usageLimit: input.usageLimit,
        minimumSubtotalUsd: input.minimumSubtotalUsd,
        scopeType: input.scopeType,
        scopeCategory: input.scopeCategory as never,
        scopeProductIds: input.scopeProductIds,
        notes: input.notes,
      },
    });
  }

  async toggleActive(id: string, active: boolean) {
    return this.context.client.promoRecord.update({ where: { id }, data: { active } });
  }

  async incrementUsage(input: { promoId: string }) {
    return this.context.client.promoRecord.update({
      where: { id: input.promoId },
      data: { usageCount: { increment: 1 } },
    });
  }

  async createRedemption(input: {
    promoId: string;
    orderId: string | null;
    customerEmail: string | null;
    code: string;
    discountUsd: number;
  }) {
    return this.context.client.promoRedemptionRecord.create({
      data: {
        promoId: input.promoId,
        orderId: input.orderId,
        customerEmail: input.customerEmail,
        code: input.code,
        discountUsd: input.discountUsd,
      },
    });
  }
}

export function createPromoRepository(context = createRepositoryContext()) {
  return new PrismaPromoRepository(context);
}
