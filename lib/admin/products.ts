import { formatProductPriceUsd, getProductRoutePath } from "@/lib/catalog/helpers";
import { mapCatalogProductRecordToDomainProduct } from "@/lib/catalog/product-mappers";
import type { AdminProductFormValues } from "@/lib/admin/product-form-shared";
import { getProductRoutePreview } from "@/lib/catalog/product-validation";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createRepositoryContext } from "@/lib/db";
import type { Product } from "@/types/domain";

export type AdminProductListItem = {
  id: string;
  catalogNumber: string;
  imageUrl: string | null;
  imageAlt: string;
  hasImage: boolean;
  name: string;
  category: Product["category"];
  status: Product["status"];
  priceLabel: string;
  priceUsd: number;
  homepageFeatured: boolean;
  homepageRank: number | null;
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
  const record = await createRepositoryContext().client.catalogProduct.findUnique({
    where: { id: productId },
  });

  if (!record) {
    return null;
  }

  const product = mapCatalogProductRecordToDomainProduct(record);

  return {
    title: `Edit ${product.name}`,
    description:
      "Edit persisted product content, pricing, route fields, and publish visibility from the admin products boundary.",
    product: createAdminProductFormValues(product, {
      acquisitionCostMad:
        record.acquisitionCostMad === null ? "" : String(record.acquisitionCostMad),
      soldAt: record.soldAt ? formatDateInput(record.soldAt) : "",
    }),
  };
}

export function getNewAdminProductFormPageData(
  type: Product["type"] = "rug",
): AdminProductFormPageData {
  return {
    title: "Create product",
    description:
      "Create a truthful stockroom listing: catalog identity, exact physical facts, condition, provenance basis, sourcing note, and category-specific photographs.",
    product: createEmptyAdminProductFormValues(type),
  };
}

export function createEmptyAdminProductFormValues(type: Product["type"]): AdminProductFormValues {
  return {
    catalogNumber: "",
    type,
    slug: "",
    name: "",
    category: type === "rug" ? "rugs" : "poufs",
    description: "",
    priceUsd: "",
    acquisitionCostMad: "",
    images: [],
    materials: [""],
    palette: ["#F1E8D6", "#3A5F3A", "#C89B2A", "#B9562A", "#7A2B2B"],
    origin: "",
    attributionRegion: "",
    attributionConfidence: "",
    provenanceNote: "",
    sourcingNote: "",
    conditionNote: "",
    ageClass: "",
    ageBasis: "",
    verificationNotes: [],
    shippingNotes: [],
    careNote: "",
    status: "draft",
    soldAt: "",
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
    homepageFeatured: false,
    homepageRank: "",
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
    catalogNumber: product.catalogNumber ?? "",
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
    homepageFeatured: product.homepageFeatured,
    homepageRank: product.homepageRank,
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

function createAdminProductFormValues(
  product: Product,
  internal: { acquisitionCostMad: string; soldAt: string },
): AdminProductFormValues {
  return {
    id: product.id,
    catalogNumber: product.catalogNumber ?? "",
    type: product.type,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    priceUsd: String(product.priceUsd),
    acquisitionCostMad: internal.acquisitionCostMad,
    images: product.images,
    materials: product.materials,
    palette: product.palette,
    origin: product.origin,
    attributionRegion: product.attributionRegion ?? "",
    attributionConfidence: product.attributionConfidence ?? "",
    provenanceNote: product.provenanceNote ?? "",
    sourcingNote: product.sourcingNote ?? "",
    conditionNote: product.conditionNote ?? "",
    ageClass: product.ageClass ?? "",
    ageBasis: product.ageBasis ?? "",
    verificationNotes: product.verificationNotes ?? [],
    shippingNotes: product.shippingNotes ?? [],
    careNote: product.careNote ?? "",
    status: product.status,
    soldAt: internal.soldAt,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    rugStyle: product.type === "rug" ? product.rugStyle : "",
    dimensionsCmLength: product.dimensionsCm ? String(product.dimensionsCm.length) : "",
    dimensionsCmWidth: product.dimensionsCm ? String(product.dimensionsCm.width) : "",
    weightKg: product.weightKg ? String(product.weightKg) : "",
    fixedQuantity: product.type === "rug" ? String(product.fixedQuantity) : "1",
    inventory: product.type === "multiUnit" ? String(product.inventory) : "0",
    lowStockThreshold:
      product.type === "multiUnit" ? String(product.lowStockThreshold) : "0",
    variants: product.type === "multiUnit" ? product.variants : [],
    notifyMeEnabled: product.type === "multiUnit" ? product.notifyMeEnabled : false,
    homepageFeatured: product.homepageFeatured,
    homepageRank: product.homepageRank === null ? "" : String(product.homepageRank),
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

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
