import { createPromoRepository } from "@/lib/db/repositories/promo-repository";

export type AdminPromoRecord = {
  id: string;
  code: string;
  active: boolean;
  typeLabel: string;
  amountLabel: string;
  minimumSubtotalLabel: string;
  scopeLabel: string;
  usageLabel: string;
  notes: string;
};

export type AdminPromosPageData = {
  summary: { label: string; value: string; detail: string }[];
  promos: AdminPromoRecord[];
};

export async function getAdminPromosPageData(): Promise<AdminPromosPageData> {
  const promos = await createPromoRepository().list();
  const activeCount = promos.filter((promo) => promo.active).length;

  return {
    summary: [
      { label: "Total promos", value: formatInteger(promos.length), detail: promos.length ? "Saved promo definitions" : "No promos yet" },
      { label: "Active promos", value: formatInteger(activeCount), detail: activeCount ? "Available to checkout" : "Nothing active yet" },
      { label: "Inactive promos", value: formatInteger(promos.length - activeCount), detail: promos.length - activeCount ? "Paused or archived" : "No paused promos" },
    ],
    promos: promos.map((promo) => ({
      id: promo.id,
      code: promo.code,
      active: promo.active,
      typeLabel: promo.type === "percent" ? "Percent" : "Fixed amount",
      amountLabel: promo.type === "percent" ? `${Number(promo.amount)}%` : formatUsd(Number(promo.amount)),
      minimumSubtotalLabel: promo.minimumSubtotalUsd !== null ? formatUsd(Number(promo.minimumSubtotalUsd)) : "None",
      scopeLabel: promo.scopeType === "all" ? "All products" : promo.scopeType === "category" ? `Category: ${promo.scopeCategory}` : "Selected products",
      usageLabel: promo.usageLimit !== null ? `${promo.usageCount}/${promo.usageLimit}` : `${promo.usageCount} used`,
      notes: promo.notes ?? "",
    })),
  };
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
