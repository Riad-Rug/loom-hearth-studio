// Usage: node scripts/check-seo-product-lifecycle.mjs
//        node --env-file=.env.local scripts/check-seo-product-lifecycle.mjs --catalog
//
// Runs the pure SEO rules (product titles, meta descriptions, the index policy,
// duplicate copy) through Node's own test runner, importing the TypeScript
// sources directly. With --catalog it also reads the local database, read only,
// and prints what those rules produce for every listed product.
import assert from "node:assert/strict";
import { createRequire, register } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

// The catalog service reaches the Prisma repository, which uses TypeScript
// parameter properties (strip-only mode rejects them, so sources are
// transformed instead) and imports "server-only" (which throws outside a React
// server bundle). Nothing connects to a database until a query runs, and the
// service tests below only ever pass a fake repository.
register(
  `data:text/javascript,${encodeURIComponent(`
    import { existsSync, readFileSync } from "node:fs";
    import { stripTypeScriptTypes } from "node:module";
    import { fileURLToPath } from "node:url";
    let rootUrl;
    export function initialize(data) { rootUrl = data.rootUrl; }
    export async function resolve(specifier, context, next) {
      if (specifier.startsWith("@/")) {
        for (const extension of [".ts", ".tsx", "/index.ts"]) {
          const candidate = new URL(specifier.slice(2) + extension, rootUrl);
          if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context);
        }
      }
      if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
      if (specifier === "next/cache") return next("next/cache.js", context);
      return next(specifier, context);
    }
    export async function load(url, context, next) {
      if (url.startsWith(rootUrl) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
        const source = readFileSync(fileURLToPath(url), "utf8");
        return { format: "module", source: stripTypeScriptTypes(source, { mode: "transform", sourceUrl: url }), shortCircuit: true };
      }
      return next(url, context);
    }
  `)}`,
  { data: { rootUrl: pathToFileURL(`${root}/`).href } },
);

const load = (modulePath) => import(pathToFileURL(path.join(root, modulePath)).href);

const { applyProductTitle, buildProductTitle } = await load("lib/seo/product-title.ts");
const { buildProductMetaDescription, truncateMetaDescription } = await load("lib/seo/product-metadata.ts");
const { isProductIndexable, isRugStylePageIndexable, soldIndexWindowDays } = await load("lib/seo/index-policy.ts");
const { findDuplicateProductCopy, normalizeSeoText } = await load("lib/seo/content-audit.ts");
const { validateProductMutationInput } = await load("lib/catalog/product-validation.ts");
const { rugStyleCollections } = await load("features/catalog/rug-style-collections.ts");
const { productSchema } = await load("lib/seo/schema.ts");
const {
  getProductIndexFacts,
  getRugProductDetailByParams,
  listIndexableRugStyleSlugs,
  listProductSitemapEntries,
} = await load("lib/catalog/service.ts");

const brand = " | Loom & Hearth";
const rendered = (title) => (title.templated ? `${title.text}${brand}` : title.text);
const untitled = (name) => ({ name, seoTitle: name });

test("a seoTitle that differs from the name wins and keeps the brand template", () => {
  const title = buildProductTitle({
    name: "Flatweave Wool Pouf — 24″ × 24″ × 10″ — Ivory & Red Geometric",
    seoTitle: "Ivory Moroccan Pouf, Red Geometric Flatweave",
  });

  assert.deepEqual(title, { text: "Ivory Moroccan Pouf, Red Geometric Flatweave", templated: true });
});

test("a seoTitle copied from the name is rebuilt keyword first, colour before size", () => {
  const title = buildProductTitle(
    untitled("Flatweave Wool Pouf — 24″ × 24″ × 10″ — Cream Stripe & Fuchsia Geometric"),
  );

  assert.deepEqual(title, { text: "Flatweave Wool Pouf — Cream Stripe & Fuchsia Geometric", templated: false });
});

test("an empty seoTitle is rebuilt the same way", () => {
  const title = buildProductTitle({ name: "Beni Ourain Pile Rug — 7'9\" × 4'2\" — Brown & Lilac Chevrons", seoTitle: "" });

  assert.deepEqual(title, { text: "Beni Ourain Pile Rug — Brown & Lilac Chevrons — 7'9\" × 4'2\"", templated: false });
});

