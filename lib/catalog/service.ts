import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { getUpsellCategoryOrder } from "@/lib/catalog/companion-categories";
import { cleanLegacyAttributionText, getRugTaxonomyDisplay } from "@/lib/catalog/rug-taxonomy";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { buildRugFacets, getRugFacetSlugs, rugMatchesFacet, type RugFacet } from "@/lib/catalog/rug-facets";
import {
  formatProductPriceUsd,
  getCompareAtPriceUsdLabel,
  formatRugDimensions,
  formatRugWeight,
  getCategoryRoutePath,
  getInventoryState,
  getProductBadgeLabel,
  getProductRoutePath,
  getProductRoutePattern,
} from "@/lib/catalog/helpers";
import { getProductAvailability } from "@/lib/catalog/availability";
import type {
  CatalogProductCardViewModel,
  CatalogProductSizeBucket,
  MultiUnitProductDetailPageViewModel,
  ProductDetailPageViewModel,
  ProductDetailSectionViewModel,
  ProductLinkViewModel,
  RugProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import {
  dimensionSeparator,
  getDisplayProductName,
  getPrimaryColorFromTitle,
  getProductCardName,
  getRugConstructionLabel,
  getRugFeatureLabel,
  humanizeProductToken,
  normalizeDimensionSeparators,
  parseProductTitle,
  removeConstructionFromColor,
} from "@/lib/catalog/product-card-name";
import { normalizeSlug, productCategoryOptions } from "@/lib/catalog/product-validation";
import {
  getInventoryShuffleSeed,
  shuffleWithSeed,
} from "@/lib/catalog/random-selection";
import { isPlaceholderAltText } from "@/lib/catalog/image-alt";
import { formatCmAsFeetInches } from "@/lib/catalog/size-format";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createProductRepository, type ProductRepository } from "@/lib/db/repositories/product-repository";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";
import { storePromise } from "@/lib/order/store-promise";
import {
  isProductIndexable,
  isRugStylePageIndexable,
  type ProductIndexFacts,
} from "@/lib/seo/index-policy";
import type { CloudinaryAssetRole, MediaAsset, Product, ProductCategory, RugProduct } from "@/types/domain";

const defaultRugPalette = ["#F1E8D6", "#3A5F3A", "#C89B2A", "#B9562A", "#7A2B2B"] as const;
const paletteLabelsByHex = new Map([
  ["#F1E8D6", "Ivory ground"],
  ["#3A5F3A", "Forest green"],
  ["#C89B2A", "Mustard"],
  ["#B9562A", "Burnt orange"],
  ["#7A2B2B", "Burgundy"],
]);

/**
 * The header's style menu, a style page's metadata and body, and a rug page's
 * breadcrumb all start from the same rug rows. React cache scopes both of these
 * to one server render, so a request reads those rows once; outside a render
 * (the sitemap route, scripts) each call reads afresh.
 */
const requestProductRepository = cache(() => createProductRepository());
const listRugRows = cache((repository: ProductRepository) => repository.listByCategory("rugs"));

export async function listCatalogProductCards(input?: {
  category?: ProductCategory;
  repository?: ProductRepository;
}): Promise<CatalogProductCardViewModel[]> {
  const repository = input?.repository ?? createProductRepository();
  const products = input?.category
    ? await repository.listByCategory(input.category)
    : await repository.listAll();

  return products.map(createCatalogProductCardViewModel);
}

/**
 * Does this category hold at least one piece a shopper can buy right now?
 * Rows alone are not enough: a category whose only listing is active but out of
 * stock (a notify-me presentation) counts as empty.
 */
export async function categoryHasPurchasableProducts(
  category: ProductCategory,
  repository: ProductRepository = createProductRepository(),
): Promise<boolean> {
  noStore();

  const products = await repository.listByCategory(category);

  return products.some((product) => getProductAvailability(product) === "available");
}

/**
 * Landing-route hrefs for every category with nothing purchasable behind it
 * right now, so nav, footer, and homepage renderers can grey their entry points
 * in place instead of hardcoding which category is currently empty. Live read on
 * every render: the moment real stock lands, the links come back on their own.
 * One listAll() per request — these surfaces are already uncached (the footer's
 * getHomepageContent calls noStore), so this is not a hot path.
 */
export async function listUnavailableCategoryHrefs(
  repository: ProductRepository = createProductRepository(),
): Promise<string[]> {
  noStore();

  const products = await repository.listAll();
  const purchasableCategories = new Set(
    products
      .filter((product) => getProductAvailability(product) === "available")
      .map((product) => product.category),
  );

  return productCategoryOptions
    .filter((category) => !purchasableCategories.has(category))
    .map(getCategoryRoutePath);
}

/**
 * Every rug Type and Region facet (lib/catalog/rug-facets.ts), built from the
 * live region table. Cached per request: the header, the page and its metadata
 * all ask.
 */
export const listRugFacets = cache(async (): Promise<RugFacet[]> => {
  return buildRugFacets(await createRugRegionRepository().listAll());
});

/** The facet with its own /shop/rugs/<slug> page, or null (unknown slug, or a filter-only region like Morocco). */
export async function getRugFacetPage(slug: string): Promise<RugFacet | null> {
  const facet = (await listRugFacets()).find((candidate) => candidate.slug === normalizeSlug(slug));

  return facet?.hasLandingPage ? facet : null;
}

