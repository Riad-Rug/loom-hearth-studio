"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Route } from "next";

import type { AdminProductActionState } from "@/lib/admin/product-actions-shared";
import { getProductRoutePath } from "@/lib/catalog/helpers";
import { deriveRugUrlSegment, isUnclassifiedRugStyle } from "@/lib/catalog/rug-taxonomy";
import {
  newRegionOptionValue,
  normalizeSlug,
  parseProductFormData,
  validateProductMutationInput,
  type ProductMutationInput,
} from "@/lib/catalog/product-validation";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import type { ProductMutationContext } from "@/lib/catalog/product-validation";
import {
  createProductRepository,
  isUniqueConstraintError,
  ProductEditConflictError,
  type ProductRepository,
  type ProductStockState,
} from "@/lib/db/repositories/product-repository";
import { isOneOfOne, mergeStockEdit, type ProductEditBase } from "@/lib/order/inventory-hold";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";
import type { Product } from "@/types/domain";

export async function createAdminProductAction(
  _previousState: AdminProductActionState,
  formData: FormData,
): Promise<AdminProductActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before products can be saved.",
      fieldErrors: {},
    };
  }

  const parsed = parseProductFormData(formData);

  if (parsed.status === "parsed" && parsed.value.status === "reserved") {
    return {
      status: "error",
      message: onlyAnOrderReservesMessage,
      fieldErrors: { status: onlyAnOrderReservesMessage },
    };
  }

  const repository = createProductRepository();
  const validation = validateProductMutationInput(parsed, await loadSeoDescriptionContext(repository));

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  await resolveRugRegionAndStyle(validation.value);

  try {
    if (await repository.slugExists({ slug: validation.value.slug })) {
      return {
        status: "error",
        message: "A persisted product already uses that slug.",
        fieldErrors: { slug: "Choose a different slug." },
      };
    }

    const rankConflict = await findHomepageRankConflict(repository, validation.value);

    if (rankConflict) {
      return rankConflict;
    }

    const createdProduct = await repository.create(validation.value);

    revalidateCatalogPaths({
      productId: createdProduct.id,
      nextPath: validation.urlState.nextPath,
      nextCategory: createdProduct.category,
      previousPath: null,
    });

    redirect(`/admin/products/${createdProduct.id}` as Route);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "Product slug, category, and catalog number must remain unique.",
        fieldErrors: {
          slug: "Slug/category combination is already taken.",
          catalogNumber: "Catalog number is already assigned to another product.",
        },
      };
    }

    console.error("ADMIN_CREATE_CATCH_ERROR", error);

    return {
      status: "error",
      message: getProductPersistenceErrorMessage(error, "create"),
      fieldErrors: {},
    };
  }
}

