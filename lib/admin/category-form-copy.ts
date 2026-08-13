import type { ProductCategory } from "@/types/domain";

/**
 * Category-aware copy and requirements for the admin product form.
 *
 * Every category shares the same database columns; what changes per category is
 * the language around them, the defaults we pre-fill, which extra structured
 * fields are collected, and which fields are required before publishing.
 *
 * Rugs and vintage currently use the baseline copy, which is a byte-for-byte
 * reproduction of the strings that were hardcoded in the form and in product
 * validation before this config existed. Poufs, pillows, and decor have
 * override entries; any other category can be extended the same way without
 * touching the form or the validator.
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

export const productDecorSubtypeOptions = [
  { value: "decor", label: "Decor — sold on what it is, not on age" },
  { value: "antique", label: "Antique — sold as an older piece" },
] as const;

export const cutFromOneRugUniquenessTier = "Cut from one rug";
export const trueOneOffUniquenessTier = "True one-off";
export const antiqueDecorSubtype = "antique";

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
  | "sourceCoverCount"
  | "insertIncluded"
  | "decorSubtype"
  | "objectType"
  | "makerMarksNote"
  | "heightCm"
  /** Defaults only — the inventory input has a fixed label in the form. */
  | "inventory";

/** Structured fields that only some categories collect. */
export type CategoryExtraFieldKey =
  | "faceFabricSource"
  | "uniquenessTier"
  | "insertIncluded"
  | "decorSubtype"
  | "objectType"
  | "makerMarksNote"
  | "heightCm";

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

/**
 * Free-text fields a category can require only under a condition. Kept narrow
 * on purpose: every key here must exist on every product, hold a string, and be
 * satisfied by any non-empty answer.
 */
export type ConditionalRequirementFieldKey = "ageBasis" | "objectType" | "makerMarksNote";

/**
 * Fields whose stored value can switch a conditional requirement on. Same
 * constraint: present on every product and string-valued.
 */
export type ConditionalRequirementTriggerKey =
  | "decorSubtype"
  | "ageClass"
  | "attributionConfidence"
  | "uniquenessTier";

/**
 * "Require X only when Y on the same record equals Z." Used for requirements
 * that depend on another answer rather than on the category alone — decor
 * requires maker's marks only once the piece is being sold as an antique.
 */
export type CategoryConditionalRequirement = {
  field: ConditionalRequirementFieldKey;
  whenField: ConditionalRequirementTriggerKey;
  equals: string;
};

