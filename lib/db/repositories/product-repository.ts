import { Prisma } from "@prisma/client";
import { inspect } from "node:util";

import { mapCatalogProductRecordToDomainProduct, mapProductMutationInputToCreateInput, mapProductMutationInputToUpdateInput } from "@/lib/catalog/product-mappers";
import type { ProductMutationInput } from "@/lib/catalog/product-validation";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";
import { mergeStockEdit, type StockLevels } from "@/lib/order/inventory-hold";
import type { Product } from "@/types/domain";
import type { ProductVariant } from "@/types/domain/product";

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

// Reserved pieces stay listed so their pages keep resolving and read as taken.
const storefrontProductStatuses = ["active", "reserved", "sold"];

export type ProductStockState = {
  status: string;
  type: string;
  uniquenessTier: string | null;
  reservingOrderNumber: string | null;
  inventory: number | null;
  variants: ProductVariant[];
  // Units in orders that hold them awaiting approval, and units those orders sold.
  heldUnits: number;
  soldUnits: number;
};

export type ProductUpdateResult = {
  product: Product;
  // Counts an order changed while the admin's form was open and the admin also
  // edited; the order's value was kept.
  stockConflicts: string[];
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
  // `loadedStock` is the stock the admin's form showed, so a save never undoes
  // what an order moved meanwhile.
  update(
    input: ProductMutationInput & { id: string },
    options: { loadedStock: StockLevels },
  ): Promise<ProductUpdateResult>;
  getStockState(id: string): Promise<ProductStockState | null>;
  delete(id: string): Promise<void>;
  slugExists(input: { slug: string; excludeId?: string }): Promise<boolean>;
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly context: RepositoryContext) {}

  async listAll() {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        status: { in: storefrontProductStatuses },
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
        status: { in: storefrontProductStatuses },
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
        status: { in: storefrontProductStatuses },
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
        status: { in: storefrontProductStatuses },
      },
    });

    return product ? mapCatalogProductRecordToDomainProduct(product) : null;
  }

  async getByPreviousSlug(slug: string) {
    const product = await this.context.client.catalogProduct.findFirst({
      where: {
        previousSlugs: { has: slug },
        status: { in: storefrontProductStatuses },
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

  async update(input: ProductMutationInput & { id: string }, options: { loadedStock: StockLevels }) {
    return this.context.client.$transaction(async (tx) => {
      // The same row lock order stock moves take, so a save cannot interleave with one.
      const [existingProduct] = await tx.$queryRaw<
        Array<{
          slug: string;
          previousSlugs: string[];
          status: string;
          inventory: number | null;
          variants: Prisma.JsonValue | null;
        }>
      >`SELECT "slug", "previousSlugs", "status", "inventory", "variants"
        FROM "CatalogProduct" WHERE "id" = ${input.id} FOR UPDATE`;
      // When the slug changes, remember the old one so the old URL keeps resolving
      // (see getByPreviousSlug). Runs on every admin save, so nothing is done by hand.
      const previousSlugs =
        existingProduct && existingProduct.slug !== input.slug
          ? [
              ...existingProduct.previousSlugs.filter(
                (slug) => slug !== input.slug && slug !== existingProduct.slug,
              ),
              existingProduct.slug,
            ]
          : undefined;
      // Only an order reserves a piece or gives it back; product edits never write that status.
      const status =
        existingProduct && (existingProduct.status === "reserved" || input.status === "reserved")
          ? (existingProduct.status as Product["status"])
          : input.status;
      const stock =
        existingProduct && input.type === "multiUnit"
          ? mergeStockEdit({
              loaded: options.loadedStock,
              submitted: { inventory: input.inventory, variants: input.variants },
              current: { inventory: existingProduct.inventory, variants: parseVariants(existingProduct.variants) },
            })
          : null;
      const nextInput: ProductMutationInput =
        stock && input.type === "multiUnit"
          ? { ...input, status, inventory: stock.inventory, variants: stock.variants }
          : { ...input, status };

      const updatedProduct = await tx.catalogProduct.update({
        where: {
          id: input.id,
        },
        data: {
          ...mapProductMutationInputToUpdateInput(nextInput),
          ...(previousSlugs ? { previousSlugs } : {}),
        },
      });

      return {
        product: mapCatalogProductRecordToDomainProduct(updatedProduct),
        stockConflicts: stock?.conflicts ?? [],
      };
    });
  }

  async getStockState(id: string) {
    const product = await this.context.client.catalogProduct.findUnique({
      where: { id },
      select: {
        status: true,
        type: true,
        uniquenessTier: true,
        reservedByOrderId: true,
        inventory: true,
        variants: true,
      },
    });

    if (!product) {
      return null;
    }

    const [committedLines, reservingOrder] = await Promise.all([
      this.context.client.orderLineItemRecord.findMany({
        where: { productId: id, order: { inventoryHold: { in: ["held", "sold"] } } },
        select: { quantity: true, order: { select: { inventoryHold: true } } },
      }),
      product.reservedByOrderId
        ? this.context.client.orderRecord.findUnique({
            where: { id: product.reservedByOrderId },
            select: { orderNumber: true },
          })
        : null,
    ]);
    const unitsWithHold = (hold: "held" | "sold") =>
      committedLines
        .filter((line) => line.order.inventoryHold === hold)
        .reduce((total, line) => total + line.quantity, 0);

    return {
      status: product.status,
      type: product.type,
      uniquenessTier: product.uniquenessTier,
      reservingOrderNumber: reservingOrder?.orderNumber ?? null,
      inventory: product.inventory,
      variants: parseVariants(product.variants),
      heldUnits: unitsWithHold("held"),
      soldUnits: unitsWithHold("sold"),
    };
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

function parseVariants(value: Prisma.JsonValue | null): ProductVariant[] {
  return Array.isArray(value) ? (value as unknown as ProductVariant[]) : [];
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export const productRepositoryTodo =
  "Persisted catalog products now load through Prisma/PostgreSQL so admin product editing can replace the launch-only in-repo catalog source.";