test("a seoTitle that is the name plus the brand, or with other quote marks, still counts as copied", () => {
  const name = "Beni Ourain Pile Rug — 7'9\" × 4'2\" — Brown & Lilac Chevrons";
  const rebuilt = buildProductTitle(untitled(name));
  const copies = [
    `${name} | Loom & Hearth`,
    `${name} - Loom and Hearth Studio`,
    "Beni Ourain Pile Rug — 7′9″ × 4′2″ — Brown & Lilac Chevrons",
    "Beni Ourain Pile Rug — 7’9” × 4’2” — Brown & Lilac Chevrons | Loom & Hearth",
  ];

  assert.equal(rebuilt.text, "Beni Ourain Pile Rug — Brown & Lilac Chevrons — 7'9\" × 4'2\"");
  for (const seoTitle of copies) assert.deepEqual(buildProductTitle({ name, seoTitle }), rebuilt, seoTitle);
  assert.deepEqual(
    buildProductTitle({ name: "Wool Pile Pouf — 24″ × 24″ × 10″ — Red Floral Grid", seoTitle: 'Wool Pile Pouf — 24" × 24" × 10" — Red Floral Grid' }),
    buildProductTitle(untitled("Wool Pile Pouf — 24″ × 24″ × 10″ — Red Floral Grid")),
  );
});

test("a short name keeps the brand suffix", () => {
  const title = buildProductTitle(untitled("Mellalia & Bettania Handwoven Pillow Cover"));

  assert.deepEqual(title, { text: "Mellalia & Bettania Handwoven Pillow Cover", templated: true });
  assert.ok(rendered(title).length <= 60);
});

test("a name with no colour keeps its size, the only part that tells siblings apart", () => {
  const sizes = ['16.5" × 16.5"', '18.5" × 18.9"', '17.7" × 17.7"'];
  const titles = sizes.map((size) =>
    rendered(buildProductTitle(untitled(`Vintage Moroccan Handmade Battania Pillow Cover — ${size}`))),
  );

  assert.equal(new Set(titles).size, sizes.length);
  titles.forEach((title, index) => assert.ok(title.endsWith(sizes[index]), title));
  titles.forEach((title) => assert.ok(title.length <= 65, title));
});

test("a name too long for any rung is cut at a word and never keeps half a size", () => {
  const title = buildProductTitle(
    untitled("Moroccan Handmade Zemmour Hanbel Lumbar Pillow Cover With Tassels — 24.4\" × 14.6\""),
  );

  assert.equal(title.templated, false);
  assert.ok(title.text.length <= 60, title.text);
  assert.ok(!title.text.includes('"'), title.text);
  assert.ok("Moroccan Handmade Zemmour Hanbel Lumbar Pillow Cover With Tassels".startsWith(title.text));
});

test("a title cut at a word never ends on a dangling small word", () => {
  const cuts = {
    "Moroccan Handmade Zemmour Hanbel Lumbar Pillow Cover With Tassels — 24.4\" × 14.6\"":
      "Moroccan Handmade Zemmour Hanbel Lumbar Pillow Cover",
    "Zemmour Hanbel Runner Woven in Red Wool With Ivory Bands & a Row of Black Diamonds Across":
      "Zemmour Hanbel Runner Woven in Red Wool With Ivory Bands",
    "Beni Ourain Runner Rug in Thick Undyed Ivory Wool Pile and the Dark Brown Diamond Lattice":
      "Beni Ourain Runner Rug in Thick Undyed Ivory Wool Pile",
  };

  for (const [name, expected] of Object.entries(cuts)) {
    assert.deepEqual(buildProductTitle(untitled(name)), { text: expected, templated: false }, name);
  }
});

