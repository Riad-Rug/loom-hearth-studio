import { formatProductPriceUsd, getProductRoutePath } from "@/lib/catalog/helpers";
import { mapCatalogProductRecordToDomainProduct } from "@/lib/catalog/product-mappers";
import type { AdminProductFormValues } from "@/lib/admin/product-form-shared";
import { getProductRoutePreview } from "@/lib/catalog/product-validation";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createRepositoryContext } from "@/lib/db";
import { createProductRepository } from "@/lib/db/repositories/product-repository";
import type { Product } from "@/types/domain";

export type AdminProductListItem = {
  id: string;
  imageUrl: string | null;
  imageAlt: string;
  hasImage: boolean;
  name: string;
  category: Product["category"];
  status: Product["status"];
  priceLabel: string;
  priceUsd: number;
  updatedAtLabel: string;
  updatedAt: string;
  createdAtLabel: string;
  createdAt: string;
  routePath: string;
};

export type AdminProductsPageData = {
  description: string;
  items: AdminProductListItem[];
};

export type AdminProductFormPageData = {
  title: string;
  description: string;
  product: AdminProductFormValues;
};

export async function getAdminProductsPageData(): Promise<AdminProductsPageData> {
  const records = await createRepositoryContext().client.catalogProduct.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    description:
      "Persisted catalog products load here for launch-safe listing, creation, editing, and publish visibility control without touching in-repo launch data.",
    items: records.map((record) =>
      createAdminProductListItem(
        mapCatalogProductRecordToDomainProduct(record),
        record.createdAt,
        record.updatedAt,
      ),
    ),
  };
}

export async function getAdminProductFormPageData(productId: string): Promise<AdminProductFormPageData | null> {
  const product = await createProductRepository().getById(productId);

  if (!product) {
    return null;
  }

  return {
    title: `Edit ${product.name}`,
    description:
      "Edit persisted product content, pricing, route fields, and publish visibility from the admin products boundary.",
    product: createAdminProductFormValues(product),
  };
}

export function getNewAdminProductFormPageData(
  type: Product["type"] = "rug",
): AdminProductFormPageData {
  return {
    title: "Create product",
    description:
      "Create a persisted draft or active product using the same full required field set used for all product saves in v1.",
    product: createEmptyAdminProductFormValues(type),
  };
}

export function createEmptyAdminProductFormValues(type: Product["type"]): AdminProductFormValues {
  return {
    type,
    slug: "",
    name: "",
    category: type === "rug" ? "rugs" : "poufs",
    description: "",
    priceUsd: "",
    images: [],
    materials: [""],
    origin: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    rugStyle: "",
    dimensionsCmLength: "",
    dimensionsCmWidth: "",
    weightKg: "",
    fixedQuantity: "1",
    inventory: "0",
    lowStockThreshold: "0",
    variants: [],
    notifyMeEnabled: false,
    routePath: "",
  };
}

function createAdminProductListItem(
  product: Product,
  createdAt: Date,
  updatedAt: Date,
): AdminProductListItem {
  const heroImage = getProductHeroImage(product);

  return {
    id: product.id,
    imageUrl: heroImage
      ? buildCloudinaryUrl(heroImage.publicId, {
          transformation: {
            c: "fill",
            g: "auto",
            h: 120,
            q: "auto",
            w: 120,
          },
        })
      : null,
    imageAlt: heroImage?.altText?.trim() || `${product.name} product image`,
    hasImage: Boolean(heroImage),
    name: product.name,
    category: product.category,
    status: product.status,
    priceLabel: formatProductPriceUsd(product.priceUsd),
    priceUsd: product.priceUsd,
    updatedAtLabel: formatAdminDateLabel(updatedAt),
    updatedAt: updatedAt.toISOString(),
    createdAtLabel: formatAdminDateLabel(createdAt),
    createdAt: createdAt.toISOString(),
    routePath: getProductRoutePath(product),
  };
}

function getProductHeroImage(product: Product) {
  return (
    product.images.find((image) => image.mediaType === "image" && image.role === "hero") ??
    product.images.find((image) => image.mediaType === "image")
  );
}

function formatAdminDateLabel(value: Date) {
  const now = new Date();
  const diffDays = Math.round((value.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) <= 6) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(diffDays, "day");
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function createAdminProductFormValues(product: Product): AdminProductFormValues {
  return {
    id: product.id,
    type: product.type,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    priceUsd: String(product.priceUsd),
    images: product.images,
    materials: product.materials,
    origin: product.origin,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    rugStyle: product.type === "rug" ? product.rugStyle : "",
    dimensionsCmLength:
      product.type === "rug" ? String(product.dimensionsCm.length) : "",
    dimensionsCmWidth:
      product.type === "rug" ? String(product.dimensionsCm.width) : "",
    weightKg: product.type === "rug" ? String(product.weightKg) : "",
    fixedQuantity: product.type === "rug" ? String(product.fixedQuantity) : "1",
    inventory: product.type === "multiUnit" ? String(product.inventory) : "0",
    lowStockThreshold:
      product.type === "multiUnit" ? String(product.lowStockThreshold) : "0",
    variants: product.type === "multiUnit" ? product.variants : [],
    notifyMeEnabled: product.type === "multiUnit" ? product.notifyMeEnabled : false,
    routePath:
      product.type === "rug"
        ? getProductRoutePreview({
            type: product.type,
            slug: product.slug,
            category: product.category,
            rugStyle: product.rugStyle,
          })
        : getProductRoutePreview({
            type: product.type,
            slug: product.slug,
            category: product.category,
          }),
  };
}
