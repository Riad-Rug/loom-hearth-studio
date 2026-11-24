import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fills the new rug Type / Pile height / Region fields on rugs that don't have
// them yet, from what each rug already says: its legacy rugStyle, its
// attributionRegion, and its title. It only fills empty fields, never
// overwrites one set in the admin. A rug still filed as "Unclassified" also
// gets a real rugStyle (its URL segment) derived from Type/Region, the same way
// the admin does (lib/catalog/rug-taxonomy.ts -> deriveLegacyRugStyle); the old
// URL 301s to the new one.
//
//   node scripts/backfill-rug-type-region.mjs           # dry run, no writes
//   node scripts/backfill-rug-type-region.mjs --apply   # write the proposals
//
// Rows it cannot classify are listed under "needsManual" and show up in the
// admin under "Type/Region not set".

const applyChanges = process.argv.includes("--apply");

// Confirmed by hand; these win over anything guessed.
const confirmed = {
  "LH-R-0012": { rugType: "pile", pileHeight: "high", regionId: "region_middle_atlas" },
  "LH-R-0013": { rugType: "pile", pileHeight: "medium", regionId: "region_taznakht" },
};

const typeByLegacyStyle = {
  "flatweave (hanbel)": "flatweave",
  "mixed technique": "mixed",
  boucherouite: "boucherouite",
};

// Legacy style collections that are places map straight onto a region.
const regionByLegacyStyle = {
  azilal: "region_azilal",
  "beni ourain": "region_beni_ourain",
  "beni m'guild": "region_beni_mguild",
  zemmour: "region_zemmour",
  boujad: "region_bejaad",
};