export type CategoryFormCopy = {
  labels: Partial<Record<CategoryCopyFieldKey, string>>;
  placeholders: Partial<Record<CategoryCopyFieldKey, string>>;
  helpText: Partial<Record<CategoryCopyFieldKey, string>>;
  fieldDefaults: Partial<Record<CategoryCopyFieldKey, string>>;
  /** Extra required fields on top of `baselineRequiredAtPublish`. */
  requiredAtPublish: readonly PublishRequirementKey[];
  /** Requirements that only bind when another field holds a given value. */
  conditionalRequiredAtPublish: readonly CategoryConditionalRequirement[];
  /** Extra structured fields this category renders and stores. */
  extraFields: readonly CategoryExtraFieldKey[];
  /**
   * Publish-time price floor in USD. Drafts may sit below it; active and sold
   * listings may not. Undefined means the category has no floor.
   */
  minimumPriceUsdAtPublish?: number;
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
  conditionalRequiredAtPublish: [],
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
  conditionalRequiredAtPublish: [],
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

const pillowCategoryFormCopy: CategoryFormCopy = {
  labels: {
    ...baselineCategoryFormCopy.labels,
    sourcingNote: "Making note",
    uniquenessTier: "How unique is this cover",
    sourceCoverCount: "Covers cut from that rug",
    insertIncluded: "Insert included",
  },
  placeholders: {
    ...baselineCategoryFormCopy.placeholders,
    origin: "Made in Morocco — family-made",
    ageBasis: "Newly made — my mom cut and sewed this cover recently…",
    conditionNote:
      "Record seam quality, zipper or closure action, pile-face wear or thinning, and any marks — and say where each one appears.",
    attributionRegion:
      "Where the source fabric was bought (e.g. Marrakech) — leave empty unless meaningful.",
    provenanceNote:
      "Designed and hand-sewn by my mom — cut, matched, and seamed by her hand. The [fabric] panel was purchased in [place]; original weaver not recorded.",
    sourcingNote:
      "How your mom made this cover and where the fabric came from; sign — Riad.",
  },
  helpText: {
    ...baselineCategoryFormCopy.helpText,
    conditionNote:
      "Required to publish. Describe the seams, the zipper action, the pile face, and any marks on this cover. Do not use generic handmade-variation copy.",
    attributionRegion:
      "Only when meaningful (e.g. the panel was bought in Marrakech); leave empty otherwise.",
    attributionConfidence: "Mom-made items are always Verified.",
    uniquenessTier: "Say plainly whether this design can be made again. Required to publish.",
    sourceCoverCount: "How many covers exist from that one rug, including this one.",
    insertIncluded:
      "Tick only when a pillow insert ships with the cover. Most covers ship cover-only.",
  },
  fieldDefaults: {
    origin: "Made in Morocco — family-made",
    ageClass: "Contemporary",
    attributionConfidence: "Verified",
  },
  requiredAtPublish: ["dimensionsCm", "weightKg", "uniquenessTier"],
  conditionalRequiredAtPublish: [],
  extraFields: ["uniquenessTier", "insertIncluded"],
  minimumPriceUsdAtPublish: 30,
  publishErrors: {
    provenanceNote: "Explain how this cover was made before publishing.",
    sourcingNote: "Add a first-person making note before publishing.",
    dimensionsCmLength: "Add the finished cover length before publishing a pillow.",
    dimensionsCmWidth: "Add the finished cover width before publishing a pillow.",
    weightKg: "Add the shipping weight before publishing a pillow.",
    uniquenessTier: "Say whether this cover can be repeated before publishing.",
    sourceCoverCount: "Record how many covers were cut from that rug before publishing.",
    priceUsd: "Pillow covers publish at $30 or more. Raise the price or keep this a draft.",
  },
};

/**
 * Decor and antiques are genuinely sourced one-of-each objects, so the shared
 * provenance fields are the right shape here; what changes is the vocabulary
 * (objects, not rugs), an honest "Not Stated" age route, and the decor/antique
 * split that governs the catalog prefix and the maker's-marks requirement.
 */
const decorCategoryFormCopy: CategoryFormCopy = {
  labels: {
    ...baselineCategoryFormCopy.labels,
    attributionRegion: "Origin / attribution",
    decorSubtype: "Decor or antique",
    objectType: "Object type",
    makerMarksNote: "Maker's marks and signatures",
    heightCm: "Height (cm)",
  },
  placeholders: {
    ...baselineCategoryFormCopy.placeholders,
    ageBasis:
      "Say what the age rests on — or why it cannot be verified: no marks, no records, sold to me without history.",
    conditionNote:
      "Record chips, cracks, repairs, patina, missing parts, and base marks, and say where each one appears.",
    attributionRegion: "Fez, Safi pottery, non-Moroccan brasswork, unknown workshop…",
    provenanceNote: "Where and how I acquired it; what marks or records support the label.",
    objectType: "Pottery, brass tray, wood carving, textile fragment…",
    makerMarksNote:
      "Describe any stamp, signature, or workshop mark — or write plainly that none were found.",
  },
  helpText: {
    ...baselineCategoryFormCopy.helpText,
    origin:
      "Honest origin per provenance label; “Origin not verified — acquired in Morocco” is an acceptable honest answer.",
    conditionNote:
      "Required to publish. Describe the object's own wear — chips, cracks, repairs, patina, missing parts. Do not use generic handmade-variation copy.",
    ageClass:
      "Choose Not Stated when the age genuinely cannot be verified, and explain why below. Never assert an estimate you cannot support.",
    ageBasis: "Required unless the age class is Contemporary.",
    attributionRegion:
      "Where the piece is from or which workshop tradition it belongs to; say plainly when it is unknown or not Moroccan.",
    objectType: "What kind of object this is. Optional, but it sharpens search and card copy.",
    makerMarksNote:
      "Required to publish an antique. “No maker's marks found” is a complete answer.",
    heightCm: "Objects are three-dimensional; record height alongside length and width.",
  },
  fieldDefaults: {
    // Decor and antiques are one-of-each pieces sold through the multi-unit
    // model, so the stock count starts at the only honest number.
    inventory: "1",
  },
  requiredAtPublish: [],
  conditionalRequiredAtPublish: [
    { field: "makerMarksNote", whenField: "decorSubtype", equals: antiqueDecorSubtype },
  ],
  extraFields: ["decorSubtype", "objectType", "makerMarksNote", "heightCm"],
  publishErrors: {
    conditionNote: "Record this object's chips, cracks, repairs, or patina before publishing.",
    provenanceNote: "Explain where and how you acquired this piece before publishing.",
    ageBasis:
      "Explain the age estimate — or explain why the age cannot be verified — before publishing.",
    makerMarksNote:
      "Record the maker's marks, or state that none were found, before publishing an antique.",
  },
};

const categoryFormCopy: Record<ProductCategory, CategoryFormCopy> = {
  rugs: baselineCategoryFormCopy,
  vintage: baselineCategoryFormCopy,
  poufs: poufCategoryFormCopy,
  pillows: pillowCategoryFormCopy,
  decor: decorCategoryFormCopy,
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

export function getConditionalPublishRequirements(
  category: string,
): readonly CategoryConditionalRequirement[] {
  return getCategoryFormCopy(category).conditionalRequiredAtPublish;
}

export function getMinimumPublishPriceUsd(category: string) {
  return getCategoryFormCopy(category).minimumPriceUsdAtPublish;
}

export function getPublishErrorMessage(category: string, field: string, fallback: string) {
  return getCategoryFormCopy(category).publishErrors[field] ?? fallback;
}
