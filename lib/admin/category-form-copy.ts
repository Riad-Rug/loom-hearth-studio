import type { ProductCategory } from "@/types/domain";

/**
 * Category-aware copy and requirements for the admin product form.
 *
 * Every category shares the same database columns; what changes per category is
 * the language around them, the defaults we pre-fill, which extra structured
 * fields are collected, and which fields are required before publishing.
 *
 * Rugs, vintage, pillows, and decor currently use the baseline copy, which is a
 * byte-for-byte reproduction of the strings that were hardcoded in the form and
 * in product validation before this config existed. Poufs are the first
 * category with an override entry; pillows and decor can be extended the same
 * way without touching the form or the validator.
 */

export const productFaceFabricSourceOptions = [
  "Hand-knotted pile",
  "Flatweave",
  "Vintage rug cut",
  "New fabric",
] as const;

export const productUniquenessTierOptions = [
  "True one-off",
  "Mom can repeat this design",
  "Cut from one rug",
] as const;

export const cutFromOneRugUniquenessTier = "Cut from one rug";
export const trueOneOffUniquenessTier = "True one-off";

export type CategoryCopyFieldKey =
  | "origin"
  | "ageClass"
  | "ageBasis"
  | "conditionNote"
  | "attributionRegion"
  | "attributionConfidence"
  | "provenanceNote"
  | "sourcingNote"
  | "faceFabricSource"
  | "uniquenessTier"
  | "sourceCoverCount";

/** Structured fields that only some categories collect. */
export type CategoryExtraFieldKey = "faceFabricSource" | "uniquenessTier";

/**
 * Keys the publish-time gate understands. `dimensionsCm` covers length + width;
 * every other key maps to a single input.
 */
export type PublishRequirementKey =
  | "catalogNumber"
  | "conditionNote"
  | "ageClass"
  | "attributionConfidence"
  | "provenanceNote"
  | "sourcingNote"
  | "dimensionsCm"
  | "weightKg"
  | "faceFabricSource"
  | "uniquenessTier";

export type CategoryFormCopy = {
  labels: Partial<Record<CategoryCopyFieldKey, string>>;
  placeholders: Partial<Record<CategoryCopyFieldKey, string>>;
  helpText: Partial<Record<CategoryCopyFieldKey, string>>;
  fieldDefaults: Partial<Record<CategoryCopyFieldKey, string>>;
  /** Extra required fields on top of `baselineRequiredAtPublish`. */
  requiredAtPublish: readonly PublishRequirementKey[];
  /** Extra structured fields this category renders and stores. */
  extraFields: readonly CategoryExtraFieldKey[];
  /** Overrides for publish-gate error messages, keyed by field error key. */
  publishErrors: Partial<Record<string, string>>;
};

/** Required before publishing for every category, regardless of copy. */
export const baselineRequiredAtPublish = [
  "catalogNumber",
  "conditionNote",
  "ageClass",
  "attributionConfidence",
  "provenanceNote",
  "sourcingNote",
] as const satisfies readonly PublishRequirementKey[];

const baselineCategoryFormCopy: CategoryFormCopy = {
  labels: {
    origin: "Origin",
    ageClass: "Age class",
    ageBasis: "Age estimate basis",
    conditionNote: "Piece-specific condition",
    attributionRegion: "Attribution region",
    attributionConfidence: "Provenance label",
    provenanceNote: "Provenance basis",
    sourcingNote: "Sourcing note",
  },
  placeholders: {
    ageBasis: "What construction, wear, record, or maker information supports the estimate?",
    conditionNote:
      "Record wear, repairs, marks, pile variance, seams, chips, or cracks and where they appear.",
    attributionRegion: "High Atlas, Taznakht, Marrakech…",
    provenanceNote: "Explain why the label is Verified, Attributed, or Not Stated.",
    sourcingNote: "Write 2–4 factual first-person lines and sign — Riad.",
  },
  helpText: {
    conditionNote: "Required to publish. Do not use generic handmade-variation copy.",
  },
  fieldDefaults: {},
  requiredAtPublish: [],
  extraFields: [],
  publishErrors: {},
};