// Checked in order against attributionRegion, then the title; most specific first.
const regionKeywords = [
  // Titles spell it "Aït Ouagharda"; the region is "Ait Ougharda".
  [/ou?a?gharda/iu, "region_ait_ougharda"],
  [/glaou(?:i|a)/iu, "region_glaoui"],
  [/taznakht/iu, "region_taznakht"],
  [/tiflet/iu, "region_tiflet"],
  [/kh[eé]misset/iu, "region_khemisset"],
  [/azilal/iu, "region_azilal"],
  [/beni\s*ourain/iu, "region_beni_ourain"],
  [/beni\s*m'?\s*guild/iu, "region_beni_mguild"],
  [/zemmour/iu, "region_zemmour"],
  [/boujad|beja[aâ]d/iu, "region_bejaad"],
  [/middle\s*atlas/iu, "region_middle_atlas"],
  [/high\s*atlas/iu, "region_high_atlas"],
];

// Same rules as deriveLegacyRugStyle in lib/catalog/rug-taxonomy.ts.
const legacyStyleByType = { flatweave: "Flatweave (Hanbel)", mixed: "Mixed technique", boucherouite: "Boucherouite" };
const legacyStyleByRegionSlug = {
  azilal: "Azilal",
  "beni-ourain": "Beni Ourain",
  "beni-m-guild": "Beni M'Guild",
  boujad: "Boujad",
  zemmour: "Zemmour",
};

function typeFromTitle(rug) {
  const text = `${rug.name} ${rug.attributionRegion ?? ""}`;

  if (/boucherouite|boucharouette/iu.test(text)) return "boucherouite";
  if (/mixed|three[-\s]technique|pile\s+motifs?/iu.test(text)) return "mixed";
  if (/hanbel|flat\s*-?weave|kilim/iu.test(text)) return "flatweave";
  if (/pile|knotted|shag/iu.test(text)) return "pile";

  return undefined;
}

function guessType(rug) {
  const fromStyle = typeByLegacyStyle[rug.rugStyle?.trim().toLowerCase() ?? ""];
  const fromTitle = typeFromTitle(rug);

  if (fromStyle) {
    // The stored style wins, but a title that says otherwise is flagged.
    return { value: fromStyle, source: "rugStyle", conflict: fromTitle && fromTitle !== fromStyle ? fromTitle : undefined };
  }

  if (fromTitle) return { value: fromTitle, source: "title" };

  // Beni Ourain, Beni M'Guild and Azilal rugs are pile rugs by definition.
  if (/^(beni ourain|beni m'guild|azilal)$/iu.test(rug.rugStyle ?? "")) return { value: "pile", source: "rugStyle" };

  return undefined;
}

function guessPileHeight(rug) {
  const text = `${rug.name} ${rug.description ?? ""}`;

  if (/high[-\s]pile|thick\s+pile|deep\s+pile|shag/iu.test(text)) return "high";
  if (/(?:low|short|medium)[-\s]pile|dense\s+pile/iu.test(text)) return "medium";

  return undefined;
}

function guessRegion(rug) {
  // A named place (Tiflet, Glaoui) is more specific than the style collection
  // the rug was filed under (Zemmour), so it is checked first.
  for (const [field, text] of [["attributionRegion", rug.attributionRegion ?? ""], ["title", rug.name]]) {
    const match = regionKeywords.find(([pattern]) => pattern.test(text));

    if (match) {
      return { value: match[1], source: field };
    }
  }

  const fromStyle = regionByLegacyStyle[rug.rugStyle?.trim().toLowerCase() ?? ""];

  return fromStyle ? { value: fromStyle, source: "rugStyle" } : undefined;
}

function deriveLegacyRugStyle(rugType, region) {
  if (rugType && legacyStyleByType[rugType]) return legacyStyleByType[rugType];

  return (
    (region && legacyStyleByRegionSlug[region.slug]) ||
    (region?.parent && legacyStyleByRegionSlug[region.parent.slug]) ||
    region?.parent?.name ||
    region?.name ||
    "Unclassified"
  );
}

function isUnclassified(rugStyle) {
  const style = (rugStyle ?? "").trim().toLowerCase();
  return !style || style === "unclassified";
}

function rugPath(rug, rugStyle) {
  if (rug.category === "vintage") return `/shop/vintage/${rug.slug}`;

  const segment = rugStyle
    .normalize("NFKD")
    .replace(/[̀-ͯ]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");

  return `/shop/rugs/${segment}/${rug.slug}`;
}

async function main() {
  const regions = await prisma.rugRegion.findMany({ include: { parent: true } });
  const regionById = new Map(regions.map((region) => [region.id, region]));

  const rugs = await prisma.catalogProduct.findMany({
    where: { type: "rug", OR: [{ rugType: null }, { regionId: null }, { rugStyle: "Unclassified" }] },
    select: {
      id: true,
      catalogNumber: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      status: true,
      rugStyle: true,
      attributionRegion: true,
      rugType: true,
      pileHeight: true,
      regionId: true,
    },
    orderBy: { catalogNumber: "asc" },
  });

  const changes = [];
  const needsManual = [];

  for (const rug of rugs) {
    const pinned = confirmed[rug.catalogNumber ?? ""];
    const typeGuess = rug.rugType ? undefined : pinned ? { value: pinned.rugType, source: "confirmed" } : guessType(rug);
    const rugType = rug.rugType ?? typeGuess?.value;
    const pileHeight =
      rug.pileHeight ?? (rugType === "pile" ? (pinned?.pileHeight ?? guessPileHeight(rug)) : undefined);
    const regionGuess = rug.regionId ? undefined : pinned ? { value: pinned.regionId, source: "confirmed" } : guessRegion(rug);
    const regionId = rug.regionId ?? regionGuess?.value;
    const region = regionId ? regionById.get(regionId) : undefined;

    if (regionId && !region) {
      throw new Error(`${rug.catalogNumber}: region ${regionId} does not exist; run the migration first.`);
    }

    const rugStyle = isUnclassified(rug.rugStyle) ? deriveLegacyRugStyle(rugType, region) : rug.rugStyle;
    const data = {
      ...(typeGuess ? { rugType } : {}),
      ...(pileHeight && pileHeight !== rug.pileHeight ? { pileHeight } : {}),
      ...(regionGuess ? { regionId } : {}),
      ...(rugStyle !== rug.rugStyle && !isUnclassified(rugStyle) ? { rugStyle } : {}),
    };
    const missing = [
      !rugType && "type",
      rugType === "pile" && !pileHeight && "pile height",
      !regionId && "region",
    ].filter(Boolean);

    if (Object.keys(data).length) {
      changes.push({
        id: rug.id,
        catalogNumber: rug.catalogNumber,
        status: rug.status,
        title: rug.name,
        rugType: typeGuess
          ? `${rugType} (from ${typeGuess.source})${typeGuess.conflict ? `; CHECK: title says ${typeGuess.conflict}` : ""}`
          : undefined,
        pileHeight: data.pileHeight ? `${data.pileHeight}${pinned ? " (confirmed)" : " (guessed from description; check)"}` : undefined,
        region: regionGuess ? `${region.name}${region.parent ? `, ${region.parent.name}` : ""} (from ${regionGuess.source})` : undefined,
        rugStyle: data.rugStyle ? `${rug.rugStyle} -> ${data.rugStyle}` : undefined,
        url: data.rugStyle ? `${rugPath(rug, rug.rugStyle)} -> ${rugPath(rug, data.rugStyle)}` : undefined,
        stillMissing: missing.length ? missing.join(", ") : undefined,
        data,
      });
    }

    if (missing.length || typeGuess?.conflict) {
      needsManual.push({
        catalogNumber: rug.catalogNumber,
        title: rug.name,
        ...(missing.length ? { missing: missing.join(", ") } : {}),
        ...(typeGuess?.conflict ? { check: `filed as ${rugType}, title says ${typeGuess.conflict}` } : {}),
      });
    }
  }

  if (applyChanges) {
    for (const change of changes) {
      await prisma.catalogProduct.update({ where: { id: change.id }, data: change.data });
    }
  }

  console.log(
    JSON.stringify(
      {
        status: applyChanges ? "applied" : "dry-run",
        mode: applyChanges ? "--apply" : "dry-run (no writes; pass --apply to write)",
        rugsChecked: rugs.length,
        changes: changes.map(({ id, data, ...row }) => row),
        needsManual,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
