"use server";

import { revalidatePath } from "next/cache";

import { normalizePublicUrl } from "@/config/site";
import type { AdminSeoActionState } from "@/lib/admin/seo-actions-shared";
import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { saveSeoSetting } from "@/lib/seo/settings";

export async function saveAdminSeoSettingAction(
  _previousState: AdminSeoActionState,
  formData: FormData,
): Promise<AdminSeoActionState> {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return {
      status: "error",
      message: "An admin role is required before SEO settings can be saved.",
      recordKey: null,
    };
  }

  const recordKey = readString(formData.get("recordKey"));
  const label = readString(formData.get("label"));
  const entityType = readString(formData.get("entityType"));
  const entityKey = readString(formData.get("entityKey"));
  const path = readString(formData.get("path"));

  if (!recordKey || !label || !entityType || !entityKey || !path.startsWith("/")) {
    return {
      status: "error",
      message: "Choose a valid route before saving SEO settings.",
      recordKey: null,
    };
  }

  const canonicalUrl = normalizeOptionalUrl(readString(formData.get("canonicalUrl")));
  const ogImageUrl = normalizeOptionalUrl(readString(formData.get("ogImageUrl")));

  if (readString(formData.get("canonicalUrl")) && !canonicalUrl) {
    return {
      status: "error",
      message: "Canonical URL must be a valid absolute URL.",
      recordKey,
    };
  }

  if (readString(formData.get("ogImageUrl")) && !ogImageUrl) {
    return {
      status: "error",
      message: "Open Graph image URL must be a valid absolute URL.",
      recordKey,
    };
  }

  const title = normalizeOptionalString(readString(formData.get("title")));
  const description = normalizeOptionalString(readString(formData.get("description")));
  const ogTitle = normalizeOptionalString(readString(formData.get("ogTitle")));
  const ogDescription = normalizeOptionalString(readString(formData.get("ogDescription")));
  const robotsIndex = formData.get("robotsIndex") === "on";

  await saveSeoSetting({
    entityType,
    entityKey,
    title,
    description,
    canonicalUrl,
    robotsIndex,
    ogTitle,
    ogDescription,
    ogImageUrl,
  });

  revalidatePath(path);
  revalidatePath("/admin/seo");
  if (path === "/") {
    revalidatePath("/", "layout");
  }

  return {
    status: "success",
    message: `SEO settings saved for ${label}.`,
    recordKey,
    savedFields: {
      title: title || "",
      description: description || "",
      canonicalUrl: canonicalUrl || "",
      robotsIndex,
      ogTitle: ogTitle || "",
      ogDescription: ogDescription || "",
      ogImageUrl: ogImageUrl || "",
    },
  };
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: string) {
  return value ? value : null;
}

function normalizeOptionalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return normalizePublicUrl(parsed.toString());
  } catch {
    return null;
  }
}