// `loaded` is bound by the edit page when it renders, so the save can tell what
// the admin changed from what an order changed while the form was open.
export async function updateAdminProductAction(
  productId: string,
  loaded: ProductEditBase,
  _previousState: AdminProductActionState,
  formData: FormData,
): Promise<AdminProductActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before products can be saved.",
      fieldErrors: {},
    };
  }

  const parsed = parseProductFormData(formData);
  const repository = createProductRepository();
  const stored = await repository.getStockState(productId);

  if (!stored) {
    return { status: "error", message: "Product not found.", fieldErrors: {} };
  }

  const orderOwnedChange = parsed.status === "parsed" ? describeOrderOwnedChange(stored, parsed.value, loaded) : null;

  if (orderOwnedChange) {
    return {
      status: "error",
      message: orderOwnedChange.message,
      fieldErrors: { [orderOwnedChange.field]: orderOwnedChange.message },
    };
  }

  // Validate the stock as it will be saved: counts the admin left alone take
  // whatever orders have made them since the form loaded.
  const savedStock =
    parsed.status === "parsed" && parsed.value.type === "multiUnit"
      ? mergeStockEdit({ loaded, submitted: parsed.value, current: stored })
      : null;
  const validation = validateProductMutationInput(
    savedStock && parsed.status === "parsed" && parsed.value.type === "multiUnit"
      ? {
          ...parsed,
          value: { ...parsed.value, inventory: savedStock.inventory, variants: savedStock.variants },
        }
      : parsed,
    {
      committedUnits: stored.heldUnits + stored.soldUnits,
      ...(await loadSeoDescriptionContext(repository, productId)),
    },
  );

  if (validation.status === "invalid" || parsed.status !== "parsed") {
    return {
      status: "error",
      message: validation.status === "invalid" ? validation.message : "Product save request is invalid.",
      fieldErrors: validation.status === "invalid" ? validation.fieldErrors : {},
    };
  }

  // The update below saves parsed.value, so resolve the region on that.
  await resolveRugRegionAndStyle(parsed.value);

  try {
    if (await repository.slugExists({ slug: validation.value.slug, excludeId: productId })) {
      return {
        status: "error",
        message: "A persisted product already uses that slug.",
        fieldErrors: { slug: "Choose a different slug." },
      };
    }

    const rankConflict = await findHomepageRankConflict(repository, validation.value, productId);

    if (rankConflict) {
      return rankConflict;
    }

    const updatedProduct = await repository.update({ ...parsed.value, id: productId }, { loaded });

    revalidateCatalogPaths({
      productId,
      nextPath: validation.urlState.nextPath,
      nextCategory: updatedProduct.category,
      previousPath: validation.urlState.previousPath,
    });

    return {
      status: "success",
      message: "Persisted product saved.",
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof ProductEditConflictError) {
      return {
        status: "error",
        message: `An order changed this piece's ${error.fields.join(" and ")} while you were editing, so nothing was saved. Reload the page to see the current values, then make your change again.`,
        fieldErrors: {},
      };
    }

    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "Product slug, category, and catalog number must remain unique.",
        fieldErrors: {
          slug: "Slug/category combination is already taken.",
          catalogNumber: "Catalog number is already assigned to another product.",
        },
      };
    }

    console.error("ADMIN_UPDATE_CATCH_ERROR", error);

    return {
      status: "error",
      message: getProductPersistenceErrorMessage(error, "update"),
      fieldErrors: {},
    };
  }
}

export async function duplicateAdminProductAction(productId: string) {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    throw new Error("An admin role is required before products can be duplicated.");
  }

  const repository = createProductRepository();
  const product = await repository.getById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const duplicate = await repository.create({
    ...product,
    ...(product.type === "rug" ? { regionId: product.region?.id ?? null } : {}),
    id: undefined,
    catalogNumber: undefined,
    name: `${product.name} Copy`,
    slug: createDuplicatedSlug(product.slug),
    status: "draft",
    homepageFeatured: false,
    homepageRank: null,
  });

  revalidateCatalogPaths({
    productId: duplicate.id,
    nextPath: getProductRoutePath(duplicate),
    nextCategory: duplicate.category,
    previousPath: null,
  });

  redirect(`/admin/products/${duplicate.id}` as Route);
}

export async function deleteAdminProductAction(productId: string) {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    throw new Error("An admin role is required before products can be deleted.");
  }

  const repository = createProductRepository();
  const product = await repository.getById(productId);

  if (!product) {
    redirect("/admin/products" as Route);
  }

  if (isHeldByOrder(await repository.getStockState(productId))) {
    redirect(productListNoticeRoute({ held: [product.name], invalid: [] }));
  }

  await repository.delete(productId);

  revalidateCatalogPaths({
    productId,
    nextPath: "",
    nextCategory: product.category,
    previousPath: getProductRoutePath(product),
  });

  redirect("/admin/products" as Route);
}

const bulkProductActionOptions = ["enable", "disable", "archive", "delete"] as const;

type BulkProductAction = (typeof bulkProductActionOptions)[number];

