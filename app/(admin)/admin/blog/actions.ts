"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { validateBlogAuthor } from "@/features/blog/blog-author-data";
import type { AdminBlogAuthorActionState } from "@/lib/admin/blog-author-actions-shared";
import type { AdminBlogPostActionState } from "@/lib/admin/blog-post-actions-shared";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { saveDefaultBlogAuthor } from "@/lib/blog/author";
import {
  parseBlogPostFormData,
  validateBlogPostMutationInput,
} from "@/lib/blog/blog-post-validation";
import {
  createBlogPostRepository,
  isUniqueConstraintError,
} from "@/lib/db/repositories/blog-post-repository";

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

export async function createAdminBlogPostAction(
  _previousState: AdminBlogPostActionState,
  formData: FormData,
): Promise<AdminBlogPostActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before blog posts can be saved.",
      fieldErrors: {},
    };
  }

  const validation = validateBlogPostMutationInput(parseBlogPostFormData(formData));

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const repository = createBlogPostRepository();

  try {
    if (
      await repository.slugExists({
        slug: validation.value.slug,
        categorySlug: validation.value.categorySlug,
      })
    ) {
      return {
        status: "error",
        message: "A blog post already uses that slug within this category.",
        fieldErrors: { slug: "Choose a different slug." },
      };
    }

    const createdPost = await repository.create(validation.value);

    revalidateBlogPostPaths({
      postId: createdPost.id,
      nextPath: `/blog/${createdPost.categorySlug}/${createdPost.slug}`,
      previousPath: null,
    });

    redirect(`/admin/blog/${createdPost.id}` as Route);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "Blog post slug must remain unique within its category.",
        fieldErrors: { slug: "Slug/category combination is already taken." },
      };
    }

    console.error("ADMIN_BLOG_POST_CREATE_CATCH_ERROR", error);

    return {
      status: "error",
      message: "Blog post create failed. No changes were saved.",
      fieldErrors: {},
    };
  }
}

export async function updateAdminBlogPostAction(
  postId: string,
  _previousState: AdminBlogPostActionState,
  formData: FormData,
): Promise<AdminBlogPostActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before blog posts can be saved.",
      fieldErrors: {},
    };
  }

  const validation = validateBlogPostMutationInput(parseBlogPostFormData(formData));

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const repository = createBlogPostRepository();

  try {
    const existingPost = await repository.getById(postId);

    if (!existingPost) {
      return {
        status: "error",
        message: "Blog post not found.",
        fieldErrors: {},
      };
    }

    if (
      await repository.slugExists({
        slug: validation.value.slug,
        categorySlug: validation.value.categorySlug,
        excludeId: postId,
      })
    ) {
      return {
        status: "error",
        message: "A blog post already uses that slug within this category.",
        fieldErrors: { slug: "Choose a different slug." },
      };
    }

    const updatedPost = await repository.update({
      ...validation.value,
      id: postId,
    });

    revalidateBlogPostPaths({
      postId,
      nextPath: `/blog/${updatedPost.categorySlug}/${updatedPost.slug}`,
      previousPath: `/blog/${existingPost.categorySlug}/${existingPost.slug}`,
    });

    return {
      status: "success",
      message: "Blog post saved.",
      fieldErrors: {},
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "Blog post slug must remain unique within its category.",
        fieldErrors: { slug: "Slug/category combination is already taken." },
      };
    }

    console.error("ADMIN_BLOG_POST_UPDATE_CATCH_ERROR", error);

    return {
      status: "error",
      message: "Blog post update failed. No changes were saved.",
      fieldErrors: {},
    };
  }
}

function revalidateBlogPostPaths(input: {
  postId: string;
  nextPath: string;
  previousPath: string | null;
}) {
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${input.postId}`);
  revalidatePath("/blog");
  revalidatePath(input.nextPath);

  if (input.previousPath && input.previousPath !== input.nextPath) {
    revalidatePath(input.previousPath);
  }
}