test("every rebuilt title leads with the keyword and stays within budget", () => {
  const names = [
    "Zemmour-Type Hanbel Runner — 4'8\" × 2'4\" — Red with Zigzag Bands",
    "Khemisset Hanbel Runner — 4'11\" × 2'5\" — Red, Orange & Ivory",
    "Taznakht Three-Technique Rug — 8'4\" × 4'11\" — Sage & Red Grid",
    "Vintage Turquoise Batania Rug & Blanket — 8'6\" × 6'5\"",
    "Wool Pile Pouf — 24″ × 24″ × 10″ — Red Floral Grid",
  ];

  for (const name of names) {
    const title = rendered(buildProductTitle(untitled(name)));
    assert.ok(title.startsWith(name.split(" — ")[0]), title);
    assert.ok(title.length <= 60, `${title.length}: ${title}`);
  }
});

test("applyProductTitle opts a full-budget title out of the template", () => {
  const title = { text: "Flatweave Wool Pouf — Cream Stripe & Fuchsia Geometric", templated: false };

  assert.deepEqual(applyProductTitle({ title: title.text, description: "d" }, title), {
    title: { absolute: title.text },
    description: "d",
  });
});

test("applyProductTitle leaves templated and admin-managed titles alone", () => {
  const built = { text: "Flatweave Wool Pouf — Cream Stripe & Fuchsia Geometric", templated: false };
  const managed = { title: "A title set on the admin SEO screen" };
  const templated = { title: "Short Pouf" };

  assert.equal(applyProductTitle(managed, built), managed);
  assert.equal(applyProductTitle(templated, { text: "Short Pouf", templated: true }), templated);
});

const selectedFor =
  "Hand-knotted wool from the Middle Atlas, measured at 7'9\" × 4'2\" with brown and lilac chevrons across an undyed ivory field. Selected for texture, scale, and exact-piece character, with final color confirmed by video before payment is captured.";

test("a long description ends on the last full sentence that fits", () => {
  const description = truncateMetaDescription(selectedFor);

  assert.ok(description.length <= 160);
  assert.ok(description.endsWith("ivory field."), description);
  assert.ok(!description.includes("Selected for"), description);
});

test("an abbreviation's full stop is not where the description ends", () => {
  const opener = "Hand-knotted Beni Ourain rug in undyed Middle Atlas wool, with brown diamond lines drawn across an ivory field.";

  for (const abbreviation of ["approx.", "e.g.", "i.e.", "St.", "No."]) {
    const description = truncateMetaDescription(
      `${opener} Measures ${abbreviation} 240 cm long and ships rolled, with photos and video of the exact piece first.`,
    );

    assert.equal(description, opener, abbreviation);
  }
});

test("with no sentence end late enough, the cut falls on a word and shows an ellipsis", () => {
  const runOn = `${"Hand-knotted wool pile with raised cord diamonds and a soft undyed fringe ".repeat(3)}end`;
  const description = truncateMetaDescription(runOn);

  assert.ok(description.length <= 160, String(description.length));
  assert.ok(description.endsWith("…"), description);
  const kept = description.slice(0, -1);
  assert.ok(runOn.startsWith(kept), "keeps the original text");
  assert.match(runOn.slice(kept.length), /^\s/u, "stops at a word boundary");
});

test("an opener sentence too short to carry the snippet is not where the cut lands", () => {
  const description = truncateMetaDescription(
    `Beni Ourain rug. ${"Thick undyed wool pile knotted by hand in the Middle Atlas with a dark lattice ".repeat(3)}`,
  );

  assert.ok(description.endsWith("…"), description);
  assert.ok(description.length > 100);
});

test("short copy is returned untouched", () => {
  assert.equal(truncateMetaDescription("Short and complete."), "Short and complete.");
});

test("the product meta description uses the admin SEO copy, cut cleanly", () => {
  const description = buildProductMetaDescription({ seoDescription: `  ${selectedFor}  ` });

  assert.ok(description.endsWith("ivory field."), description);
});

const day = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-16T12:00:00Z");
const daysAgo = (days) => new Date(now.getTime() - days * day);

test("active and reserved pieces are indexable", () => {
  assert.equal(isProductIndexable({ status: "active", soldAt: null }, now), true);
  assert.equal(isProductIndexable({ status: "reserved", soldAt: null }, now), true);
});

