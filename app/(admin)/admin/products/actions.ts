"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";

import type { AdminProductActionState } from "@/lib/admin/product-actions-shared";
import { parseProductFormData, validateProductMutationInput } from "@/lib/catalog/product-validation";
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

  const validation = validateProductMutationInput(parseProductFormData(formData));

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const repository = createProductRepository();

  if (await repository.slugExists({ slug: validation.value.slug })) {
    return {
      status: "error",
      message: "A persisted product already uses that slug. Slugs must remain globally unique in v1.",
      fieldErrors: {
        slug: "Choose a different slug.",
      },
    };
  }

  try {
    const createdProduct = await repository.create(validation.value);

    revalidateCatalogPaths({
      productId: createdProduct.id,
      nextPath: validation.urlState.nextPath,
      nextCategory: createdProduct.category,
      previousPath: null,
    });

    redirect(`/admin/products/${createdProduct.id}` as Route);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "Product slug and category must remain unique.",
        fieldErrors: {
          slug: "Slug/category combination is already taken.",
        },
      };
    }

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
        message: "Product slug and category must remain unique.",
        fieldErrors: {
          slug: "Slug/category combination is already taken.",
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

function revalidateCatalogPaths(input: {
  productId: string;
  nextPath: string;
  nextCategory: string;
  previousPath: string | null;
}) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.productId}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${input.nextCategory}`);

  if (input.previousPath) {
    revalidatePath(input.previousPath);
  }

  if (input.nextPath) {
    revalidatePath(input.nextPath);
  }
}
