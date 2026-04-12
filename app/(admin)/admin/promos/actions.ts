"use server";

import { revalidatePath } from "next/cache";

import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { createPromoRepository } from "@/lib/db/repositories/promo-repository";

export type AdminPromoActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialAdminPromoActionState: AdminPromoActionState = { status: "idle", message: null };

export async function createAdminPromoAction(
  _previous: AdminPromoActionState,
  formData: FormData,
): Promise<AdminPromoActionState> {
  const permission = await requireAdminRoleForMutation();
  if (permission.status !== "allowed") {
    return { status: "error", message: "An admin role is required before promos can be saved." };
  }

  const code = readString(formData.get("code")).toUpperCase();
  const type = readString(formData.get("type")) === "fixed" ? "fixed" : "percent";
  const amount = Number(readString(formData.get("amount")) || "0");
  const minimumSubtotalUsd = normalizeNumber(readString(formData.get("minimumSubtotalUsd")));
  const usageLimit = normalizeInteger(readString(formData.get("usageLimit")));
  const startsAt = normalizeDate(readString(formData.get("startsAt")));
  const endsAt = normalizeDate(readString(formData.get("endsAt")));
  const scopeType = normalizeScopeType(readString(formData.get("scopeType")));
  const scopeCategory = readString(formData.get("scopeCategory")) || null;
  const scopeProductIds = readString(formData.get("scopeProductIds"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const notes = readString(formData.get("notes")) || null;

  if (!code || amount <= 0) {
    return { status: "error", message: "Promo code and amount are required." };
  }

  try {
    await createPromoRepository().create({
      code,
      type,
      amount,
      active: true,
      startsAt,
      endsAt,
      usageLimit,
      minimumSubtotalUsd,
      scopeType,
      scopeCategory,
      scopeProductIds,
      notes,
    });
  } catch {
    return { status: "error", message: "Promo code could not be saved. Use a unique code and valid values." };
  }

  revalidatePath('/admin/promos');
  return { status: "success", message: `${code} saved.` };
}

export async function toggleAdminPromoAction(formData: FormData) {
  const permission = await requireAdminRoleForMutation();
  if (permission.status !== "allowed") {
    return;
  }

  const promoId = readString(formData.get('promoId'));
  const active = readString(formData.get('active')) === 'true';
  if (!promoId) {
    return;
  }

  await createPromoRepository().toggleActive(promoId, active);
  revalidatePath('/admin/promos');
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}
function normalizeNumber(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function normalizeInteger(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function normalizeDate(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function normalizeScopeType(value: string): "all" | "category" | "product" {
  return value === 'category' || value === 'product' ? value : 'all';
}