test(`a sold piece stays indexable for ${soldIndexWindowDays} days after soldAt, then retires`, () => {
  assert.equal(soldIndexWindowDays, 90);
  assert.equal(isProductIndexable({ status: "sold", soldAt: daysAgo(1) }, now), true);
  assert.equal(isProductIndexable({ status: "sold", soldAt: daysAgo(90) }, now), true);
  assert.equal(isProductIndexable({ status: "sold", soldAt: daysAgo(91) }, now), false);
});

test("a sold piece with no soldAt is treated as an old sale", () => {
  assert.equal(isProductIndexable({ status: "sold", soldAt: null }, now), false);
});

test("drafts and archived pieces are never indexable", () => {
  assert.equal(isProductIndexable({ status: "draft", soldAt: null }, now), false);
  assert.equal(isProductIndexable({ status: "archived", soldAt: null }, now), false);
});

test("a style page needs guide copy and a live or recently sold piece", () => {
  const style = (pieces, hasGuideCopy = true) => isRugStylePageIndexable({ hasGuideCopy, pieces }, now);

  assert.equal(style([{ status: "active", soldAt: null }]), true);
  assert.equal(style([{ status: "reserved", soldAt: null }]), true);
  assert.equal(style([{ status: "sold", soldAt: daysAgo(30) }]), true);
  assert.equal(style([{ status: "sold", soldAt: daysAgo(120) }]), false);
  assert.equal(style([{ status: "sold", soldAt: daysAgo(120) }, { status: "sold", soldAt: null }]), false);
  assert.equal(style([]), false);
  assert.equal(style([{ status: "active", soldAt: null }], false), false);
});

const catalogRow = (slug, rugStyle, status, soldAt) => ({
  product: { id: slug, slug, type: "rug", category: "rugs", rugStyle, status },
  soldAt,
});
const catalogRows = [
  catalogRow("sold-89-days-ago", "Beni Ourain", "sold", daysAgo(89)),
  catalogRow("sold-91-days-ago", "Azilal", "sold", daysAgo(91)),
  catalogRow("sold-without-date", "Boujad", "sold", null),
  catalogRow("reserved", "Zemmour", "reserved", null),
];
const fakeProductRepository = {
  listAllWithUpdatedAt: async () => catalogRows.map(({ product }) => ({ product, updatedAt: now })),
  listByCategory: async (category) =>
    catalogRows.map(({ product }) => product).filter((product) => product.category === category),
  listSoldDates: async () =>
    new Map(
      catalogRows
        .filter(({ product, soldAt }) => product.status === "sold" && soldAt)
        .map(({ product, soldAt }) => [product.id, soldAt]),
    ),
  getSoldAt: async (id) => catalogRows.find(({ product }) => product.id === id)?.soldAt ?? null,
};

test("the sitemap lists a product page exactly when its robots tag allows indexing", async () => {
  const sitemapPaths = new Set(
    (await listProductSitemapEntries(now, fakeProductRepository)).map((entry) => entry.href),
  );

  assert.deepEqual([...sitemapPaths].sort(), [
    "/shop/rugs/beni-ourain/sold-89-days-ago",
    "/shop/rugs/zemmour/reserved",
  ]);
  for (const { product } of catalogRows) {
    const pageIndexable = isProductIndexable(await getProductIndexFacts(product, fakeProductRepository), now);
    const listed = [...sitemapPaths].some((path) => path.endsWith(`/${product.slug}`));
    assert.equal(pageIndexable, listed, product.slug);
  }
});

test("a style page is indexable, and in the sitemap, while one of its pieces is", async () => {
  assert.deepEqual([...(await listIndexableRugStyleSlugs(now, fakeProductRepository))].sort(), [
    "beni-ourain",
    "zemmour",
  ]);
});

