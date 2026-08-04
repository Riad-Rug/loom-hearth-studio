import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HOMEPAGE_CONTENT_KEY = "homepage";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

// The exact copy that `normalizeHomepageCopyAudit` (lib/homepage/content.ts) and the
// view-level hardcoded constants (features/home/home-page-view.tsx) have been silently
// forcing onto every page load. This is what is ACTUALLY live today. This script writes
// those same values directly into the database row so the override can be deleted without
// changing what visitors see.
const overrides = {
  pageSeo: {
    title: "Loom & Hearth | Handmade Moroccan Rugs",
    description:
      "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
  },
  hero: {
    title: "Woven by hand in Morocco. Warm underfoot in your home.",
    eyebrow: "DIRECT FROM CASABLANCA",
    paragraph:
      "Rugs, poufs, pillows and antiques — one of each, found and shipped by one person in Casablanca. You approve daylight photos of your exact piece before payment.",
    primaryCtaLabel: "Shop rugs",
    secondaryCtaLabel: "Shop everything",
    secondaryCtaHref: "/shop",
    seoTitle: "Loom & Hearth | Handmade Moroccan Rugs",
    seoMetaDescription:
      "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
  },
  categories: {
    eyebrow: "SHOP BY CATEGORY",
    title: "Handmade Moroccan rugs, poufs, pillows, decor, and antiques.",
    paragraph:
      "Every piece is sourced one at a time and sold as the exact item shown. Rugs lead the collection; poufs, pillows, decor and antiques follow around them.",
    // These are the categoryCardCopy "desktop" strings from home-page-view.tsx — that map
    // wins over card.description at render time today, so its text is what is really live.
    cardDescriptions: {
      "category-rugs":
        "Hand-knotted and flatwoven rugs, selected for pile density, construction, and weight underfoot.",
      "category-poufs":
        "Rug-made and leather poufs. Real seating with a quieter footprint than upholstered furniture.",
      "category-pillows": "Cactus-silk (sabra) and rug-based pillows. Flat-woven, low-shed, strong colour.",
      "category-decor":
        "Handmade Moroccan objects for shelves, consoles, and flat surfaces — brass, wood, clay.",
      "category-vintage":
        "Vintage pieces chosen for construction integrity, visible age, and honest condition — one of each, never restocked.",
    },
  },
  brandStory: {
    // aboutBridge.eyebrow (features/content-pages/content-pages-data.ts) — reused for the
    // homepage story-section eyebrow today, independent of content.brandStory.
    eyebrow: "How we source",
    title: "This shop carries on my grandfather's bazaar.",
    paragraph:
      "My grandfather traded rugs from a bazaar in Marrakech. The bazaar was sold after he passed; the trade wasn't. I source across Morocco myself — every piece checked in person for construction, fibre, and condition before it enters the stockroom.",
    linkLabel: "Read the story",
    href: "/about",
  },
  newsletter: {
    eyebrow: "JOIN THE LIST",
    title: "New arrivals, sourcing stories, and first access to pieces before wider release.",
    paragraph:
      "New rugs, poufs, pillows and antiques land in small batches. The list sees them first — many pieces go before wider release.",
    inputPlaceholder: "your@email.com",
    ctaLabel: "JOIN",
  },
  footer: {
    introBody:
      "One of each, sold direct from Casablanca — every piece photographed individually and approved in daylight before payment.",
    introMeta: "Prices in USD. Free shipping over $150 to the US, Canada, and Australia.",
  },
};

