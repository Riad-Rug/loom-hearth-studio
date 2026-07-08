import type { EntityStatus, MediaAsset, Product, ProductVariant } from "@/types/domain";

export const productTypeOptions = ["rug", "multiUnit"] as const;
export const productStatusOptions = ["draft", "active", "sold", "archived"] as const;
export const productCategoryOptions = [
  "rugs",
  "poufs",
  "pillows",
  "decor",
  "vintage",
] as const satisfies ReadonlyArray<Product["category"]>;
export const productRugStyleOptions = [
  "Boujad-style",
  "Azilal-style",
  "Beni Ourain-style",
  "Beni M'Guild-style",
  "Zemmour-style",
  "Boucherouite",
  "Flatweave (Hanbel)",
  "Mixed technique",
  "Unclassified",
] as const;
export const cloudinaryAssetRoleOptions = [
  "hero",
  "gallery",
  "styled",
  "detail",
  "edge",
  "back",
  "scale",
  "motif",
  "thumbnail",
  "featured",
  "og",
  "lookbook",
] as const satisfies ReadonlyArray<MediaAsset["role"]>;
export const mediaTypeOptions = ["image", "video"] as const satisfies ReadonlyArray<
  MediaAsset["mediaType"]
>;

type InternalProductFields = {
  acquisitionCostMad?: number;
  soldAt?: string;
};

export type ProductMutationInput =
  | (Omit<Extract<Product, { type: "rug" }>, "id" | "fixedQuantity"> & {
      id?: string;
      fixedQuantity: number;
    } & InternalProductFields)
  | (Omit<Extract<Product, { type: "multiUnit" }>, "id"> & { id?: string } & InternalProductFields);

export type ProductMutationFieldErrors = Partial<Record<string, string>>;

export type ProductMutationValidationResult =
  | {
      status: "valid";
      value: ProductMutationInput;
      urlState: {
        hasUrlChange: boolean;
        previousPath: string | null;
        nextPath: string;
      };
    }
  | {
      status: "invalid";
      message: string;
      fieldErrors: ProductMutationFieldErrors;
    };

type ProductFormParseResult =
  | {
      status: "parsed";
      value: ProductMutationInput;
      urlState: {
        hasUrlChange: boolean;
        previousPath: string | null;
        nextPath: string;
        confirmUrlChange: boolean;
      };
    }
  | {
      status: "invalid";
      message: string;
      fieldErrors: ProductMutationFieldErrors;
    };

export function parseProductFormData(formData: FormData): ProductFormParseResult {
  const typeValue = readString(formData, "type");

  if (!isProductType(typeValue)) {
    return {
      status: "invalid",
      message: "Product type is required.",
      fieldErrors: {
        type: "Choose rug or multi-unit.",
      },
    };
  }

  const sharedFields = {
    id: readOptionalString(formData, "id"),
    catalogNumber: readOptionalString(formData, "catalogNumber"),
    type: typeValue,
    slug: normalizeSlug(readString(formData, "slug")),
    name: readString(formData, "name"),
    category: readString(formData, "category"),
    description: readString(formData, "description"),
    priceUsd: readNumber(formData, "priceUsd"),
    acquisitionCostMad: readOptionalNonNegativeNumber(formData, "acquisitionCostMad"),
    images: parseImages(readString(formData, "imagesJson")),
    materials: parseMaterials(readString(formData, "materialsJson")),
    palette: parsePalette(readString(formData, "paletteJson")),
    origin: readString(formData, "origin"),
    attributionRegion: readOptionalString(formData, "attributionRegion"),
    attributionConfidence: readOptionalString(formData, "attributionConfidence"),
    provenanceNote: readOptionalString(formData, "provenanceNote"),
    sourcingNote: readOptionalString(formData, "sourcingNote"),
    conditionNote: readOptionalString(formData, "conditionNote"),
    ageClass: readOptionalString(formData, "ageClass"),
    ageBasis: readOptionalString(formData, "ageBasis"),
    verificationNotes: parseLineList(readString(formData, "verificationNotes")),
    shippingNotes: parseLineList(readString(formData, "shippingNotes")),
    careNote: readOptionalString(formData, "careNote"),
    status: readString(formData, "status"),
    soldAt: readOptionalString(formData, "soldAt"),
    seoTitle: readString(formData, "seoTitle"),
    seoDescription: readString(formData, "seoDescription"),
    homepageFeatured: readBoolean(formData, "homepageFeatured"),
    homepageRank: readOptionalInteger(formData, "homepageRank"),
  };

  const urlState = getUrlState(formData, {
    type: typeValue,
    slug: sharedFields.slug,
    category: sharedFields.category,
    rugStyle: readOptionalString(formData, "rugStyle") ?? "",
  });

  if (typeValue === "rug") {
    return {
      status: "parsed",
      value: {
        ...sharedFields,
        type: "rug",
        category: sharedFields.category as Product["category"],
        status: sharedFields.status as EntityStatus,
        rugStyle: readString(formData, "rugStyle"),
        dimensionsCm: {
          length: readNumber(formData, "dimensionsCmLength"),
          width: readNumber(formData, "dimensionsCmWidth"),
        },
        weightKg: readNumber(formData, "weightKg"),
        fixedQuantity: readInteger(formData, "fixedQuantity") === 1 ? 1 : 0,
      },
      urlState,
    };
  }

  return {
    status: "parsed",
    value: {
      ...sharedFields,
      type: "multiUnit",
      category: sharedFields.category as Product["category"],
      status: sharedFields.status as EntityStatus,
      inventory: readInteger(formData, "inventory"),
      lowStockThreshold: readInteger(formData, "lowStockThreshold"),
      variants: parseVariants(readString(formData, "variantsJson")),
      notifyMeEnabled: readBoolean(formData, "notifyMeEnabled"),
      dimensionsCm: createOptionalDimensions(formData),
      weightKg: readOptionalPositiveNumber(formData, "weightKg"),
    },
    urlState,
  };
}

