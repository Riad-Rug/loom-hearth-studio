import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The admin rug-style dropdown originally carried a "-style" suffix on five of
// its nine options. The suffix leaked into CatalogProduct.rugStyle and from
// there into the public product route (/shop/rugs/<slugified rugStyle>/<slug>),
// which no longer matched the rug-style collection keys. The canonical labels
// below match lib/catalog/product-validation.ts -> productRugStyleOptions.
const rugStyleLabelBackfill = {
  "Boujad-style": "Boujad",
  "Azilal-style": "Azilal",
  "Beni Ourain-style": "Beni Ourain",
  "Beni M'Guild-style": "Beni M'Guild",
  "Zemmour-style": "Zemmour",
};

const applyChanges = process.argv.includes("--apply");

async function main() {
  const oldLabels = Object.keys(rugStyleLabelBackfill);

  const affectedProducts = await prisma.catalogProduct.findMany({
    where: { rugStyle: { in: oldLabels } },
    select: {
      id: true,
      catalogNumber: true,
      slug: true,
      type: true,
      category: true,
      rugStyle: true,
    },
    orderBy: [{ rugStyle: "asc" }, { slug: "asc" }],
  });

  const changes = affectedProducts.map((product) => {
    const newRugStyle = rugStyleLabelBackfill[product.rugStyle];

    return {
      id: product.id,
      catalogNumber: product.catalogNumber,
      slug: product.slug,
      oldRugStyle: product.rugStyle,
      newRugStyle,
      oldRoutePath: buildRoutePath(product, product.rugStyle),
      newRoutePath: buildRoutePath(product, newRugStyle),
    };
  });

  let updatedProducts = 0;

  if (applyChanges) {
    for (const change of changes) {
      await prisma.catalogProduct.update({
        where: { id: change.id },
        data: { rugStyle: change.newRugStyle },
      });
      updatedProducts += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        status: applyChanges ? "applied" : "dry-run",
        mode: applyChanges ? "--apply" : "dry-run (no writes; pass --apply to write)",
        affectedProducts: changes.length,
        updatedProducts,
        changes,
      },
      null,
      2,
    ),
  );
}

function buildRoutePath(product, rugStyle) {
  if (product.type === "rug" && product.category === "vintage") {
    return `/shop/vintage/${product.slug}`;
  }

  if (product.type === "rug") {
    const styleSegment = normalizeSlug(rugStyle ?? "");
    return styleSegment ? `/shop/rugs/${styleSegment}/${product.slug}` : "";
  }

  return `/shop/${product.category}/${product.slug}`;
}

// Mirrors normalizeSlug in lib/catalog/product-validation.ts.
function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
