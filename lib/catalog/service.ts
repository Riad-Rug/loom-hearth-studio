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
  ProductSpecificationViewModel,
  ProductSupportPanelViewModel,
  RugProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
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

  if (!product || product.type !== "multiUnit" || product.category !== input.category) {
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
    name: getDisplayProductName(product.name),
    category: product.category,
    type: product.type,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    description: product.description,
    merchandisingNote: getProductMerchandisingNote(product),
    routePattern: getProductRoutePattern(product),
    badge: getProductBadgeLabel(product),
    primaryImage: primaryImage
      ? {
          src: buildCloudinaryUrl(primaryImage.publicId),
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
    name: getDisplayProductName(product.name),
    category: product.category,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    type: product.type,
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    gallery: product.images
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((image, index) => ({
        id: image.id,
        label: `Gallery image ${String(index + 1).padStart(2, "0")}`,
        src: buildCloudinaryUrl(image.publicId),
        publicId: image.publicId,
        altText: image.altText,
        role: image.role,
      })),
    materialLabel: product.materials.join(", "),
    originLabel: product.origin,
    techniqueLabel: product.type === "rug" ? "Handwoven" : undefined,
    specifications: createProductSpecifications(product),
    supportPanels: createProductSupportPanels(product),
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

function createProductSpecifications(product: Product): ProductSpecificationViewModel[] {
  const specs: ProductSpecificationViewModel[] = [
    { label: "Material", value: product.materials.join(", ") },
    { label: "Origin", value: product.origin },
  ];

  if (product.type === "rug") {
    specs.push(
      { label: "Technique", value: "Handwoven" },
      { label: "Dimensions", value: formatRugDimensions(product) },
      { label: "Weight", value: formatRugWeight(product) },
      { label: "Piece type", value: "One-of-one rug" },
    );
  } else {
    specs.push(
      { label: "Availability", value: createInventoryStateLabel(product) },
      { label: "Ordering", value: "Project and destination reviewed before payment capture" },
    );
  }

  if (product.attributionRegion?.trim()) {
    specs.push({ label: "Region", value: product.attributionRegion.trim() });
  }

  if (product.attributionConfidence?.trim()) {
    specs.push({ label: "Attribution", value: product.attributionConfidence.trim() });
  }

  return specs;
}

function createProductSupportPanels(product: Product): ProductSupportPanelViewModel[] {
  const provenanceItems = [
    ...(product.attributionRegion?.trim() ? [`Region: ${product.attributionRegion.trim()}`] : []),
    ...(product.attributionConfidence?.trim()
      ? [`Attribution: ${product.attributionConfidence.trim()}`]
      : []),
    `Origin noted as ${product.origin}.`,
  ];

  const verificationItems =
    product.verificationNotes?.filter(Boolean).length
      ? product.verificationNotes.filter(Boolean)
      : product.type === "rug"
        ? [
            "Product pages are structured to support exact-piece photography and close detail views.",
            "Pre-shipment verification confirms the actual rug before payment is captured.",
          ]
        : [
            "Availability and destination are reviewed before payment is captured.",
            "Additional details can be requested through the inquiry flow.",
          ];

  const shippingItems =
    product.shippingNotes?.filter(Boolean).length
      ? product.shippingNotes.filter(Boolean)
      : [
          "Ships from Morocco.",
          "Free shipping applies to the United States, Canada, Australia, and the United Kingdom.",
          "Destination and delivery conditions are confirmed before payment is captured.",
        ];

  const panels: ProductSupportPanelViewModel[] = [
    {
      id: "provenance",
      eyebrow: "Provenance",
      title: product.type === "rug" ? "Product attribution and origin" : "Collection origin and sourcing",
      body:
        product.provenanceNote?.trim() ||
        "This page is prepared to support more detailed provenance notes as final product stories, imagery, and sourcing documentation are added.",
      items: provenanceItems,
    },
    {
      id: "verification",
      eyebrow: "Verification",
      title: product.type === "rug" ? "How this piece is confirmed before shipment" : "How availability is confirmed before shipment",
      body:
        product.type === "rug"
          ? "For one-of-one rugs, the buying flow includes a final verification step before payment is captured."
          : "For multi-unit pieces, availability, destination, and delivery conditions are reviewed before payment is captured.",
      items: verificationItems,
    },
    {
      id: "shipping",
      eyebrow: "Shipping",
      title: "Shipping and delivery notes",
      body:
        "This product page supports shipping guidance and market notes without requiring final product copy to be in place yet.",
      items: shippingItems,
    },
  ];

  if (product.conditionNote?.trim()) {
    panels.push({
      id: "condition",
      eyebrow: "Condition",
      title: "Condition notes",
      body: product.conditionNote.trim(),
      items: [],
    });
  }

  return panels;
}

function getPrimaryImage(product: Product) {
  const heroImage = product.images.find((image) => image.role === "hero");

  return heroImage ?? product.images[0] ?? null;
}

function createProductLinks(products: Product[], count: number): ProductLinkViewModel[] {
  return products.slice(0, count).map((product) => ({
    title: getDisplayProductName(product.name),
    categoryLabel: getProductBadgeLabel(product),
    href: getProductRoutePath(product),
  }));
}

function createProductDetailSections(product: Product) {
  const sections = [
    {
      title: "Materials & construction",
      body:
        product.type === "rug"
          ? `${product.materials.join(", ")}. Built as a one-of-one woven piece selected for structure, scale, and material presence.`
          : `${product.materials.join(", ")}. Added to the collection as a supporting handcrafted piece for layered interiors.`,
    },
    {
      title: "Care & placement",
      body:
        product.careNote?.trim() ||
        (product.type === "rug"
          ? "Professional cleaning is recommended for one-of-one rugs. Product-specific care notes can be added here as the final catalog is published."
          : "Spot clean or dry clean as appropriate for the material. Product-specific care notes can be added here as the final catalog is published."),
    },
    {
      title: "Shipping & review",
      body:
        "Ships from Morocco with destination details confirmed before payment is captured. This section is structured to support final lead-time, customs, and delivery notes per product.",
    },
  ];

  return sections;
}

function getDisplayProductName(name: string) {
  switch (name.trim().toLowerCase()) {
    case "beni":
      return "Beni Ourain Rug";
    case "rug maroc":
      return "Rug Maroc";
    default:
      return name;
  }
}

function createInventoryStateLabel(product: Extract<Product, { type: "multiUnit" }>) {
  const inventoryState = getInventoryState(product);

  if (inventoryState === "lowStock") {
    return "Low stock";
  }

  if (inventoryState === "outOfStock") {
    return "Out of stock";
  }

  return "In stock";
}
