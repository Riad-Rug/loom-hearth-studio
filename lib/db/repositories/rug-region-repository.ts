import { mapRugRegionRecord } from "@/lib/catalog/product-mappers";
import type { RugRegionSummary } from "@/lib/catalog/rug-taxonomy";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";

/** "Bejaâd" → "bejaad", "Beni M'Guild" → "beni-m-guild". */
export function createRegionSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

export class PrismaRugRegionRepository {
  constructor(private readonly context: RepositoryContext) {}

  async listAll(): Promise<RugRegionSummary[]> {
    const regions = await this.context.client.rugRegion.findMany({
      include: { parent: true },
      orderBy: { name: "asc" },
    });

    return regions.map((region) => mapRugRegionRecord(region)!);
  }

  async findById(id: string): Promise<RugRegionSummary | null> {
    const region = await this.context.client.rugRegion.findUnique({ where: { id }, include: { parent: true } });

    return mapRugRegionRecord(region) ?? null;
  }

  /** Returns the existing region when the name is already taken (case-insensitive). */
  async findOrCreate(input: { name: string; parentId?: string }): Promise<RugRegionSummary> {
    const name = input.name.replace(/\s+/gu, " ").trim();
    const existing = await this.context.client.rugRegion.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      include: { parent: true },
    });

    if (existing) {
      return mapRugRegionRecord(existing)!;
    }

    const baseSlug = createRegionSlug(name) || "region";
    let slug = baseSlug;

    for (let suffix = 2; await this.context.client.rugRegion.findUnique({ where: { slug } }); suffix += 1) {
      slug = `${baseSlug}-${suffix}`;
    }

    const created = await this.context.client.rugRegion.create({
      data: { name, slug, parentId: input.parentId || null },
      include: { parent: true },
    });

    return mapRugRegionRecord(created)!;
  }
}

export function createRugRegionRepository(context = createRepositoryContext()) {
  return new PrismaRugRegionRepository(context);
}