export type RugFacetLink = {
  kind: RugFacet["kind"];
  slug: string;
  href: string;
  label: string;
};

/**
 * Links to every Type and Region page with a rug a shopper can buy right now,
 * in facet order. The Rugs menu, the homepage strip, the /shop/rugs chips and
 * the sibling strip on each page all use this, so a Type or Region with no
 * active rug disappears everywhere at once and returns when stock lands.
 * Live read on every render.
 */
export async function listRugFacetLinks(
  repository: ProductRepository = requestProductRepository(),
): Promise<RugFacetLink[]> {
  noStore();

  const [facets, rugs] = await Promise.all([listRugFacets(), listRugRows(repository)]);
  const availableRugs = rugs.filter(
    (product): product is RugProduct => product.type === "rug" && getProductAvailability(product) === "available",
  );

  return facets
    .filter((facet) => facet.hasLandingPage && availableRugs.some((rug) => rugMatchesFacet(rug, facet)))
    .map((facet) => ({
      kind: facet.kind,
      slug: facet.slug,
      href: `/shop/rugs/${facet.slug}`,
      label: getRugFacetTitle(facet),
    }));
}

/** Anchor text for a facet page: its written collection title, else "<name> Rugs". */
export function getRugFacetTitle(facet: Pick<RugFacet, "kind" | "slug" | "name">) {
  const collection = getRugStyleCollection(facet.slug);

  if (collection) {
    return collection.title;
  }

  return facet.kind === "type" && facet.slug === "pile" ? "Hand-Knotted Pile Rugs" : `${facet.name} Rugs`;
}

/** Filter options for the Type and Region filters: every facet, in order. Callers hide the ones with no rug in view. */
export async function listRugFilterOptions() {
  return (await listRugFacets()).map((facet) => ({
    kind: facet.kind,
    slug: facet.slug,
    label: facet.name,
    ...(facet.parentSlug ? { parentSlug: facet.parentSlug } : {}),
  }));
}

/**
 * Route href paired with the last database write for every product the index
 * policy (lib/seo/index-policy.ts) wants in search, so app/sitemap.ts lists
 * exactly the product pages that do not ask to be dropped, each with a real
 * <lastmod>. Deliberately narrow: updatedAt is a persistence timestamp with
 * exactly one consumer, so it stays off the domain Product and
 * CatalogProductCardViewModel types rather than being threaded through every
 * catalog surface for this one field.
 */
export async function listProductSitemapEntries(
  now: Date,
  repository: ProductRepository = createProductRepository(),
): Promise<Array<{ href: string; updatedAt: Date }>> {
  const [records, soldDates] = await Promise.all([
    repository.listAllWithUpdatedAt(),
    repository.listSoldDates(),
  ]);

  return records
    .filter(({ product }) => isProductIndexable(toIndexFacts(product, soldDates), now))
    .map(({ product, updatedAt }) => ({
      href: getProductRoutePath(product),
      updatedAt,
    }));
}

/**
 * What the index policy needs to decide a product page's robots directive. The
 * policy reads soldAt only for a sold piece, so no other status queries it.
 */
export async function getProductIndexFacts(
  product: Pick<Product, "id" | "status">,
  repository: ProductRepository = createProductRepository(),
): Promise<ProductIndexFacts> {
  noStore();

  return {
    status: product.status,
    soldAt: product.status === "sold" ? await repository.getSoldAt(product.id) : null,
  };
}

/**
 * Type and Region pages the index policy wants in search right now: the page's
 * robots tag, the sitemap, the rug breadcrumb and the spec-row links all read
 * this. A page needs its written guide copy and a piece whose own page is
 * indexable (lib/seo/index-policy.ts); the pieces are the rows that page shows,
 * sold ones included.
 */
export async function listIndexableRugFacetSlugs(
  now: Date,
  repository: ProductRepository = requestProductRepository(),
): Promise<Set<string>> {
  noStore();

  const [facets, rugs, soldDates] = await Promise.all([
    listRugFacets(),
    listRugRows(repository),
    repository.listSoldDates(),
  ]);

  return new Set(
    facets
      .filter(
        (facet) =>
          facet.hasLandingPage &&
          isRugStylePageIndexable(
            {
              hasGuideCopy: Boolean(getRugStyleCollection(facet.slug)?.page?.guide.body.trim()),
              pieces: rugs
                .filter((product): product is RugProduct => product.type === "rug" && rugMatchesFacet(product, facet))
                .map((product) => toIndexFacts(product, soldDates)),
            },
            now,
          ),
      )
      .map((facet) => facet.slug),
  );
}

function toIndexFacts(
  product: Pick<Product, "id" | "status">,
  soldDates: ReadonlyMap<string, Date>,
): ProductIndexFacts {
  return { status: product.status, soldAt: soldDates.get(product.id) ?? null };
}

export type RugPageLinks = {
  /** The breadcrumb level between Rugs and the rug: its Region page. */
  breadcrumb?: { label: string; href: string };
  typeHref?: string;
  regionHref?: string;
};

/**
 * Where a rug's breadcrumb and its Type / Region rows link. Each target must be
 * an indexed page right now (lib/seo/index-policy.ts), so no crawlable link
 * points at a page that asks to be dropped. The breadcrumb level is the Region:
 * the rug's own region page, else its parent's (Tiflet → Zemmour). Vintage rugs
 * live under /shop/vintage and have no level here.
 */
