"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Route } from "next";

import type { AdminProductActionState } from "@/lib/admin/product-actions-shared";
import { getProductRoutePath } from "@/lib/catalog/helpers";
import { normalizeSlug, parseProductFormData, validateProductMutationInput } from "@/lib/catalog/product-validation";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { createProductRepository, isUniqueConstraintError } from "@/lib/db/repositories/product-repository";

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

  console.log("ADMIN_CREATE_PERMISSION_ALLOWED");

  console.log("ADMIN_CREATE_FORMDATA", {
    name: formData.get("name"),
    description: formData.get("description"),
    origin: formData.get("origin"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    dimensionsCmLength: formData.get("dimensionsCmLength"),
    dimensionsCmWidth: formData.get("dimensionsCmWidth"),
    weightKg: formData.get("weightKg"),
    fixedQuantity: formData.get("fixedQuantity"),
    imagesJson: formData.get("imagesJson"),
  });

  const validation = validateProductMutationInput(parseProductFormData(formData));

  console.log("ADMIN_CREATE_VALIDATION_RESULT", {
    status: validation.status,
  });

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const repository = createProductRepository();

  console.log("ADMIN_CREATE_BEFORE_SLUG_EXISTS", {
    slug: validation.value.slug,
  });

  if (await repository.slugExists({ slug: validation.value.slug })) {
    console.log("ADMIN_CREATE_SLUG_EXISTS_TRUE", {
      slug: validation.value.slug,
    });

    return {
      status: "error",
      message: "A persisted product already uses that slug. Slugs must remain globally unique in v1.",
      fieldErrors: {
        slug: "Choose a different slug.",
      },
    };
  }

  try {
    console.log("ADMIN_CREATE_BEFORE_REPOSITORY_CREATE", {
      slug: validation.value.slug,
      type: validation.value.type,
      category: validation.value.category,
    });

    const createdProduct = await repository.create(validation.value);

    console.log("ADMIN_CREATE_AFTER_REPOSITORY_CREATE", {
      id: createdProduct.id,
    });

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
      message: "Product create request failed before a persisted response was returned.",
      fieldErrors: {},
    };
  }
}

export async function updateAdminProductAction(
  productId: string,
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

  const validation = validateProductMutationInput(parseProductFormData(formData));

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const repository = createProductRepository();

  if (await repository.slugExists({ slug: validation.value.slug, excludeId: productId })) {
    return {
      status: "error",
      message: "A persisted product already uses that slug. Slugs must remain globally unique in v1.",
      fieldErrors: {
        slug: "Choose a different slug.",
      },
    };
  }

  try {
    const updatedProduct = await repository.update({
      ...validation.value,
      id: productId,
    });

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

    return {
      status: "error",
      message: "Product update request failed before a persisted response was returned.",
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

  for (const productId of productIds) {
    const product = await repository.getById(productId);

    if (!product) {
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
      status: nextStatus,
    };
    const validation = validateProductMutationInput({
      status: "parsed",
      value: nextProduct,
      urlState: {
        hasUrlChange: false,
        previousPath: getProductRoutePath(product),
        nextPath: getProductRoutePath(nextProduct),
        confirmUrlChange: false,
      },
    });

    if (validation.status === "invalid") {
      throw new Error(`Could not ${bulkAction} "${product.name}": ${validation.message}`);
    }

    const updatedProduct = await repository.update({
      ...validation.value,
      id: productId,
    });

    revalidateCatalogPaths({
      productId,
      nextPath: getProductRoutePath(updatedProduct),
      nextCategory: updatedProduct.category,
      previousPath: getProductRoutePath(product),
    });
  }

  redirect("/admin/products" as Route);
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
