import { Prisma } from "@prisma/client";
import { inspect } from "node:util";

import { mapCatalogProductRecordToDomainProduct, mapProductMutationInputToCreateInput, mapProductMutationInputToUpdateInput } from "@/lib/catalog/product-mappers";
import type { ProductMutationInput } from "@/lib/catalog/product-validation";
import { createRepositoryContext, type RepositoryContext } from "@/lib/db";
import type { Product } from "@/types/domain";

export interface ProductRepository {
  listAll(): Promise<Product[]>;
  listByCategory(category: Product["category"]): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
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
        status: "active",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  async listByCategory(category: Product["category"]) {
    const products = await this.context.client.catalogProduct.findMany({
      where: {
        category,
        status: "active",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return products.map(mapCatalogProductRecordToDomainProduct);
  }

  async getBySlug(slug: string) {
    const product = await this.context.client.catalogProduct.findFirst({
      where: {
        slug,
        status: "active",
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
    const updatedProduct = await this.context.client.catalogProduct.update({
      where: {
        id: input.id,
      },
      data: mapProductMutationInputToUpdateInput(input),
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