export async function getRugPageLinks(product: {
  category: ProductCategory;
  typeSlug?: string;
  regionSlugs: readonly string[];
}): Promise<RugPageLinks> {
  if (product.category === "vintage") {
    return {};
  }

  const [facets, indexable] = await Promise.all([listRugFacets(), listIndexableRugFacetSlugs(new Date())]);
  const page = (slug: string | undefined) =>
    slug && indexable.has(slug) ? facets.find((facet) => facet.slug === slug && facet.hasLandingPage) : undefined;
  const regionPage = product.regionSlugs.map(page).find(Boolean);
  const typePage = page(product.typeSlug);

  return {
    ...(regionPage
      ? {
          breadcrumb: { label: getRugFacetTitle(regionPage), href: `/shop/rugs/${regionPage.slug}` },
          regionHref: `/shop/rugs/${regionPage.slug}`,
        }
      : {}),
    ...(typePage ? { typeHref: `/shop/rugs/${typePage.slug}` } : {}),
  };
}

/** The rugs on a Type or Region page (a parent region includes its children's rugs). */
export async function listRugFacetProductCards(input: {
  facet: RugFacet;
  repository?: ProductRepository;
}): Promise<CatalogProductCardViewModel[]> {
  const repository = input.repository ?? requestProductRepository();

  return (await listRugRows(repository))
    .filter((product): product is RugProduct => product.type === "rug" && rugMatchesFacet(product, input.facet))
    .map(createCatalogProductCardViewModel);
}

export async function listHomepageFeaturedProductCards(input?: {
  limit?: number;
  repository?: ProductRepository;
}): Promise<CatalogProductCardViewModel[]> {
  const repository = input?.repository ?? createProductRepository();
  const limit = input?.limit ?? 4;
  const products = await repository.listHomepageFeatured(limit);

  return products.map(createCatalogProductCardViewModel);
}

/**
 * Randomised live-inventory sample for the homepage "In the warehouse now"
 * grid. Deliberately NOT listHomepageFeaturedProductCards: the admin
 * homepageFeatured/homepageRank fields still drive the Contact and
 * Trade recommendation blocks, but no longer the homepage grid.
 *
 * noStore() keeps `/` out of the full route cache so the shuffle is
 * recomputed per request rather than frozen at build time.
 */
export async function listRandomInventoryProductCards(input?: {
  limit?: number;
  pageSize?: number;
  seed?: number;
  repository?: ProductRepository;
}): Promise<CatalogProductCardViewModel[]> {
  noStore();

  const repository = input?.repository ?? createProductRepository();
  const limit = input?.limit ?? 24;
  const pageSize = input?.pageSize ?? 8;
  const seed = input?.seed ?? getInventoryShuffleSeed();

  const products = await repository.listInventoryEligible();
  const shuffled = shuffleWithSeed(products, seed).slice(0, limit);

  // Trim to a whole multiple of pageSize so every page is a full grid.
  // Below one full page we return whatever exists (sparse-catalog case).
  const usableCount =
    shuffled.length < pageSize
      ? shuffled.length
      : Math.floor(shuffled.length / pageSize) * pageSize;

  return shuffled.slice(0, usableCount).map(createCatalogProductCardViewModel);
}

// Lean view model for checkout's "add to order" cross-sell — deliberately
// not CatalogProductCardViewModel (which carries PDP-only fields like
// routePattern/badge/description). cartProduct is the full
// server-validated Product so the client can call useCart().addProduct(...)
// directly without ever re-deriving or trusting a client-supplied price,
// mirroring how PDP's cartProduct field already works
// (see product.cartProduct in features/pdp/product-detail-page-view.tsx).
export type AddToOrderCandidateViewModel = {
  id: string;
  href: string;
  name: string;
  priceUsd: number;
  priceUsdLabel: string;
  compareAtPriceUsdLabel?: string;
  image?: {
    src: string;
    altText: string;
  };
  cartProduct: Product;
};

export async function listAddToOrderCandidateProducts(input: {
  cartCategories: ProductCategory[];
  cartFloorPriceUsd: number;
  excludeProductIds: string[];
  limit?: number;
  repository?: ProductRepository;
}): Promise<AddToOrderCandidateViewModel[]> {
  const repository = input.repository ?? createProductRepository();
  const limit = input.limit ?? 2;
  const excludeProductIds = new Set(input.excludeProductIds);
  // Candidates should be meaningfully cheaper than what's already in the
  // cart — starting heuristic: no more than 60% of the cheapest item
  // currently in the cart (a $28 pillow next to a $340 rug, not a second
  // rug-sized purchase).
  const priceCeilingUsd = input.cartFloorPriceUsd * 0.6;

  if (!(priceCeilingUsd > 0) || !input.cartCategories.length) {
    return [];
  }

  // Merge the upsell affinity order across every category already in the
  // cart, keeping each candidate category's best (lowest) rank so a mixed
  // cart (e.g. a rug + a pouf) still ranks sensibly.
  const categoryRank = new Map<ProductCategory, number>();
  input.cartCategories.forEach((category) => {
    getUpsellCategoryOrder(category).forEach((candidateCategory, index) => {
      const bestRank = categoryRank.get(candidateCategory);
      if (bestRank === undefined || index < bestRank) {
        categoryRank.set(candidateCategory, index);
      }
    });
  });

  const allProducts = await repository.listAll();

  const candidates = allProducts
    .filter((product) => getProductAvailability(product) === "available")
    .filter((product) => !excludeProductIds.has(product.id))
    .filter((product) => categoryRank.has(product.category))
    .filter((product) => product.priceUsd > 0 && product.priceUsd <= priceCeilingUsd)
    .sort((left, right) => {
      const rankDelta = (categoryRank.get(left.category) ?? 0) - (categoryRank.get(right.category) ?? 0);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return left.priceUsd - right.priceUsd;
    })
    .slice(0, limit);

  return candidates.map(createAddToOrderCandidateViewModel);
}

