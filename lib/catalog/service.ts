import {
  formatProductPriceUsd,
  formatRugDimensions,
  formatRugWeight,
  getInventoryMessage,
  getInventoryState,
  getProductBadgeLabel,
  getProductMerchandisingNote,
  getProductRoutePath,
  getProductRoutePattern,
} from "@/lib/catalog/helpers";
import type {
  CatalogProductCardViewModel,
  MultiUnitProductDetailPageViewModel,
  ProductLinkViewModel,
  RugProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { createProductRepository, type ProductRepository } from "@/lib/db/repositories/product-repository";
import type { Product, ProductCategory } from "@/types/domain";

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

  if (normalizeSlug(product.rugStyle) !== input.style) {
    return null;
  }

  const allProducts = await repository.listAll();

  return createProductDetailPageViewModel(product, allProducts) as RugProductDetailPageViewModel;
}

export async function getCategoryProductDetailByParams(input: {
  category: string;
  slug: string;
  repository?: ProductRepository;
}): Promise<MultiUnitProductDetailPageViewModel | null> {
  const repository = input.repository ?? createProductRepository();
  const product = await repository.getBySlug(input.slug);

  if (
    !product ||
    product.type !== "multiUnit" ||
    product.category !== input.category
  ) {
    return null;
  }

  const allProducts = await repository.listAll();

  return createProductDetailPageViewModel(
    product,
    allProducts,
  ) as MultiUnitProductDetailPageViewModel;
}

function createCatalogProductCardViewModel(product: Product): CatalogProductCardViewModel {
  const primaryImage = getPrimaryImage(product);

  return {
    id: product.id,
    href: getProductRoutePath(product),
    name: product.name,
    category: product.category,
    type: product.type,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    description: product.description,
    merchandisingNote: getProductMerchandisingNote(product),
    routePattern: getProductRoutePattern(product),
    badge: getProductBadgeLabel(product),
    primaryImage: primaryImage
      ? {
          publicId: primaryImage.publicId,
          altText: primaryImage.altText,
        }
      : undefined,
  };
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

  const baseViewModel = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    type: product.type,
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    gallery: product.images
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((image, index) => ({
        id: image.id,
        label: `Gallery image ${String(index + 1).padStart(2, "0")}`,
        publicId: image.publicId,
        altText: image.altText,
      })),
    materialsLabel: product.materials.join(", "),
    originLabel: product.origin,
    detailSections: createProductDetailSections(product),
    related,
    recentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  };

  if (product.type === "rug") {
    return {
      ...baseViewModel,
      type: "rug",
      rugStyle: product.rugStyle,
      quantityLabel: "1",
      dimensionsLabel: formatRugDimensions(product),
      weightLabel: formatRugWeight(product),
      cartProduct: product,
    };
  }

  return {
    ...baseViewModel,
    type: "multiUnit",
    variants: product.variants,
    quantityMin: 1,
    inventoryState: getInventoryState(product),
    inventoryMessage: getInventoryMessage(product),
    variantLabel: product.variants.length ? "Variant" : undefined,
    notifyMeLabel: product.notifyMeEnabled ? "Notify me when available" : undefined,
    cartProduct: product,
  };
}

function getPrimaryImage(product: Product) {
  const heroImage = product.images.find((image) => image.role === "hero");

  return heroImage ?? product.images[0] ?? null;
}

function createProductLinks(products: Product[], count: number): ProductLinkViewModel[] {
  return products.slice(0, count).map((product) => ({
    title: product.name,
    categoryLabel: getProductBadgeLabel(product),
    href: getProductRoutePath(product),
  }));
}

function createProductDetailSections(product: Product) {
  const sections = [
    {
      title: "Materials & origin",
      body: `${product.materials.join(", ")}. Crafted in ${product.origin}.`,
    },
  ];

  if (product.type === "rug") {
    sections.push({
      title: "Dimensions & care",
      body: `${formatRugDimensions(product)}. Professional cleaning recommended for one-of-one launch rugs.`,
    });
  } else {
    sections.push({
      title: "Inventory & care",
      body:
        product.inventory > 0
          ? `${product.inventory} units are currently allocated for launch. Spot clean or dry clean as appropriate for the material.`
          : "This item is currently out of stock. Notify-me presentation remains visible while broader inventory workflows stay out of scope.",
    });
  }

  sections.push({
    title: "Shipping & returns",
    body:
      "Launch shipping is limited to the United States and is fixed at $0.00. Broader shipping-provider and fulfillment integrations remain out of scope.",
  });

  return sections;
}