export async function bulkAdminProductsAction(formData: FormData) {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    throw new Error("An admin role is required before products can be changed.");
  }

  const bulkAction = formData.get("bulkAction");
  const productIds = Array.from(
    new Set(
      formData
        .getAll("productId")
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean),
    ),
  );

  if (!isBulkProductAction(bulkAction) || productIds.length === 0) {
    redirect("/admin/products" as Route);
  }

  const repository = createProductRepository();
  const skipped = { held: [] as string[], invalid: [] as string[] };

  for (const productId of productIds) {
    const product = await repository.getById(productId);

    if (!product) {
      continue;
    }

    const stored = await repository.getStockState(productId);

    // A reserved piece's status belongs to its order, and deleting a product an
    // order holds would strand that order's stock.
    if (product.status === "reserved" || (bulkAction === "delete" && isHeldByOrder(stored))) {
      skipped.held.push(product.name);
      continue;
    }

    if (bulkAction === "delete") {
      await repository.delete(productId);

      revalidateCatalogPaths({
        productId,
        nextPath: "",
        nextCategory: product.category,
        previousPath: getProductRoutePath(product),
      });

      continue;
    }

    const nextStatus = getBulkStatus(bulkAction);
    const nextProduct = {
      ...product,
      ...(product.type === "rug" ? { regionId: product.region?.id ?? null } : {}),
      originalStatus: product.status,
      status: nextStatus,
    };
    const validation = validateProductMutationInput(
      {
        status: "parsed",
        value: nextProduct,
        urlState: {
          hasUrlChange: false,
          previousPath: getProductRoutePath(product),
          nextPath: getProductRoutePath(nextProduct),
          confirmUrlChange: false,
        },
      },
      { committedUnits: stored ? stored.heldUnits + stored.soldUnits : 0 },
    );

    if (validation.status === "invalid") {
      skipped.invalid.push(product.name);
      continue;
    }

    const updatedProduct = await repository.update(
      { ...validation.value, id: productId },
      { loaded: toEditBase(product) },
    );

    revalidateCatalogPaths({
      productId,
      nextPath: getProductRoutePath(updatedProduct),
      nextCategory: updatedProduct.category,
      previousPath: getProductRoutePath(product),
    });
  }

  redirect(productListNoticeRoute(skipped));
}

// Guard outcomes travel to the products list as query parameters, not thrown
// errors: Next replaces a thrown server-action message with a generic one in
// production. The list page renders them through a fixed template.
function productListNoticeRoute(skipped: { held: string[]; invalid: string[] }): Route {
  const params = new URLSearchParams();

  if (skipped.held.length) params.set("held", skipped.held.join("|"));
  if (skipped.invalid.length) params.set("invalid", skipped.invalid.join("|"));

  const query = params.toString();
  return (query ? `/admin/products?${query}` : "/admin/products") as Route;
}

const onlyAnOrderReservesMessage = "Only an order can reserve a piece. Choose another status.";

// Refuses only status changes the admin made: a status the form merely showed
// stale is left to the merge in PrismaProductRepository.update.
function describeOrderOwnedChange(
  stored: ProductStockState,
  input: ProductMutationInput,
  loaded: ProductEditBase,
): { field: string; message: string } | null {
  const holder = stored.holdingOrderNumber ? `order ${stored.holdingOrderNumber}` : "an open order";
  const adminChangedStatus = input.status !== loaded.status;

  if (stored.status === "reserved" && input.status !== "reserved" && adminChangedStatus) {
    return {
      field: "status",
      message: `This piece is reserved by ${holder}. Its status changes on its own when that order is captured, cancelled, or expires.`,
    };
  }

  if (stored.status !== "reserved" && input.status === "reserved" && adminChangedStatus) {
    return { field: "status", message: onlyAnOrderReservesMessage };
  }

  // Switching between status-tracked and count-tracked stock would strand the units already held.
  if (stored.heldUnits > 0 && isOneOfOne(stored) !== isOneOfOne(input)) {
    return {
      field: input.type !== stored.type ? "type" : "uniquenessTier",
      message: `Units of this product are held by ${holder}. Change its type or uniqueness tier after that order settles.`,
    };
  }

  return null;
}