const poufCategoryFormCopy: CategoryFormCopy = {
  labels: {
    ...baselineCategoryFormCopy.labels,
    attributionRegion: "Fabric source",
    provenanceNote: "Making basis",
    sourcingNote: "Making note",
    faceFabricSource: "Face fabric source",
    uniquenessTier: "How unique is this pouf",
    sourceCoverCount: "Covers cut from that rug",
  },
  placeholders: {
    ...baselineCategoryFormCopy.placeholders,
    origin: "Made in Morocco — family-made",
    ageBasis: "Newly made — my mom cut and sewed this cover recently…",
    conditionNote:
      "Record seam quality, zip or closure condition, pile-face wear or thinning, colour variance between panels, and where each one appears.",
    attributionRegion: "Marrakech pile market, Taznakht flatweave…",
    provenanceNote:
      "Designed and hand-sewn by my mom — cut, matched, and seamed by her hand. The [fabric] panel was purchased in [place]; original weaver not recorded.",
    sourcingNote:
      "My mom designs and sews every pouf herself: she cuts the panels, matches the faces, and closes the seams. The pile fabric comes from Marrakech; the making happens in the family. The cover ships flat and you fill it your side. — Riad",
  },
  helpText: {
    ...baselineCategoryFormCopy.helpText,
    conditionNote:
      "Required to publish. Describe the seams, the closure, and the pile face on this cover. Do not use generic handmade-variation copy.",
    attributionRegion:
      "Only when meaningful (e.g. pile bought in Marrakech); leave empty otherwise.",
    attributionConfidence: "Mom-made items are always Verified.",
    faceFabricSource: "What the face panels were cut from. Required to publish.",
    uniquenessTier: "Say plainly whether this design can be made again. Required to publish.",
    sourceCoverCount: "How many covers exist from that one rug, including this one.",
  },
  fieldDefaults: {
    origin: "Made in Morocco — family-made",
    ageClass: "Contemporary",
    attributionConfidence: "Verified",
  },
  requiredAtPublish: ["dimensionsCm", "weightKg", "faceFabricSource", "uniquenessTier"],
  extraFields: ["faceFabricSource", "uniquenessTier"],
  publishErrors: {
    provenanceNote: "Explain how this pouf was made before publishing.",
    sourcingNote: "Add a first-person making note before publishing.",
    dimensionsCmLength: "Add the finished cover length before publishing a pouf.",
    dimensionsCmWidth: "Add the finished cover width before publishing a pouf.",
    weightKg: "Add the shipping weight before publishing a pouf.",
    faceFabricSource: "Choose what the face fabric was cut from before publishing.",
    uniquenessTier: "Say whether this pouf can be repeated before publishing.",
  },
};

const categoryFormCopy: Record<ProductCategory, CategoryFormCopy> = {
  rugs: baselineCategoryFormCopy,
  vintage: baselineCategoryFormCopy,
  poufs: poufCategoryFormCopy,
  pillows: baselineCategoryFormCopy,
  decor: baselineCategoryFormCopy,
};

export function getCategoryFormCopy(category: string): CategoryFormCopy {
  return categoryFormCopy[category as ProductCategory] ?? baselineCategoryFormCopy;
}

export function getCategoryFieldLabel(category: string, field: CategoryCopyFieldKey) {
  return (
    getCategoryFormCopy(category).labels[field] ??
    baselineCategoryFormCopy.labels[field] ??
    field
  );
}

export function categoryUsesField(category: string, field: CategoryExtraFieldKey) {
  return getCategoryFormCopy(category).extraFields.includes(field);
}

export function getPublishRequirements(category: string): ReadonlySet<PublishRequirementKey> {
  return new Set<PublishRequirementKey>([
    ...baselineRequiredAtPublish,
    ...getCategoryFormCopy(category).requiredAtPublish,
  ]);
}

export function getPublishErrorMessage(category: string, field: string, fallback: string) {
  return getCategoryFormCopy(category).publishErrors[field] ?? fallback;
}
