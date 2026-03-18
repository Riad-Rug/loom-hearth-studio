import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const prisma = new PrismaClient();

async function main() {
  await loadDotEnvFile();

  const databaseUrl = process.env.DATABASE_URL;

  assertLocalDatabaseUrl(databaseUrl);

  const launchProducts = await loadLaunchProducts();
  const results = {
    created: 0,
    updated: 0,
  };

  for (const product of launchProducts) {
    const existingProduct = await prisma.catalogProduct.findUnique({
      where: {
        slug_category: {
          slug: product.slug,
          category: product.category,
        },
      },
      select: {
        id: true,
      },
    });

    const payload = mapLaunchProductToCatalogProduct(product);

    if (existingProduct) {
      await prisma.catalogProduct.update({
        where: {
          slug_category: {
            slug: product.slug,
            category: product.category,
          },
        },
        data: payload,
      });
      results.updated += 1;
      continue;
    }

    await prisma.catalogProduct.create({
      data: {
        id: product.id,
        ...payload,
      },
    });
    results.created += 1;
  }

  const totalCount = await prisma.catalogProduct.count();

  console.log(
    JSON.stringify(
      {
        status: "ok",
        databaseUrl: redactDatabaseUrl(databaseUrl),
        importedProducts: launchProducts.length,
        created: results.created,
        updated: results.updated,
        totalCatalogProducts: totalCount,
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

async function loadLaunchProducts() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const sourcePath = path.resolve(scriptDirectory, "../lib/catalog/launch-product-data.ts");
  const sourceText = await readFile(sourcePath, "utf8");
  const transpiledModule = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "launch-product-data.ts",
  }).outputText;
  const temporaryModulePath = path.join(
    tmpdir(),
    `loom-hearth-launch-products-${Date.now()}.mjs`,
  );

  await import("node:fs/promises").then(({ writeFile }) =>
    writeFile(temporaryModulePath, transpiledModule, "utf8"),
  );

  const module = await import(pathToFileURL(temporaryModulePath).href);
  return module.launchProducts;
}

function mapLaunchProductToCatalogProduct(product) {
  return {
    type: product.type,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    priceUsd: product.priceUsd,
    origin: product.origin,
    status: product.status,
    images: product.images,
    materials: product.materials,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    rugStyle: product.type === "rug" ? product.rugStyle : null,
    dimensionsCm: product.type === "rug" ? product.dimensionsCm : null,
    weightKg: product.type === "rug" ? product.weightKg : null,
    fixedQuantity: product.type === "rug" ? product.fixedQuantity : null,
    inventory: product.type === "multiUnit" ? product.inventory : null,
    lowStockThreshold: product.type === "multiUnit" ? product.lowStockThreshold : null,
    variants: product.type === "multiUnit" ? product.variants : null,
    notifyMeEnabled: product.type === "multiUnit" ? product.notifyMeEnabled : null,
  };
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