export function validateProductMutationInput(
  parsed: ProductFormParseResult,
): ProductMutationValidationResult {
  if (parsed.status === "invalid") {
    return parsed;
  }

  const input = parsed.value;
  const fieldErrors: ProductMutationFieldErrors = {};

  if (!input.name.trim()) {
    fieldErrors.name = "Name is required.";
  }

  if (!input.slug) {
    fieldErrors.slug = "Slug is required.";
  }

  if (!isProductCategory(input.category)) {
    fieldErrors.category = "Choose a supported category.";
  }

  if (!input.description.trim()) {
    fieldErrors.description = "Description is required.";
  }

  if (!Number.isFinite(input.priceUsd) || input.priceUsd < 0) {
    fieldErrors.priceUsd = "Price must be zero or greater.";
  }

  if (!input.origin.trim()) {
    fieldErrors.origin = "Origin is required.";
  }

  if (input.catalogNumber && !/^LH-[RPXDA]-\d{4}$/u.test(input.catalogNumber)) {
    fieldErrors.catalogNumber = "Use the catalog format LH-R-0001, LH-P-0001, LH-X-0001, LH-D-0001, or LH-A-0001.";
  }

  if (input.catalogNumber && !isCatalogNumberValidForCategory(input.catalogNumber, input.category)) {
    fieldErrors.catalogNumber = "Catalog prefix does not match the selected category.";
  }

  if (input.status === "active" || input.status === "sold") {
    if (!input.catalogNumber) {
      fieldErrors.catalogNumber = "Catalog number is required before publishing.";
    }

    if (!input.conditionNote?.trim()) {
      fieldErrors.conditionNote = "Add a piece-specific condition note before publishing.";
    }

    if (!input.ageClass?.trim()) {
      fieldErrors.ageClass = "Choose an age class before publishing.";
    }

    if (input.ageClass && input.ageClass !== "Contemporary" && !input.ageBasis?.trim()) {
      fieldErrors.ageBasis = "Explain the basis for a vintage or antique age estimate.";
    }

    if (!input.attributionConfidence?.trim()) {
      fieldErrors.attributionConfidence = "Choose a provenance label before publishing.";
    }

    if (!input.provenanceNote?.trim()) {
      fieldErrors.provenanceNote = "Explain the basis for the provenance label before publishing.";
    }

    if (!input.sourcingNote?.trim()) {
      fieldErrors.sourcingNote = "Add a first-person sourcing note before publishing.";
    }
  }

  if (!isProductStatus(input.status)) {
    fieldErrors.status = "Choose draft, active, sold, or archived.";
  }

  if (input.acquisitionCostMad !== undefined && (!Number.isFinite(input.acquisitionCostMad) || input.acquisitionCostMad < 0)) {
    fieldErrors.acquisitionCostMad = "Acquisition cost must be zero or greater.";
  }

  if (input.status === "sold" && !isValidDateInput(input.soldAt)) {
    fieldErrors.soldAt = "Sold date is required when status is sold.";
  }

  if (!Array.isArray(input.materials) || input.materials.length === 0) {
    fieldErrors.materials = "Add at least one material.";
  }

  if (!Array.isArray(input.images) || input.images.length === 0) {
    fieldErrors.images = "Add at least one image.";
  }

  if (!input.seoTitle.trim()) {
    fieldErrors.seoTitle = "SEO title is required.";
  }

  if (!input.seoDescription.trim()) {
    fieldErrors.seoDescription = "SEO description is required.";
  }

  if (
    input.homepageRank !== null &&
    (!Number.isInteger(input.homepageRank) || input.homepageRank < 1)
  ) {
    fieldErrors.homepageRank = "Homepage rank must be a whole number of 1 or greater.";
  }

  if (input.type === "rug") {
    if (input.category !== "rugs" && input.category !== "vintage") {
      fieldErrors.category = 'Rug products must use the "rugs" or "vintage" category.';
    }

    if (!input.rugStyle.trim()) {
      fieldErrors.rugStyle = "Rug style is required.";
    } else if (!(productRugStyleOptions as readonly string[]).includes(input.rugStyle)) {
      fieldErrors.rugStyle = "Choose one of the canonical rug styles.";
    }

    if (!Number.isFinite(input.dimensionsCm.length) || input.dimensionsCm.length <= 0) {
      fieldErrors.dimensionsCmLength = "Length must be greater than zero.";
    }

    if (!Number.isFinite(input.dimensionsCm.width) || input.dimensionsCm.width <= 0) {
      fieldErrors.dimensionsCmWidth = "Width must be greater than zero.";
    }

    if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
      fieldErrors.weightKg = "Weight must be greater than zero.";
    }

    if (input.fixedQuantity !== 1) {
      fieldErrors.fixedQuantity = "Rugs must keep fixed quantity at 1.";
    }

    if (input.status === "active" || input.status === "sold") {
      const requiredRugImageRoles = ["hero", "detail", "edge", "back", "scale"] as const;
      const imageRoles = new Set(
        input.images
          .filter((image) => image.mediaType === "image" && image.publicId.trim())
          .map((image) => image.role),
      );
      const missingRoles = requiredRugImageRoles.filter((role) => !imageRoles.has(role));

      if (missingRoles.length) {
        fieldErrors.images = `Active rugs need distinct truthful views: full flat-lay, texture/detail close-up, fringe/edge, reverse side, and scale reference. Missing roles: ${missingRoles.join(", ")}. Add every flaw as an additional gallery image.`;
      }
    }
  }

  if (input.type === "multiUnit") {
    if (input.category === "rugs") {
      fieldErrors.category = 'Multi-unit products cannot use the "rugs" category.';
    }

    if (!Number.isInteger(input.inventory) || input.inventory < 0) {
      fieldErrors.inventory = "Inventory must be zero or greater.";
    }

    if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0) {
      fieldErrors.lowStockThreshold = "Low-stock threshold must be zero or greater.";
    }

    for (const [index, variant] of input.variants.entries()) {
      if (!variant.name.trim()) {
        fieldErrors[`variants.${index}.name`] = "Variant name is required.";
      }

      if (!variant.sku.trim()) {
        fieldErrors[`variants.${index}.sku`] = "Variant SKU is required.";
      }

      if (!Number.isInteger(variant.inventory) || variant.inventory < 0) {
        fieldErrors[`variants.${index}.inventory`] =
          "Variant inventory must be zero or greater.";
      }

      if (variant.priceUsd !== undefined && (!Number.isFinite(variant.priceUsd) || variant.priceUsd < 0)) {
        fieldErrors[`variants.${index}.priceUsd`] =
          "Variant price must be zero or greater when provided.";
      }
    }
  }

  if (parsed.urlState.hasUrlChange && !parsed.urlState.confirmUrlChange) {
    fieldErrors.confirmUrlChange =
      "Confirm the route change before saving a new public URL.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "invalid",
      message: "Product save request is incomplete or invalid. Review the highlighted listing fields.",
      fieldErrors,
    };
  }

  return {
    status: "valid",
    value: input,
    urlState: {
      hasUrlChange: parsed.urlState.hasUrlChange,
      previousPath: parsed.urlState.previousPath,
      nextPath: parsed.urlState.nextPath,
    },
  };
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductRoutePreview(input: {
  type: Product["type"];
  slug: string;
  category: string;
  rugStyle?: string;
}) {
  if (!input.slug.trim()) {
    return "";
  }

  if (input.type === "rug") {
    if (input.category === "vintage") {
      return `/shop/vintage/${input.slug}`;
    }

    const rugStyle = normalizeSlug(input.rugStyle ?? "");
    return rugStyle ? `/shop/rugs/${rugStyle}/${input.slug}` : "";
  }

  return isProductCategory(input.category) ? `/shop/${input.category}/${input.slug}` : "";
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : undefined;
}

function readNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? Number(value) : Number.NaN;
}

function readInteger(formData: FormData, key: string) {
  const value = readString(formData, key);
  return readStrictInteger(value, Number.NaN);
}

function readOptionalInteger(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? readStrictInteger(value, Number.NaN) : null;
}

function readOptionalPositiveNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  const parsed = value ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function readOptionalNonNegativeNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isValidDateInput(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/u.test(value) && !Number.isNaN(Date.parse(value)));
}

function createOptionalDimensions(formData: FormData) {
  const length = readOptionalPositiveNumber(formData, "dimensionsCmLength");
  const width = readOptionalPositiveNumber(formData, "dimensionsCmWidth");
  return length && width ? { length, width } : undefined;
}

function parseLineList(raw: string) {
  return raw
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isCatalogNumberValidForCategory(catalogNumber: string, category: Product["category"]) {
  const prefix = catalogNumber.slice(0, 4);

  if (category === "rugs" || category === "vintage") return prefix === "LH-R";
  if (category === "poufs") return prefix === "LH-P";
  if (category === "pillows") return prefix === "LH-X";
  return prefix === "LH-D" || prefix === "LH-A";
}

function readBoolean(formData: FormData, key: string) {
  return readString(formData, key) === "true";
}

function readStrictInteger(value: string, fallback: number) {
  return /^-?\d+$/u.test(value) ? Number(value) : fallback;
}

function parseMaterials(raw: string) {
  try {
    const value = JSON.parse(raw) as unknown;

    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parsePalette(raw: string) {
  try {
    const value = JSON.parse(raw) as unknown;

    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === "string" ? normalizeHexColor(item) : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeHexColor(value: string) {
  const trimmedValue = value.trim();
  return /^#[0-9a-f]{6}$/iu.test(trimmedValue) ? trimmedValue.toUpperCase() : "";
}

function parseImages(raw: string): MediaAsset[] {
  try {
    const value = JSON.parse(raw) as unknown;

    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((item, index) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const role = typeof candidate.role === "string" && isAssetRole(candidate.role)
        ? candidate.role
        : "gallery";
      const mediaType =
        typeof candidate.mediaType === "string" && isMediaType(candidate.mediaType)
          ? candidate.mediaType
          : "image";
      const publicId =
        typeof candidate.publicId === "string" ? candidate.publicId.trim() : "";
      const altText =
        typeof candidate.altText === "string" ? candidate.altText.trim() : "";

      if (!publicId || !altText) {
        return [];
      }

      return [
        {
          id:
            typeof candidate.id === "string" && candidate.id.trim()
              ? candidate.id.trim()
              : `image-${index + 1}`,
          publicId,
          altText,
          sortOrder:
            typeof candidate.sortOrder === "number" && Number.isFinite(candidate.sortOrder)
              ? candidate.sortOrder
              : index + 1,
          role,
          mediaType,
          width:
            typeof candidate.width === "number" && Number.isFinite(candidate.width)
              ? candidate.width
              : undefined,
          height:
            typeof candidate.height === "number" && Number.isFinite(candidate.height)
              ? candidate.height
              : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

function parseVariants(raw: string): ProductVariant[] {
  try {
    const value = JSON.parse(raw) as unknown;

    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((item, index) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
      const sku = typeof candidate.sku === "string" ? candidate.sku.trim() : "";

      return [
        {
          id:
            typeof candidate.id === "string" && candidate.id.trim()
              ? candidate.id.trim()
              : `variant-${index + 1}`,
          name,
          sku,
          inventory:
            typeof candidate.inventory === "number" && Number.isFinite(candidate.inventory)
              ? Math.trunc(candidate.inventory)
              : 0,
          priceUsd:
            typeof candidate.priceUsd === "number" && Number.isFinite(candidate.priceUsd)
              ? candidate.priceUsd
              : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

function getUrlState(
  formData: FormData,
  input: {
    type: Product["type"];
    slug: string;
    category: string;
    rugStyle: string;
  },
) {
  const previousPath = readOptionalString(formData, "originalRoutePath") ?? null;
  const nextPath = getProductRoutePreview(input);

  return {
    previousPath,
    nextPath,
    hasUrlChange: Boolean(previousPath && nextPath && previousPath !== nextPath),
    confirmUrlChange: readBoolean(formData, "confirmUrlChange"),
  };
}

function isProductType(value: string): value is Product["type"] {
  return (productTypeOptions as readonly string[]).includes(value);
}

function isProductStatus(value: string): value is EntityStatus {
  return (productStatusOptions as readonly string[]).includes(value);
}

function isProductCategory(value: string): value is Product["category"] {
  return (productCategoryOptions as readonly string[]).includes(value);
}

function isAssetRole(value: string): value is MediaAsset["role"] {
  return (cloudinaryAssetRoleOptions as readonly string[]).includes(value);
}

function isMediaType(value: string): value is MediaAsset["mediaType"] {
  return (mediaTypeOptions as readonly string[]).includes(value);
}