function createAddToOrderCandidateViewModel(product: Product): AddToOrderCandidateViewModel {
  const primaryImage = getPrimaryImage(product);

  return {
    id: product.id,
    href: getProductRoutePath(product),
    name: createProductCardDisplayName(product),
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    compareAtPriceUsdLabel: getCompareAtPriceUsdLabel(product),
    image: primaryImage
      ? {
          src: buildProductCardImageUrl(primaryImage.publicId),
          altText: createImageAltText(product, primaryImage),
        }
      : undefined,
    cartProduct: product,
  };
}

export async function getRugProductDetailByParams(input: {
  style: string;
  slug: string;
  repository?: ProductRepository;
}): Promise<RugProductDetailPageViewModel | null> {
  const repository = input.repository ?? createProductRepository();
  const product = await repository.getBySlug(input.slug);

  if (!product || product.type !== "rug") {
    return null;
  }

  if (normalizeSlug(product.rugStyle) !== normalizeSlug(input.style)) {
    return null;
  }

  const allProducts = await repository.listAll();

  return createProductDetailPageViewModel(
    product,
    allProducts,
  ) as RugProductDetailPageViewModel;
}

export async function getCategoryProductDetailByParams(input: {
  category: string;
  slug: string;
  repository?: ProductRepository;
}): Promise<ProductDetailPageViewModel | null> {
  const repository = input.repository ?? createProductRepository();
  const product = await repository.getBySlug(input.slug);

  if (!product || product.category !== input.category) {
    return null;
  }

  const allProducts = await repository.listAll();

  return createProductDetailPageViewModel(product, allProducts);
}

/**
 * Where a product URL that did not resolve should 301 to, or null for a real 404.
 * Matches the current slug first (wrong category or style segment in the request),
 * then any slug the product used before.
 */
export async function getProductRedirectPathForSlug(input: {
  slug: string;
  repository?: ProductRepository;
}): Promise<string | null> {
  const repository = input.repository ?? createProductRepository();
  const product =
    (await repository.getBySlug(input.slug)) ?? (await repository.getByPreviousSlug(input.slug));

  return product ? getProductRoutePath(product) : null;
}

function createCatalogProductCardViewModel(product: Product): CatalogProductCardViewModel {
  const primaryImage = getPrimaryImage(product);
  const secondaryImage = getSecondaryImage(product, primaryImage?.id);

  return {
    id: product.id,
    href: getProductRoutePath(product),
    name: createDisplayProductTitle(product),
    displayName: createProductCardDisplayName(product),
    dimensionsLabel: createProductCardDimensionsLabel(product),
    sizeBucket: getProductSizeBucket(product),
    subtitle: createProductSubtitle(product),
    category: product.category,
    availability: getProductAvailability(product),
    type: product.type,
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    compareAtPriceUsdLabel: getCompareAtPriceUsdLabel(product),
    ...(product.type === "rug" ? createRugFacetFields(product) : {}),
    createdAt: product.createdAt,
    description: normalizeDimensionSeparators(product.description),
    routePattern: getProductRoutePattern(product),
    badge: getProductBadgeLabel(product),
    primaryImage: primaryImage
      ? {
          src: buildProductCardImageUrl(primaryImage.publicId),
          publicId: primaryImage.publicId,
          altText: createImageAltText(product, primaryImage),
        }
      : undefined,
    secondaryImage: secondaryImage
      ? {
          src: buildProductCardImageUrl(secondaryImage.publicId),
          publicId: secondaryImage.publicId,
          altText: createImageAltText(product, secondaryImage),
        }
      : undefined,
  };
}

/** Type/Region filter keys and searchable names for a rug card. */
function createRugFacetFields(product: RugProduct) {
  const { typeSlug, regionSlugs } = getRugFacetSlugs(product);
  const display = getRugTaxonomyDisplay(product);

  return {
    rugTypeSlug: typeSlug,
    rugRegionSlugs: regionSlugs,
    rugFacetText: [display.typeLabel, display.regionLabel].filter(Boolean).join(" ") || undefined,
  };
}

function buildProductCardImageUrl(publicId: string) {
  return buildCloudinaryUrl(publicId, {
    transformation: { c: "limit", w: 1000, f: "auto", q: "auto" },
  });
}

function createProductCardDisplayName(product: Product) {
  return getProductCardName({
    name: product.name,
    type: product.type,
    category: product.category,
    regionName: product.type === "rug" ? product.region?.name : undefined,
    cardName: product.cardName,
  });
}