// Every product counts, drafts and archived pieces too, since either can go live
// without its SEO description being touched again.
async function loadSeoDescriptionContext(
  repository: ProductRepository,
  productId?: string,
): Promise<Pick<ProductMutationContext, "otherSeoDescriptions" | "storedSeoDescription">> {
  const products = await repository.listForAdmin();

  return {
    otherSeoDescriptions: products
      .filter((product) => product.id !== productId)
      .map((product) => product.seoDescription),
    storedSeoDescription: products.find((product) => product.id === productId)?.seoDescription,
  };
}

function isHeldByOrder(stored: ProductStockState | null) {
  return Boolean(stored && (stored.status === "reserved" || stored.heldUnits > 0));
}

function toEditBase(product: Product): ProductEditBase {
  return product.type === "multiUnit"
    ? { status: product.status, inventory: product.inventory, variants: product.variants }
    : { status: product.status, inventory: null, variants: [] };
}

/** Two featured products may not share a homepage rank. */
async function findHomepageRankConflict(
  repository: ProductRepository,
  value: ProductMutationInput,
  excludeId?: string,
): Promise<AdminProductActionState | null> {
  if (!value.homepageFeatured || value.homepageRank === null) {
    return null;
  }

  const holder = await repository.findHomepageRankHolder({ rank: value.homepageRank, excludeId });

  if (!holder) {
    return null;
  }

  const label = holder.catalogNumber ? `${holder.catalogNumber} (${holder.name})` : holder.name;

  return {
    status: "error",
    message: `Homepage rank ${value.homepageRank} is already used.`,
    fieldErrors: {
      homepageRank: `${label} already has rank ${value.homepageRank}. Pick another rank or change that product first.`,
    },
  };
}

/**
 * "Add region" in the form: create (or reuse) the typed region and point the
 * product at it. Then set the rug's URL segment (stored in rugStyle):
 * - a rug that has been live keeps its segment, so every existing URL stays;
 * - a new or draft rug, or one still filed as Unclassified, gets the new path
 *   /shop/rugs/<region>/<slug> (the Type when no Region is set yet).
 */
async function resolveRugRegionAndStyle(value: ProductMutationInput) {
  if (value.type !== "rug") {
    return;
  }

  const regionRepository = createRugRegionRepository();

  if (value.regionId === newRegionOptionValue && value.newRegion) {
    const region = await regionRepository.findOrCreate(value.newRegion);
    value.regionId = region.id;
    revalidatePath("/admin/products");
  }

  const neverLive = value.originalStatus === undefined || value.originalStatus === "draft";

  if (!neverLive && !isUnclassifiedRugStyle(value.rugStyle)) {
    return;
  }

  const region = value.regionId ? await regionRepository.findById(value.regionId) : undefined;
  value.rugStyle = deriveRugUrlSegment(value.rugType, region ?? undefined);
}

function revalidateCatalogPaths(input: {
  productId: string;
  nextPath: string;
  nextCategory: string;
  previousPath: string | null;
}) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${input.nextCategory}`);

  if (input.previousPath) {
    revalidatePath(input.previousPath);
  }

  if (input.nextPath) {
    revalidatePath(input.nextPath);
  }
}

function createDuplicatedSlug(slug: string) {
  return normalizeSlug(`${slug}-copy-${Date.now().toString(36)}`);
}

function isBulkProductAction(value: FormDataEntryValue | null): value is BulkProductAction {
  return typeof value === "string" && bulkProductActionOptions.includes(value as BulkProductAction);
}

function getBulkStatus(action: Exclude<BulkProductAction, "delete">) {
  if (action === "enable") {
    return "active" as const;
  }

  if (action === "archive") {
    return "archived" as const;
  }

  return "draft" as const;
}

function getProductPersistenceErrorMessage(error: unknown, operation: "create" | "update") {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (code === "P2022") {
    return "The product database is missing a required column. Deploy the latest database migrations, then try again.";
  }

  if (code === "P1001" || code === "P1002") {
    return "The product database could not be reached. Try again shortly; if it continues, check the database connection.";
  }

  return `Product ${operation} failed. No changes were saved. Check the server log for ADMIN_${operation.toUpperCase()}_CATCH_ERROR.`;
}