function applyOverrides(current) {
  const next = structuredClone(current && typeof current === "object" ? current : {});

  next.pageSeo = { ...next.pageSeo, ...overrides.pageSeo };

  next.hero = {
    ...next.hero,
    title: overrides.hero.title,
    eyebrow: overrides.hero.eyebrow,
    paragraph: overrides.hero.paragraph,
    primaryCta: { ...next.hero?.primaryCta, label: overrides.hero.primaryCtaLabel },
    secondaryCta: {
      ...next.hero?.secondaryCta,
      label: overrides.hero.secondaryCtaLabel,
      href: overrides.hero.secondaryCtaHref,
    },
    seo: {
      ...next.hero?.seo,
      seoTitle: overrides.hero.seoTitle,
      metaDescription: overrides.hero.seoMetaDescription,
    },
  };

  const cards = Array.isArray(next.categories?.cards) ? next.categories.cards : [];
  next.categories = {
    ...next.categories,
    eyebrow: overrides.categories.eyebrow,
    title: overrides.categories.title,
    paragraph: overrides.categories.paragraph,
    cards: cards.map((card) => {
      const description = overrides.categories.cardDescriptions[card?.id];
      return description ? { ...card, description } : card;
    }),
  };

  next.brandStory = { ...next.brandStory, ...overrides.brandStory };

  next.newsletter = {
    ...next.newsletter,
    eyebrow: overrides.newsletter.eyebrow,
    title: overrides.newsletter.title,
    paragraph: overrides.newsletter.paragraph,
    inputPlaceholder: overrides.newsletter.inputPlaceholder,
    ctaLabel: overrides.newsletter.ctaLabel,
  };

  next.footer = {
    ...next.footer,
    introBody: overrides.footer.introBody,
    introMeta: overrides.footer.introMeta,
  };

  return next;
}

function diffTopLevel(before, after) {
  const lines = [];
  const keys = ["pageSeo", "hero", "categories", "brandStory", "newsletter", "footer"];

  for (const key of keys) {
    const beforeJson = JSON.stringify(before?.[key] ?? null);
    const afterJson = JSON.stringify(after?.[key] ?? null);

    if (beforeJson !== afterJson) {
      lines.push(`  ${key}:`);
      lines.push(`    before: ${beforeJson}`);
      lines.push(`    after:  ${afterJson}`);
    }
  }

  return lines.join("\n");
}

async function loadDotEnvFile(fileName) {
  const envPath = path.resolve(repoRoot, fileName);
  const envText = await readFile(envPath, "utf8");

  for (const rawLine of envText.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    process.env[key] = value.replace(/^['"]|['"]$/gu, "");
  }
}

function assertNeonDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const parsedUrl = new URL(databaseUrl);

  if (!parsedUrl.hostname.endsWith(".neon.tech")) {
    throw new Error(`Refusing to run against unexpected host: ${parsedUrl.hostname}`);
  }
}

function redactDatabaseUrl(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);

  if (parsedUrl.password) {
    parsedUrl.password = "***";
  }

  return parsedUrl.toString();
}

async function main() {
  const apply = process.argv.includes("--apply");

  await loadDotEnvFile(".env.backup.shared-neon");
  assertNeonDatabaseUrl(process.env.DATABASE_URL);

  const record = await prisma.homepageContentRecord.findUnique({
    where: { key: HOMEPAGE_CONTENT_KEY },
  });

  if (!record) {
    throw new Error(`No homepageContentRecord row found for key "${HOMEPAGE_CONTENT_KEY}".`);
  }

  const backupDir = path.resolve(repoRoot, "docs");
  const backupPath = path.join(
    backupDir,
    `backup-homepage-content-${new Date().toISOString().replace(/[:.]/gu, "-")}.json`,
  );

  await mkdir(backupDir, { recursive: true });
  await writeFile(backupPath, JSON.stringify(record, null, 2), "utf8");

  const nextContent = applyOverrides(record.content);
  const diff = diffTopLevel(record.content, nextContent);

  console.log(
    JSON.stringify(
      {
        status: apply ? "applying" : "dry-run",
        databaseUrl: redactDatabaseUrl(process.env.DATABASE_URL),
        currentUpdatedAt: record.updatedAt,
        backupWrittenTo: path.relative(repoRoot, backupPath),
      },
      null,
      2,
    ),
  );
  console.log("\nField changes:\n" + (diff || "  (no differences — already backfilled)"));

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these changes to the database.");
    return;
  }

  if (!diff) {
    console.log("\nNothing to apply.");
    return;
  }

  const updated = await prisma.homepageContentRecord.update({
    where: { key: HOMEPAGE_CONTENT_KEY },
    data: { content: nextContent },
  });

  console.log(`\nApplied. New updatedAt: ${updated.updatedAt.toISOString()}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