function createProductDetailPageViewModel(
  product: Product,
  allProducts: Product[],
): RugProductDetailPageViewModel | MultiUnitProductDetailPageViewModel {
  const related = createProductLinks(
    allProducts.filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.category === product.category || candidate.type === product.type),
    ),
    3,
  );
  const recentlyViewed = createProductLinks(
    allProducts.filter((candidate) => candidate.id !== product.id).slice().reverse(),
    2,
  );
  const similarRugs = createRecommendedProductCards(product, allProducts);
  const gallery = createProductGallery(product);
  const crossSellRecommendations = createCrossSellRecommendationCards(
    product,
    allProducts,
    new Set(similarRugs.map((card) => card.id)),
  );

  const baseViewModel = {
    id: product.id,
    catalogNumber: product.catalogNumber ?? "Catalog number pending",
    slug: product.slug,
    name: product.name,
    subtitle: createProductSubtitle(product),
    category: product.category,
    availability: getProductAvailability(product),
    description: createProductDescriptionLead(product),
    descriptionSections: createProductDescriptionSections(product),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    type: product.type,
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    compareAtPriceUsdLabel: getCompareAtPriceUsdLabel(product),
    gallery: gallery.items,
    ogImageAlt: gallery.ogImageAlt,
    palette: createProductPalette(product),
    materialLabel: product.materials.join(", "),
    originLabel: getDisplayOrigin(product),
    detailSections: createProductDetailSections(product),
    similarRugs,
    crossSellRecommendations,
    related,
    recentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  };

  if (product.type === "rug") {
    return {
      ...baseViewModel,
      type: "rug",
      ...pickRugTaxonomyLabels(product),
      ...getRugFacetSlugs(product),
      quantityLabel: "1",
      dimensionsLabel: formatRugDimensions(product),
      placementNote: createRugPlacementNote(product),
      weightLabel: formatRugWeight(product),
      cartProduct: product,
    };
  }

  return {
    ...baseViewModel,
    type: "multiUnit",
    dimensionsCm: product.dimensionsCm,
    variants: product.variants.map((variant) => ({
      ...variant,
      name: normalizeDimensionSeparators(variant.name),
    })),
    quantityMin: 1,
    inventoryState: getInventoryState(product),
    inventoryMessage: createInventoryMessage(product),
    variantLabel: product.variants.length ? "Variant" : undefined,
    notifyMeLabel: product.notifyMeEnabled ? "Notify me when available" : undefined,
    cartProduct: product,
  };
}

function pickRugTaxonomyLabels(product: RugProduct) {
  const display = getRugTaxonomyDisplay(product);

  return {
    typeLabel: display.typeLabel,
    regionLabel: display.regionLabel,
  };
}

function getPrimaryImage(product: Product) {
  const heroImage = product.images.find((image) => image.role === "hero");

  return heroImage ?? product.images[0] ?? null;
}

function getSecondaryImage(product: Product, primaryImageId?: string) {
  const sortedImages = product.images
    .filter((image) => image.mediaType === "image" && image.publicId.trim() && image.id !== primaryImageId)
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const preferredImage = sortedImages.find((image) =>
    ["styled", "detail", "gallery", "scale", "motif"].includes(image.role),
  );

  return preferredImage ?? sortedImages[0] ?? null;
}

function createProductLinks(products: Product[], count: number): ProductLinkViewModel[] {
  return products.slice(0, count).map((product) => ({
    title: createDisplayProductTitle(product),
    categoryLabel: getProductBadgeLabel(product),
    href: getProductRoutePath(product),
  }));
}

