import { Prisma } from "@prisma/client";
import { inspect } from "node:util";

import { mapCatalogProductRecordToDomainProduct, mapProductMutationInputToCreateInput, mapProductMutationInputToUpdateInput } from "@/lib/catalog/product-mappers";
import type { ProductMutationInput } from "@/lib/catalog/product-validation";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";
import type { Product } from "@/types/domain";

/**
 * A listed product paired with its raw persistence timestamp. Kept as a
 * separate shape rather than a field on Product: updatedAt is a database
 * concern with a single consumer (the sitemap's <lastmod>), and folding it
 * into the domain type would push it through every catalog surface.
 */
export type ProductWithUpdatedAt = {
  product: Product;
  updatedAt: Date;
};

export interface ProductRepository {
  listAll(): Promise<Product[]>;
  listAllWithUpdatedAt(): Promise<ProductWithUpdatedAt[]>;
  listByCategory(category: Product["category"]): Promise<Product[]>;
  listHomepageFeatured(limit: number): Promise<Product[]>;
  listInventoryEligible(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  /** Finds the listed product that previously used `slug`, so the old URL can 301 to the current one. */
  getByPreviousSlug(slug: string): Promise<Product | null>;
  listForAdmin(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(input: ProductMutationInput): Promise<Product>;
  update(input: ProductMutationInput & { id: string }): Promise<Product>;
  delete(id: string): Promise<void>;
  slugExists(input: { slug: string; excludeId?: string }): Promise<boolean>;
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly context: RepositoryContext) {}

  async listAll() {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        status: { in: ["active", "sold"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  // Same rows and ordering as listAll(), carrying each record's updatedAt
  // alongside the mapped domain product.
  async listAllWithUpdatedAt() {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        status: { in: ["active", "sold"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map((record) => ({
      product: mapCatalogProductRecordToDomainProduct(record),
      updatedAt: record.updatedAt,
    }));
  }

  async listByCategory(category: Product["category"]) {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        category,
        status: { in: ["active", "sold"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  async listHomepageFeatured(limit: number) {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        homepageFeatured: true,
        status: "active",
        OR: [
          {
            type: "rug",
          },
          {
            inventory: {
              gt: 0,
            },
          },
        ],
      },
      orderBy: [
        {
          homepageRank: {
            sort: "asc",
            nulls: "last",
          },
        },
        {
          updatedAt: "desc",
        },
      ],
      take: limit,
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  // Same eligibility predicate as listHomepageFeatured, minus the admin
  // homepageFeatured flag: everything currently buyable. Ordered
  // deterministically so the caller's seed is the only source of randomness.
  async listInventoryEligible() {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        status: "active",
        OR: [{ type: "rug" }, { inventory: { gt: 0 } }],
      },
      orderBy: { id: "asc" },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  async getBySlug(slug: string) {
    const product = await this.context.client.catalogProduct.findFirst({
      where: {
        slug,
        status: { in: ["active", "sold"] },
      },
    });

    return product ? mapCatalogProductRecordToDomainProduct(product) : null;
  }

  async getByPreviousSlug(slug: string) {
    const product = await this.context.client.catalogProduct.findFirst({
      where: {
        previousSlugs: { has: slug },
        status: { in: ["active", "sold"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return product ? mapCatalogProductRecordToDomainProduct(product) : null;
  }

  async listForAdmin() {
    const products = await this.context.client.catalogProduct.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  async getById(id: string) {
    const product = await this.context.client.catalogProduct.findUnique({
      where: {
        id,
      },
    });

    return product ? mapCatalogProductRecordToDomainProduct(product) : null;
  }

  async create(input: ProductMutationInput) {
    const data = mapProductMutationInputToCreateInput(input);

    try {
      const createdProduct = await this.context.client.catalogProduct.create({
        data,
      });

      return mapCatalogProductRecordToDomainProduct(createdProduct);
    } catch (error) {
      console.error("PRODUCT_REPOSITORY_CREATE_FAILED", {
        error,
        data: inspect(data, { depth: null }),
      });
      throw error;
    }
  }

  async update(input: ProductMutationInput & { id: string }) {
    // When the slug changes, remember the old one so the old URL keeps resolving
    // (see getByPreviousSlug). Runs on every admin save, so nothing is done by hand.
    const existingProduct = await this.context.client.catalogProduct.findUnique({
      where: { id: input.id },
      select: { slug: true, previousSlugs: true },
    });
    const previousSlugs =
      existingProduct && existingProduct.slug !== input.slug
        ? [
            ...existingProduct.previousSlugs.filter(
              (slug) => slug !== input.slug && slug !== existingProduct.slug,
            ),
            existingProduct.slug,
          ]
        : undefined;

    const updatedProduct = await this.context.client.catalogProduct.update({
      where: {
        id: input.id,
      },
      data: {
        ...mapProductMutationInputToUpdateInput(input),
        ...(previousSlugs ? { previousSlugs } : {}),
      },
    });

    return mapCatalogProductRecordToDomainProduct(updatedProduct);
  }

  async delete(id: string) {
    await this.context.client.catalogProduct.delete({
      where: {
        id,
      },
    });
  }

  async slugExists(input: { slug: string; excludeId?: string }) {
    const existingProduct = await this.context.client.catalogProduct.findFirst({
      where: {
        slug: input.slug,
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

    return Boolean(existingProduct);
  }
}

export function createProductRepository(context = createRepositoryContext()) {
  return new PrismaProductRepository(context);
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export const productRepositoryTodo =
  "Persisted catalog products now load through Prisma/PostgreSQL so admin product editing can replace the launch-only in-repo catalog source.";
