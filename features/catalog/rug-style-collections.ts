export const rugStyleCollections = {
  "beni-ourain": {
    title: "Beni Ourain Rugs",
    description:
      "Browse Beni Ourain rugs selected for hand-knotted wool construction, pale fields, and restrained geometric pattern. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with visible construction notes",
      "One-of-one pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  vintage: {
    title: "Vintage Moroccan Rugs",
    description:
      "Browse vintage Moroccan rugs selected for structure, patina, and exact-piece character. These are collected pieces, not repeatable stock.",
    bullets: [
      "One-of-one vintage rugs with condition notes",
      "Selected for structural integrity, not age alone",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "vintage",
  },
} as const;

export type RugStyleCollectionSlug = keyof typeof rugStyleCollections;

export function getRugStyleCollection(slug: string) {
  return rugStyleCollections[slug as RugStyleCollectionSlug] ?? null;
}