test("a product's og:image alt describes its first photo without a gallery position", async () => {
  const photo = (id, role, sortOrder) => ({
    id,
    publicId: `loom-hearth/${id}`,
    altText: "Beni Ourain Pile Rug — 7'9\" × 4'2\" — Brown & Lilac Chevrons",
    sortOrder,
    role,
    mediaType: "image",
  });
  const rug = {
    id: "rug-1",
    slug: "beni-ourain-pile-rug-brown-lilac-chevrons",
    name: "Beni Ourain Pile Rug — 7'9\" × 4'2\" — Brown & Lilac Chevrons",
    type: "rug",
    category: "rugs",
    rugStyle: "Beni Ourain",
    status: "active",
    description: "A rug.",
    priceUsd: 900,
    origin: "Morocco",
    images: [photo("detail", "detail", 2), photo("hero", "hero", 1)],
    materials: ["Wool"],
    palette: [],
    seoTitle: "",
    seoDescription: "",
    dimensionsCm: { length: 236, width: 127 },
    weightKg: 9,
    fixedQuantity: 1,
  };
  const repository = { getBySlug: async () => rug, listAll: async () => [rug] };
  const product = await getRugProductDetailByParams({ style: "beni-ourain", slug: rug.slug, repository });

  assert.equal(product.gallery[0].altText, "Beni Ourain Pile Rug Brown & Lilac Chevrons, full view, photo 1 of 2");
  assert.equal(product.ogImageAlt, "Beni Ourain Pile Rug Brown & Lilac Chevrons, full view");
});

test("Product JSON-LD names the site's brand and publishes the 7 to 14 business-day transit as calendar days", () => {
  const schema = productSchema({
    id: "rug-1",
    name: "Beni Ourain Pile Rug",
    description: "A rug.",
    path: "/shop/rugs/beni-ourain/rug-1",
    priceUsdLabel: "$900.00",
    category: "rugs",
    imageUrls: [],
    availability: "available",
  });

  assert.deepEqual(schema.brand, { "@type": "Brand", name: "Loom & Hearth", alternateName: "Loom & Hearth Studio" });
  const { transitTime } = schema.offers.shippingDetails[0].deliveryTime;
  assert.deepEqual([transitTime.minValue, transitTime.maxValue, transitTime.unitCode], [10, 20, "DAY"]);
});

test("every rug style page's meta description fits in 155 characters", () => {
  for (const [slug, collection] of Object.entries(rugStyleCollections)) {
    const description = collection.page?.metaDescription ?? "";
    assert.ok(description.length <= 155, `${slug}: ${description.length}`);
  }
});

test("duplicate copy is flagged on every product that shares it, ignoring case and punctuation", () => {
  const flags = findDuplicateProductCopy([
    { id: "a", description: "Red pouf.", seoDescription: "Flatweave pouf, ships flat." },
    { id: "b", description: "Ivory pouf.", seoDescription: "flatweave pouf ships flat" },
    { id: "c", description: "red pouf", seoDescription: "Something else entirely." },
    { id: "d", description: "", seoDescription: "" },
    { id: "e", description: "", seoDescription: "" },
  ]);

  assert.deepEqual(
    flags.map((flag) => `${flag.field}:${flag.productId}<${flag.sharedWith.join(",")}>`).sort(),
    ["description:a<c>", "description:c<a>", "seoDescription:a<b>", "seoDescription:b<a>"],
  );
});

test("copy compares the same with or without accents, and non-Latin text is kept", () => {
  assert.equal(normalizeSeoText("Aït Ouaouzguite rug"), normalizeSeoText("Ait Ouaouzguite rug"));
  assert.equal(normalizeSeoText("Bejaâd, Khémisset!"), "bejaad khemisset");
  assert.equal(normalizeSeoText("زربية مغربية"), "زربية مغربية");
  assert.deepEqual(
    findDuplicateProductCopy([
      { id: "a", description: "زربية مغربية", seoDescription: "" },
      { id: "b", description: "زربية أمازيغية", seoDescription: "" },
    ]),
    [],
  );
});

