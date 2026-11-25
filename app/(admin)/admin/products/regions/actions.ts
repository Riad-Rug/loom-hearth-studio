"use server";

import { revalidatePath } from "next/cache";

import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";

export type AdminRugRegionActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

/** Deletes a rug region, refused while any product or sub-region uses it. */
export async function deleteAdminRugRegionAction(
  _previous: AdminRugRegionActionState,
  formData: FormData,
): Promise<AdminRugRegionActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return { status: "error", message: "An admin role is required before regions can be deleted." };
  }

  const regionId = String(formData.get("regionId") ?? "").trim();

  if (!regionId) {
    return { status: "error", message: "No region was chosen." };
  }

  const result = await createRugRegionRepository().deleteIfUnused(regionId);

  if (result.status === "notFound") {
    revalidatePath("/admin/products/regions");
    return { status: "error", message: "That region no longer exists." };
  }

  if (result.status === "inUse") {
    const uses = [
      result.productCount ? `${result.productCount} product${result.productCount === 1 ? "" : "s"}` : null,
      result.childCount ? `${result.childCount} sub-region${result.childCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean);

    revalidatePath("/admin/products/regions");
    return {
      status: "error",
      message: `${result.name} is still used by ${uses.join(" and ")}. Move them to another region first.`,
    };
  }

  revalidatePath("/admin/products/regions");
  // The Rugs menu, filters and sitemap read the region list.
  revalidatePath("/", "layout");

  return { status: "success", message: `${result.name} deleted.` };
}
