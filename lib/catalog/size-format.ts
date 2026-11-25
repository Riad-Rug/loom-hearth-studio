/**
 * The one cm → imperial rule for every size shown on the site (specs, cards,
 * titles, admin checks): round to the nearest whole inch, then split into
 * feet and inches. 136 cm → 53.5″ → 54″ → 4'6".
 */
export function cmToInches(valueCm: number) {
  return Math.round(valueCm / 2.54);
}

/** 136 → `4'6"` */
export function formatCmAsFeetInches(valueCm: number) {
  const totalInches = cmToInches(valueCm);

  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
}

/** 45 → `18″` */
export function formatCmAsInches(valueCm: number) {
  return `${cmToInches(valueCm)}″`;
}

const feetInchesPairPattern = /(\d{1,2})['′]\s*(?:(\d{1,2})\s*(?:["″”]|''))?\s*[x×]\s*(\d{1,2})['′]\s*(?:(\d{1,2})\s*(?:["″”]|''))?/u;

/**
 * A `4'5" × 6'9"` size typed into a name that disagrees with the cm
 * dimensions under the shared rule, with the corrected text in the same
 * orientation. Undefined when the name states no feet-and-inches size or it
 * already matches.
 */
export function findMismatchedNameSize(name: string, lengthCm: number, widthCm: number) {
  const match = name.match(feetInchesPairPattern);

  if (!match || !(lengthCm > 0) || !(widthCm > 0)) {
    return undefined;
  }

  const first = Number(match[1]) * 12 + Number(match[2] ?? 0);
  const second = Number(match[3]) * 12 + Number(match[4] ?? 0);
  const length = cmToInches(lengthCm);
  const width = cmToInches(widthCm);
  // Keep the order the name uses: width-first names stay width-first.
  const widthFirst = Math.abs(first - width) + Math.abs(second - length) < Math.abs(first - length) + Math.abs(second - width);
  const [expectedFirst, expectedSecond] = widthFirst ? [width, length] : [length, width];

  if (first === expectedFirst && second === expectedSecond) {
    return undefined;
  }

  const separator = match[0].includes("×") ? " × " : " x ";
  const expected = `${formatInchesAsFeetInches(expectedFirst)}${separator}${formatInchesAsFeetInches(expectedSecond)}`;

  return { found: match[0].trim(), expected, fixedName: name.replace(match[0].trim(), expected) };
}

function formatInchesAsFeetInches(totalInches: number) {
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
}
