import { mapRugRegionRecord } from "@/lib/catalog/product-mappers";
import { reservedRugPageSlugs } from "@/lib/catalog/rug-facets";
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

export type RugRegionUsage = RugRegionSummary & { productCount: number; childCount: number };

export type RugRegionDeleteResult =
  | { status: "deleted"; name: string; slug: string }
  | { status: "inUse"; name: string; productCount: number; childCount: number }
  | { status: "notFound" };

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

  /** Every region with how many products (any status) and sub-regions use it. */
  async listWithUsage(): Promise<RugRegionUsage[]> {
    const regions = await this.context.client.rugRegion.findMany({
      include: { parent: true, _count: { select: { products: true, children: true } } },
      orderBy: { name: "asc" },
    });

    return regions.map((region) => ({
      ...mapRugRegionRecord(region)!,
      productCount: region._count.products,
      childCount: region._count.children,
    }));
  }

  /**
   * Deletes a region only while nothing uses it. The schema would otherwise
   * quietly clear the Region of every product on it (onDelete: SetNull) and
   * detach its sub-regions, so any product, archived or draft included, or any
   * sub-region blocks the delete. Checked and deleted in one transaction so a
   * product saved onto the region in between cannot be stripped.
   */
  async deleteIfUnused(id: string): Promise<RugRegionDeleteResult> {
    return this.context.client.$transaction(async (tx) => {
      const region = await tx.rugRegion.findUnique({
        where: { id },
        include: { _count: { select: { products: true, children: true } } },
      });

      if (!region) {
        return { status: "notFound" };
      }

      if (region._count.products > 0 || region._count.children > 0) {
        return {
          status: "inUse",
          name: region.name,
          productCount: region._count.products,
          childCount: region._count.children,
        };
      }

      await tx.rugRegion.delete({ where: { id } });

      return { status: "deleted", name: region.name, slug: region.slug };
    });
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

    // A region's page is /shop/rugs/<slug>, so it may not take a Type page's
    // slug or a retired one that redirects ("pile" → "pile-2").
    for (
      let suffix = 2;
      reservedRugPageSlugs.has(slug) || (await this.context.client.rugRegion.findUnique({ where: { slug } }));
      suffix += 1
    ) {
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
