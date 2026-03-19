import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const prisma = new PrismaClient();

async function main() {
  const existingCatalogCount = await prisma.catalogProduct.count();
  const launchProducts = await loadLaunchProducts();
  let syncedProducts = 0;

  for (const product of launchProducts) {
    await prisma.catalogProduct.upsert({
      where: {
        slug_category: {
          slug: product.slug,
          category: product.category,
        },
      },
      update: mapLaunchProductToCatalogProduct(product),
      create: {
        id: product.id,
        ...mapLaunchProductToCatalogProduct(product),
      },
    });
    syncedProducts += 1;
  }

  const totalCatalogProducts = await prisma.catalogProduct.count();

  console.log(
    JSON.stringify(
      {
        status: "synced",
        existingCatalogProductsBeforeSync: existingCatalogCount,
        syncedProducts,
        totalCatalogProducts,
      },
      null,
      2,
    ),
  );
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

  await writeFile(temporaryModulePath, transpiledModule, "utf8");

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

try {
  await main();
} finally {
  await prisma.$disconnect();
}
