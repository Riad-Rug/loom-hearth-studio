import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const featuredProducts = [
  { category: "rugs", slug: "azilal-pile-rug-multicolour-wool-field-dusty-teal-blue-grey-pink", rank: 1 },
  { category: "rugs", slug: "beni", rank: 2 },
  { category: "rugs", slug: "rug-maroc-1", rank: 3 },
  { category: "vintage", slug: "desert-find", rank: 4 },
];

async function main() {
  await loadDotEnvFile();

  const databaseUrl = process.env.DATABASE_URL;

  assertLocalDatabaseUrl(databaseUrl);

  const seeded = [];
  const missing = [];

  for (const product of featuredProducts) {
    const existingProduct = await prisma.catalogProduct.findUnique({
      where: {
        slug_category: {
          slug: product.slug,
          category: product.category,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingProduct) {
      missing.push(product);
      continue;
    }

    seeded.push({
      id: existingProduct.id,
      name: existingProduct.name,
      ...product,
    });
  }

  if (missing.length) {
    throw new Error(
      `Refusing to reset homepage featured products because ${missing.length} configured product(s) were not found: ${missing
        .map((product) => `${product.category}/${product.slug}`)
        .join(", ")}`,
    );
  }

  await prisma.$transaction([
    prisma.catalogProduct.updateMany({
      data: {
        homepageFeatured: false,
        homepageRank: null,
      },
    }),
    ...seeded.map((product) =>
      prisma.catalogProduct.update({
        where: {
          id: product.id,
        },
        data: {
          homepageFeatured: true,
          homepageRank: product.rank,
        },
      }),
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        databaseUrl: redactDatabaseUrl(databaseUrl),
        featuredProducts: seeded,
      },
      null,
      2,
    ),
  );
}

async function loadDotEnvFile() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(scriptDirectory, "../.env");
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

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = value.replace(/^['"]|['"]$/gu, "");
  }
}

function assertLocalDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const parsedUrl = new URL(databaseUrl);

  if (parsedUrl.hostname !== "localhost" && parsedUrl.hostname !== "127.0.0.1") {
    throw new Error(`Refusing to run against non-local host: ${parsedUrl.hostname}`);
  }

  const databaseName = parsedUrl.pathname.replace(/^\//, "");

  if (databaseName !== "loom_hearth_studio_dev") {
    throw new Error(`Refusing to run against unexpected database: ${databaseName}`);
  }
}

function redactDatabaseUrl(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);

  if (parsedUrl.password) {
    parsedUrl.password = "***";
  }

  return parsedUrl.toString();
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
