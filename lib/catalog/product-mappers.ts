import { Prisma, type CatalogProduct } from "@prisma/client";

import type { Product } from "@/types/domain";
import type { ProductMutationInput } from "@/lib/catalog/product-validation";

type PrismaProductCategory = CatalogProduct["category"];

export function mapCatalogProductRecordToDomainProduct(record: CatalogProduct): Product {
  const baseProduct = {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: mapPrismaProductCategoryToDomain(record.category),
    description: record.description,
    priceUsd: Number(record.priceUsd),
    images: record.images as Product["images"],
    materials: record.materials as Product["materials"],
    palette: Array.isArray(record.palette) ? (record.palette as Product["palette"]) : [],
    origin: record.origin,
    status: mapStatus(record.status),
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    homepageFeatured: record.homepageFeatured,
    homepageRank: record.homepageRank,
  };

  if (record.type === "rug") {
    return {
      ...baseProduct,
      type: "rug",
      rugStyle: record.rugStyle ?? "",
      dimensionsCm: record.dimensionsCm as Extract<Product, { type: "rug" }>["dimensionsCm"],
      weightKg: Number(record.weightKg ?? 0),
      fixedQuantity: record.fixedQuantity === 1 ? 1 : 1,
    } as Extract<Product, { type: "rug" }>;
  }

  return {
    ...baseProduct,
    type: "multiUnit",
    inventory: record.inventory ?? 0,
    lowStockThreshold: record.lowStockThreshold ?? 0,
    variants: (record.variants ?? []) as Extract<Product, { type: "multiUnit" }>["variants"],
    notifyMeEnabled: Boolean(record.notifyMeEnabled),
  };
}

export function mapProductMutationInputToCreateInput(
  input: ProductMutationInput,
): Prisma.CatalogProductCreateInput {
  const baseInput: Prisma.CatalogProductCreateInput = {
    type: input.type,
    slug: input.slug,
    name: input.name,
    category: mapDomainProductCategoryToPrisma(input.category),
    description: input.description,
    priceUsd: createPrismaDecimal(input.priceUsd),
    origin: input.origin,
    status: input.status,
    images: sanitizeJsonValue(input.images) as Prisma.InputJsonValue,
    materials: sanitizeJsonValue(input.materials) as Prisma.InputJsonValue,
    palette: sanitizeJsonValue(input.palette) as Prisma.InputJsonValue,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    rugStyle: input.type === "rug" ? input.rugStyle : null,
    dimensionsCm:
      input.type === "rug"
        ? (sanitizeJsonValue(input.dimensionsCm) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    weightKg: input.type === "rug" ? createPrismaDecimal(input.weightKg) : null,
    fixedQuantity: input.type === "rug" ? input.fixedQuantity : null,
    inventory: input.type === "multiUnit" ? input.inventory : null,
    lowStockThreshold: input.type === "multiUnit" ? input.lowStockThreshold : null,
    variants:
      input.type === "multiUnit"
        ? (sanitizeJsonValue(input.variants) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    notifyMeEnabled: input.type === "multiUnit" ? input.notifyMeEnabled : null,
    homepageFeatured: input.homepageFeatured,
    homepageRank: input.homepageRank,
  };

  return input.id
    ? {
        ...baseInput,
        id: input.id,
      }
    : baseInput;
}

export function mapProductMutationInputToUpdateInput(
  input: ProductMutationInput,
): Prisma.CatalogProductUpdateInput {
  return {
    type: input.type,
    slug: input.slug,
    name: input.name,
    category: mapDomainProductCategoryToPrisma(input.category),
    description: input.description,
    priceUsd: createPrismaDecimal(input.priceUsd),
    origin: input.origin,
    status: input.status,
    images: sanitizeJsonValue(input.images) as Prisma.InputJsonValue,
    materials: sanitizeJsonValue(input.materials) as Prisma.InputJsonValue,
    palette: sanitizeJsonValue(input.palette) as Prisma.InputJsonValue,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    rugStyle: input.type === "rug" ? input.rugStyle : null,
    dimensionsCm:
      input.type === "rug"
        ? (sanitizeJsonValue(input.dimensionsCm) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    weightKg: input.type === "rug" ? createPrismaDecimal(input.weightKg) : null,
    fixedQuantity: input.type === "rug" ? input.fixedQuantity : null,
    inventory: input.type === "multiUnit" ? input.inventory : null,
    lowStockThreshold: input.type === "multiUnit" ? input.lowStockThreshold : null,
    variants:
      input.type === "multiUnit"
        ? (sanitizeJsonValue(input.variants) as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    notifyMeEnabled: input.type === "multiUnit" ? input.notifyMeEnabled : null,
    homepageFeatured: input.homepageFeatured,
    homepageRank: input.homepageRank,
  };
}

export function mapDomainProductCategoryToPrisma(
  category: Product["category"],
): PrismaProductCategory {
  return category;
}

export function mapPrismaProductCategoryToDomain(category: PrismaProductCategory): Product["category"] {
  return category;
}

function createPrismaDecimal(value: number) {
  return new Prisma.Decimal(value);
}

function sanitizeJsonValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, sanitizeJsonValue(nestedValue)]),
    ) as T;
  }

  return value;
}

function mapStatus(status: string): Product["status"] {
  if (status === "draft" || status === "active" || status === "archived") {
    return status;
  }

  return "draft";
}
