import type { AdminModuleKey } from "@/features/admin/admin-data";

export type AdminModuleCardViewModel = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  lines: string[];
};

export function createAdminModuleCardViewModels(input: {
  moduleKey: AdminModuleKey;
  cards: ReadonlyArray<{
    title: string;
    body: string;
    lines?: string[];
  }>;
}): AdminModuleCardViewModel[] {
  const moduleLabel =
    input.moduleKey === "dashboard"
      ? "Dashboard"
      : input.moduleKey.charAt(0).toUpperCase() + input.moduleKey.slice(1);

  return input.cards.map((card, index) => ({
    id: `${input.moduleKey}-${index + 1}`,
    eyebrow: `${moduleLabel} card ${index + 1}`,
    title: card.title,
    body: card.body,
    lines: card.lines ?? [],
  }));
}