const takenSeoDescription ="Hand-knotted Beni Ourain rug in undyed wool, sourced in the Middle Atlas.";
const draftRug = (seoDescription) => ({
  status: "parsed",
  value: {
    type: "rug",
    slug: "test-rug",
    name: "Test Rug",
    category: "rugs",
    description: "A rug.",
    priceUsd: 100,
    origin: "Morocco",
    images: [{ id: "i1", publicId: "p1", altText: "Test rug", sortOrder: 1, role: "hero", mediaType: "image" }],
    materials: ["Wool"],
    palette: [],
    status: "draft",
    seoTitle: "Test Rug",
    seoDescription,
    homepageFeatured: false,
    homepageRank: null,
    rugStyle: "Beni Ourain",
    dimensionsCm: { length: 150, width: 100 },
    weightKg: 5,
    fixedQuantity: 1,
  },
  urlState: { hasUrlChange: false, previousPath: null, nextPath: "/shop/rugs/beni-ourain/test-rug", confirmUrlChange: false },
});
const others = [takenSeoDescription, "Another rug entirely."];
const seoDescriptionError = (result) => (result.status === "invalid" ? result.fieldErrors.seoDescription : undefined);

test("creating a product with another product's SEO description is rejected", () => {
  assert.equal(validateProductMutationInput(draftRug("A fresh description."), { otherSeoDescriptions: others }).status, "valid");
  assert.match(
    seoDescriptionError(validateProductMutationInput(draftRug(` ${takenSeoDescription.toUpperCase()} `), { otherSeoDescriptions: others })) ?? "",
    /Another product already uses this SEO description/u,
  );
});

test("an unrelated edit to a product that already shares its SEO description still saves", () => {
  const result = validateProductMutationInput(draftRug(takenSeoDescription), {
    otherSeoDescriptions: others,
    storedSeoDescription: takenSeoDescription,
  });

  assert.equal(result.status, "valid");
});

test("changing an SEO description to one another product uses is rejected on update", () => {
  const result = validateProductMutationInput(draftRug(takenSeoDescription), {
    otherSeoDescriptions: others,
    storedSeoDescription: "What this rug said before.",
  });

  assert.match(seoDescriptionError(result) ?? "", /Another product already uses this SEO description/u);
});

if (process.argv.includes("--catalog")) {
  test("live catalog report (read only)", async () => {
    const { PrismaClient } = createRequire(path.join(root, "package.json"))("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const rows = await prisma.catalogProduct.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          soldAt: true,
          seoTitle: true,
          description: true,
          seoDescription: true,
        },
      });
      const listed = rows.filter((row) => ["active", "reserved", "sold"].includes(row.status));
      const titles = listed.map((row) => rendered(buildProductTitle(row)));
      const titleCounts = new Map();
      for (const title of titles) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
      const oldTitles = listed.map((row) => `${row.seoTitle || row.name}${brand}`);
      const descriptions = listed.map((row) => truncateMetaDescription(row.seoDescription.replace(/\s+/gu, " ").trim()));
      const today = new Date();

      console.log(`titles over 60 before: ${oldTitles.filter((title) => title.length > 60).length} of ${listed.length}`);
      console.log(`titles over 60 after: ${titles.filter((title) => title.length > 60).length} of ${listed.length}`);
      for (const title of titles.filter((candidate) => candidate.length > 60)) console.log(`  ${title.length} ${title}`);
      console.log(`duplicate titles after: ${[...titleCounts.values()].filter((count) => count > 1).length}`);
      console.log(`descriptions cut mid-sentence without an ellipsis: ${descriptions.filter((text) => !/[.!?…]["'”’)]*$/u.test(text)).length} of ${listed.length}`);
      for (const row of listed.filter((candidate) => candidate.status === "sold")) {
        console.log(`sold ${row.slug} soldAt=${row.soldAt?.toISOString() ?? "none"} indexable=${isProductIndexable(row, today)}`);
      }
      const flags = findDuplicateProductCopy(rows);
      const bySlug = new Map(rows.map((row) => [row.id, `${row.slug} (${row.status})`]));
      console.log(`duplicate copy flags: ${flags.length}`);
      for (const flag of flags) console.log(`  ${flag.field} ${bySlug.get(flag.productId)} = ${flag.sharedWith.map((id) => bySlug.get(id)).join(", ")}`);
    } finally {
      await prisma.$disconnect();
    }
  });
}
