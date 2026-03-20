"use server";

import { revalidatePath } from "next/cache";

import { validateBlogAuthor } from "@/features/blog/blog-author-data";
import type { AdminBlogAuthorActionState } from "@/lib/admin/blog-author-actions-shared";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { saveDefaultBlogAuthor } from "@/lib/blog/author";

export async function updateAdminBlogAuthorAction(
  _previousState: AdminBlogAuthorActionState,
  formData: FormData,
): Promise<AdminBlogAuthorActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before the default blog author can be saved.",
    };
  }

  const validation = validateBlogAuthor({
    name: typeof formData.get("name") === "string" ? String(formData.get("name")) : "",
    bio: typeof formData.get("bio") === "string" ? String(formData.get("bio")) : "",
    photoUrl:
      typeof formData.get("photoUrl") === "string" && String(formData.get("photoUrl")).trim()
        ? String(formData.get("photoUrl"))
        : null,
  });

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
    };
  }

  await saveDefaultBlogAuthor(validation.value);

  revalidatePath("/blog");
  revalidatePath("/admin/blog");

  return {
    status: "success",
    message: "Default blog author saved.",
  };
}