function createRecommendedProductCards(
  product: Product,
  allProducts: Product[],
): CatalogProductCardViewModel[] {
  const rankedProducts = allProducts
    .filter((candidate) => isRecommendableCandidate(product, candidate))
    .map((candidate) => ({
      product: candidate,
      score: getRecommendationScore(product, candidate),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.product.priceUsd - left.product.priceUsd;
    })
    .slice(0, 4)
    .map((item) => item.product);

  // No fallback past the ranked list: it already draws from every category,
  // so falling short of 4 means the catalog has no other available pieces —
  // padding with sold or out-of-stock items would be dishonest merchandising.
  return rankedProducts.map(createCatalogProductCardViewModel);
}

function isRecommendableCandidate(
  product: Product,
  candidate: Product,
) {
  return candidate.id !== product.id && getProductAvailability(candidate) === "available";
}

function getRecommendationScore(
  product: Product,
  candidate: Product,
) {
  let score = getProductSimilarityScore(product, candidate);

  if (product.type === "multiUnit" && candidate.category !== product.category) {
    score += getCompanionCategoryBoost(product.category, candidate.category);
  }

  return score;
}

function getProductSimilarityScore(product: Product, candidate: Product) {
  let score = 0;

  if (product.category === candidate.category) {
    score += 6;
  }

  if (product.type === "rug" && candidate.type === "rug") {
    const productFacets = getRugFacetSlugs(product);
    const candidateFacets = getRugFacetSlugs(candidate);

    if (productFacets.regionSlugs.some((slug) => candidateFacets.regionSlugs.includes(slug))) {
      score += 5;
    }

    if (productFacets.typeSlug && productFacets.typeSlug === candidateFacets.typeSlug) {
      score += 3;
    }
  }

  if (product.type === candidate.type) {
    score += 3;
  }

  if (product.origin === candidate.origin) {
    score += 2;
  }

  const materialOverlap = product.materials.filter((material) => candidate.materials.includes(material)).length;
  score += materialOverlap * 2;

  score += getPriceProximityBoost(product, candidate);

  return score;
}

function getPriceProximityBoost(product: Product, candidate: Product) {
  if (product.priceUsd <= 0) {
    return 0;
  }

  const priceDeltaRatio = Math.abs(product.priceUsd - candidate.priceUsd) / product.priceUsd;

  if (priceDeltaRatio <= 0.15) {
    return 2;
  }

  if (priceDeltaRatio <= 0.35) {
    return 1;
  }

  return 0;
}

function getCompanionCategoryBoost(
  currentCategory: ProductCategory,
  candidateCategory: ProductCategory,
) {
  const companionRanks = getCompanionCategoryOrder(currentCategory);
  const companionIndex = companionRanks.indexOf(candidateCategory);

  if (companionIndex === -1) {
    return 0;
  }

  return Math.max(3 - companionIndex, 1);
}

function createCrossSellRecommendationCards(
  product: Product,
  allProducts: Product[],
  excludeProductIds: ReadonlySet<string>,
): CatalogProductCardViewModel[] {
  const crossSellProducts = getCrossSellCategoryOrder(product.category).flatMap((category) =>
    allProducts.filter(
      (candidate) =>
        candidate.category === category &&
        !excludeProductIds.has(candidate.id) &&
        isRecommendableCandidate(product, candidate),
    ),
  );

  return crossSellProducts.slice(0, 4).map(createCatalogProductCardViewModel);
}

// The primary upsell categories come first; when the catalog is too thin
// to fill the section from those alone, top up from the remaining companion
// categories, with the product's own category as the last resort (the
// similar-products section already covers it). Products excluded via
// excludeProductIds (already shown as similar products) never reappear here,
// and every card must be an available, in-stock piece — the section simply
// stays short when the catalog cannot honestly fill it.
function getCrossSellCategoryOrder(category: ProductCategory): ProductCategory[] {
  const primaryOrder = getUpsellCategoryOrder(category);
  const backfillOrder = getCompanionCategoryOrder(category).filter(
    (companionCategory) => !primaryOrder.includes(companionCategory),
  );

  return [...primaryOrder, ...backfillOrder, category];
}

function getCompanionCategoryOrder(category: ProductCategory) {
  const categoryOrder: Record<ProductCategory, ProductCategory[]> = {
    rugs: ["vintage", "poufs", "pillows", "decor"],
    vintage: ["rugs", "poufs", "pillows", "decor"],
    poufs: ["pillows", "decor", "rugs", "vintage"],
    pillows: ["poufs", "decor", "rugs", "vintage"],
    decor: ["pillows", "poufs", "rugs", "vintage"],
  };

  return categoryOrder[category];
}

function createProductDetailSections(product: Product) {
  return createProductDescriptionSections(product);
}

function createProductDescriptionLead(product: Product) {
  if (product.type === "rug") {
    return createRugHeroDescription(product);
  }

  return getFirstSentence(product.description) || `${getDisplayProductName(product.name)} from Morocco.`;
}

function createRugHeroDescription(product: Extract<Product, { type: "rug" }>) {
  const titleAndDescription = `${product.name} ${product.description}`;
  const construction = getRugConstructionLabel({ ...product, regionName: product.region?.name }, product.name)
    .replace(/\s+Rug$/u, "")
    .toLowerCase();
  const color = removeConstructionFromColor(getPrimaryColorFromTitle(product.name)).toLowerCase();
  const ground = color ? `${color} ground` : "wool ground";

  if (/pile\s+motifs?/iu.test(titleAndDescription)) {
    return normalizeDimensionSeparators(
      `A ONE OF A KIND Moroccan ${construction} with 40+ individually hand-knotted pile motifs raised above the surface, each motif sitting as a small three-dimensional object on a warm ${ground}. The field reads quiet from across the room and detailed up close.`,
    ).replace(/\s+/gu, " ");
  }

  const firstSentence = getFirstSentence(product.description);
  const material = product.materials.join(", ").toLowerCase();
  const feature = getRugFeatureLabel(product.name).toLowerCase().replace(/^with\s+/u, "");
  const featureText = feature ? ` with ${feature}` : "";

  return normalizeDimensionSeparators(
    `${firstSentence || `A ONE OF A KIND Moroccan ${construction}${featureText} in ${material}.`} Selected for texture, scale, and exact-piece character, with final color confirmed in ${storePromise.approvalMedia} before you are charged.`,
  ).replace(/\s+/gu, " ");
}

function createProductDescriptionSections(product: Product): ProductDetailSectionViewModel[] {
  return [
    {
      title: "Condition",
      body: createConditionDescription(product),
    },
    {
      title: "Provenance",
      body: createProvenanceDescription(product),
    },
    {
      title: "Care",
      body: createCareDescription(product),
    },
  ].filter((section) => section.body.trim().length > 0);
}

function createProvenanceDescription(product: Product) {
  const provenance = normalizeDimensionSeparators(product.provenanceNote?.trim() || "");
  // Rugs use the Region field only ("Glaoui, Taznakht"); no Region, no line.
  // The Tradition line is gone: it guessed construction from the title, and
  // the Type row now states it.
  const region =
    product.type === "rug"
      ? getRugTaxonomyDisplay(product).regionLabel
      : cleanLegacyAttributionText(product.attributionRegion);
  const confidence = product.attributionConfidence?.trim();
  const showConfidence = confidence && confidence.toLowerCase() !== "not stated";
  const regionLine = region ? (showConfidence ? `Region: ${region} (${confidence})` : `Region: ${region}`) : "";

  return [provenance, regionLine].filter(Boolean).join("\n");
}

function createConditionDescription(product: Product) {
  const conditionNote = normalizeDimensionSeparators(product.conditionNote?.trim() || "");
  return conditionNote;
}

function createCareDescription(product: Product) {
  const careNote = normalizeDimensionSeparators(product.careNote?.trim() || "");

  if (careNote) {
    return careNote;
  }

  if (product.type === "rug") {
    return "Vacuum without a beater bar. Rotate every 6 months. Spot clean with cold water and mild wool soap. Professional wool cleaning recommended for set-in stains. Avoid prolonged direct sunlight.";
  }

  return "Dust or vacuum gently. Spot clean with cold water and mild soap. Avoid harsh chemical cleaners and prolonged direct sunlight.";
}

// Longest-side thresholds used only by the product-page placement note copy
// (accent under ~6 ft, mid-size 6-8 ft, large 8 ft +). The shop's size filter
// deliberately does NOT use these — see getProductSizeBucket below.
const rugAccentMaxCm = 180;
const rugMidSizeMaxCm = 240;

/**
 * Size tiers are classified from footprint area (length x width), not from a
 * single side. Moroccan rugs cluster tightly by length (the live catalog runs
 * 137-175 cm for 23 of 36 pieces) while width swings from 67 cm to 169 cm, so
 * longest-side banding collapses almost the whole catalog into one tier.
 * Area uses both dimensions and tracks the question a shopper is actually
 * asking — how much floor does this cover.
 *
 * Rug cutoffs below map to ~13 / 17 / 21 / 32 sq ft and split the live rug +
 * vintage inventory 7 / 9 / 11 / 5 / 4 across the five tiers.
 */
const rugSizeAreaCutoffsCm2 = [12_000, 16_000, 20_000, 30_000] as const;

/**
 * Non-rug pieces (poufs, pillows, decor) live on a much smaller natural scale,
 * so they run the same five-tier ladder against their own cutoffs. Calibrated
 * against live stock: cactus-silk pillows (~1_760-2_120 cm2) land in "small",
 * rug-material poufs (61 x 61 = 3_721 cm2) land in "medium".
 */
const multiUnitSizeAreaCutoffsCm2 = [1_500, 2_500, 5_000, 10_000] as const;

const sizeBucketLadder = [
  "accent",
  "small",
  "medium",
  "large",
  "oversized",
] as const satisfies readonly CatalogProductSizeBucket[];

function getProductSizeBucket(product: Product): CatalogProductSizeBucket | undefined {
  const dimensionsCm = product.dimensionsCm;

  if (!dimensionsCm || !(dimensionsCm.length > 0) || !(dimensionsCm.width > 0)) {
    return undefined;
  }

  const areaCm2 = dimensionsCm.length * dimensionsCm.width;
  const cutoffs = product.type === "rug" ? rugSizeAreaCutoffsCm2 : multiUnitSizeAreaCutoffsCm2;
  const tierIndex = cutoffs.findIndex((cutoffCm2) => areaCm2 <= cutoffCm2);

  return tierIndex === -1 ? "oversized" : sizeBucketLadder[tierIndex];
}

function createRugPlacementNote(product: Extract<Product, { type: "rug" }>) {
  const longestSideCm = Math.max(product.dimensionsCm.length, product.dimensionsCm.width);

  if (longestSideCm <= rugAccentMaxCm) {
    return "Size reads as an accent rug - works entryway, bedside, under a console, or layered over a larger flatweave.";
  }

  if (longestSideCm <= rugMidSizeMaxCm) {
    return "Size works well in a compact sitting area, beside a bed, in an entry, or layered where a full-room rug would feel heavy.";
  }

  return "Size can anchor a seating area, bedroom, or dining zone; confirm exact placement against your room measurements before payment is captured.";
}

function getFirstSentence(value: string) {
  return normalizeDimensionSeparators(value.trim().split(/(?<=[.!?])\s+/u)[0] ?? "").trim();
}

function createProductGallery(product: Product) {
  const images = product.images
    .filter((image) => image.mediaType === "image" && image.publicId.trim())
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const storedAltTexts = images.map((image) => image.altText.trim());

  return {
    items: images.map((image, index) => createGalleryItem(product, image, index, storedAltTexts)),
    // A social card shows the first photo on its own, so its alt has no
    // place in the gallery to give.
    ogImageAlt: images[0] ? createGalleryAltText(product, images[0], storedAltTexts) : product.name,
  };
}

function createProductPalette(product: Product) {
  const palette =
    product.type === "rug" && product.palette.length ? product.palette : [...defaultRugPalette];

  return palette.slice(0, 5).map((hex, index) => {
    const normalizedHex = hex.toUpperCase();

    return {
      hex: normalizedHex,
      label: paletteLabelsByHex.get(normalizedHex) ?? `Accent ${index + 1}`,
    };
  });
}

function createGalleryItem(
  product: Product,
  image: MediaAsset,
  index: number,
  storedAltTexts: readonly string[],
) {
  return {
    id: image.id,
    label: galleryRoleCopy[image.role]?.label ?? `Photo ${index + 1}`,
    src: buildCloudinaryUrl(image.publicId, {
      transformation: { w: 1600, q: "auto", f: "auto" },
    }),
    thumbSrc: buildCloudinaryUrl(image.publicId, {
      transformation: { c: "fill", g: "auto", w: 240, h: 240, q: "auto", f: "auto" },
    }),
    zoomSrc: buildCloudinaryUrl(image.publicId, {
      transformation: { w: 2600, q: "auto", f: "auto" },
    }),
    width: image.width,
    height: image.height,
    publicId: image.publicId,
    altText: createGalleryAltText(
      product,
      image,
      storedAltTexts,
      storedAltTexts.length > 1 ? `photo ${index + 1} of ${storedAltTexts.length}` : undefined,
    ),
    role: image.role,
  };
}

/**
 * One alt per photo. The admin fills every image's alt with the product name, so
 * stored text only stands when it was written for this photo: not the name and
 * not shared with another photo of the piece. Otherwise the alt is the name, what
 * the photo shows when its role says, and its place in the gallery when given.
 */
function createGalleryAltText(
  product: Product,
  image: MediaAsset,
  storedAltTexts: readonly string[],
  position?: string,
) {
  const storedAltText = image.altText.trim();
  const isWrittenForThisPhoto =
    !isPlaceholderAltText(storedAltText) &&
    storedAltText.toLowerCase() !== product.name.trim().toLowerCase() &&
    storedAltTexts.filter((altText) => altText === storedAltText).length === 1;

  if (isWrittenForThisPhoto) {
    return storedAltText;
  }

  const productName = parseProductTitle(getDisplayProductName(product.name)).name;

  return [productName, galleryRoleCopy[image.role]?.view, position].filter(Boolean).join(", ");
}

/** Alt text a person wrote, or the product name plus what the photo shows. */
function createImageAltText(product: Product, image: MediaAsset) {
  const storedAltText = image.altText.trim();

  if (!isPlaceholderAltText(storedAltText)) {
    return storedAltText;
  }

  const productName = parseProductTitle(getDisplayProductName(product.name)).name;

  return `${productName}, ${galleryRoleCopy[image.role]?.view ?? "photo"}`;
}


const galleryRoleCopy: Record<CloudinaryAssetRole, { label: string; view: string } | null> = {
  hero: { label: "Full product view", view: "full view" },
  styled: { label: "Styled in room", view: "styled in a room" },
  detail: { label: "Detail view", view: "close-up detail" },
  edge: { label: "Edge detail", view: "edge detail" },
  back: { label: "Reverse side", view: "reverse side" },
  scale: { label: "Scale reference", view: "shown for scale" },
  motif: { label: "Motif detail", view: "motif close-up" },
  gallery: null,
  thumbnail: null,
  featured: null,
  og: null,
};

function createDisplayProductTitle(product: Product) {
  return createProductCardDisplayName(product);
}

function createProductCardDimensionsLabel(product: Product) {
  if (product.type === "rug") {
    return formatRugDimensionsShort(product);
  }

  const { measures } = parseProductTitle(product.name);

  return measures.length ? measures.join(dimensionSeparator) : undefined;
}

function createProductSubtitle(product: Product) {
  return [createProductCardDimensionsLabel(product), createPrimaryMaterialsLabel(product)]
    .filter(Boolean)
    .join(" · ");
}

function createPrimaryMaterialsLabel(product: Product) {
  const materials = product.materials.map(humanizeProductToken).filter(Boolean);

  if (!materials.length) {
    return undefined;
  }

  return materials.map((label, index) => (index === 0 ? label : label.toLowerCase())).join(" & ");
}

function formatRugDimensionsShort(product: Extract<Product, { type: "rug" }>) {
  const imperialLabel = [
    formatCmAsFeetInches(product.dimensionsCm.length),
    formatCmAsFeetInches(product.dimensionsCm.width),
  ].join(dimensionSeparator);
  const metricLabel = formatCentimetersShort(product.dimensionsCm);

  return metricLabel ? `${imperialLabel} (${metricLabel})` : imperialLabel;
}

function formatCentimetersShort(dimensionsCm: { length: number; width: number } | undefined) {
  const length = dimensionsCm?.length;
  const width = dimensionsCm?.width;

  if (!length || !width) {
    return undefined;
  }

  return `${Math.round(length)}${dimensionSeparator}${Math.round(width)} cm`;
}

function createInventoryMessage(product: Extract<Product, { type: "multiUnit" }>) {
  switch (getInventoryState(product)) {
    case "outOfStock":
      return "Out of stock.";
    case "lowStock":
      return `Only ${product.inventory} left.`;
    case "inStock":
      return "In stock.";
  }
}


/** The origin field as buyers see it: "-type" qualifiers stripped. */
function getDisplayOrigin(product: Product) {
  return cleanLegacyAttributionText(product.origin) ?? "Morocco";
}
