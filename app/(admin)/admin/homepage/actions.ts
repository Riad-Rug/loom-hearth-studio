"use server";

import { revalidatePath } from "next/cache";

import {
  sanitizeHomePageContent,
  validateHomePageContent,
} from "@/features/home/home-page-data";
import type { AdminHomepageActionState } from "@/lib/admin/homepage-actions-shared";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { saveHomepageContent } from "@/lib/homepage/content";

export async function updateAdminHomepageAction(
  _previousState: AdminHomepageActionState,
  formData: FormData,
): Promise<AdminHomepageActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before homepage content can be saved.",
    };
  }

  const content = sanitizeHomePageContent(parseHomepageContentFormData(formData));
  const validation = validateHomePageContent(content);

  if (validation.status === "invalid") {
    return {
      status: "error",
      message: validation.message,
    };
  }

  await saveHomepageContent(validation.value);

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/homepage");

  return {
    status: "success",
    message: "Persisted homepage content saved.",
  };
}

function parseHomepageContentFormData(formData: FormData) {
  const result: Record<string, unknown> = {};

  for (const [key, rawValue] of formData.entries()) {
    if (key.startsWith("$ACTION_") || typeof rawValue !== "string") {
      continue;
    }

    assignPath(result, key.split("."), rawValue);
  }

  return result;
}

function assignPath(target: Record<string, unknown>, segments: string[], value: string) {
  let current: Record<string, unknown> | unknown[] = target;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const nextSegment = segments[index + 1];
    const nextIsIndex = typeof nextSegment === "string" && /^\d+$/.test(nextSegment);

    if (Array.isArray(current)) {
      const arrayIndex = Number(segment);

      if (isLast) {
        current[arrayIndex] = value;
        return;
      }

      const existing = current[arrayIndex];

      if (!existing || typeof existing !== "object") {
        current[arrayIndex] = nextIsIndex ? [] : {};
      }

      current = current[arrayIndex] as Record<string, unknown> | unknown[];
      return;
    }

    if (isLast) {
      current[segment] = value;
      return;
    }

    const existing = current[segment];

    if (!existing || typeof existing !== "object") {
      current[segment] = nextIsIndex ? [] : {};
    }

    current = current[segment] as Record<string, unknown> | unknown[];
  });
}
