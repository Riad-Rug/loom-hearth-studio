import { normalizeDimensionSeparators } from "@/lib/catalog/product-card-name";

export type ProductTitleParts = {
  /** The title up to its first run of dimensions. */
  name: string;
  /** The title from that run to the end, e.g. `6'5" × 4'2"`. */
  size?: string;
  /** Each measure in the run, e.g. `['24"', '24"', '14"']`. */
  measures: string[];
  /** The third measure, when it carries a unit or inch mark. */
  height?: string;
};

const number = String.raw`\d{1,3}(?:\.\d+)?`;
const unit = String.raw`(?:inches|inch|in|cm|feet|ft)(?![a-z])`;
const mark = String.raw`["”″]`;
const measure = String.raw`(?:${number}'(?:\s*\d{1,2}(?:\.\d+)?${mark}?)?|${number}(?:\s*${unit}|${mark})?)`;
const separator = String.raw`\s*(?:x|×|by)\s*`;
const dimensionRunPattern = new RegExp(
  String.raw`(?<![\w.'])${measure}(?:${separator}${measure}){1,2}(?![\d.])`,
  "iu",
);
const measurePattern = new RegExp(measure, "giu");
const unitOrMarkAtEndPattern = new RegExp(String.raw`(?:${mark}|${unit})$`, "iu");

export function parseProductTitle(title: string): ProductTitleParts {
  const normalizedTitle = normalizeDimensionSeparators(title).trim();
  const run = dimensionRunPattern.exec(normalizedTitle);

  if (!run) {
    return { name: normalizedTitle, measures: [] };
  }

  const measures = run[0].match(measurePattern) ?? [];
  const thirdMeasure = measures.length === 3 ? measures[2] : undefined;
  const height = thirdMeasure && unitOrMarkAtEndPattern.test(thirdMeasure) ? thirdMeasure : undefined;
  const name = normalizedTitle.slice(0, run.index).replace(/[\s,:;(–—-]+$/u, "");

  if (!name) {
    return { name: normalizedTitle, measures, height };
  }

  return { name, size: normalizedTitle.slice(run.index), measures, height };
}
