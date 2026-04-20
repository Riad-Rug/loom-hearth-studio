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
  ProductDetailSectionViewModel,
  ProductLinkViewModel,
  ProductSpecificationViewModel,
  ProductSupportPanelViewModel,
  RugProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import type { CloudinaryTransformation } from "@/lib/cloudinary/types";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createProductRepository, type ProductRepository } from "@/lib/db/repositories/product-repository";
import type { MediaAsset, Product, ProductCategory, RugProduct } from "@/types/domain";

const productTitleMaxLength = 60;
const dimensionSeparator = " × ";
const rugGalleryShotPlan = [
  {
    role: "hero",
    label: "Full flat-lay",
    altSuffix: "shown as a full flat-lay",
    transformation: { c: "fill", g: "auto", w: 1600, h: 1200, q: "auto", f: "auto" },
  },
  {
    role: "styled",
    label: "Styled in room",
    altSuffix: "styled in a room setting",
    transformation: { c: "fill", g: "auto", w: 1600, h: 1200, q: "auto", f: "auto" },
  },
  {
    role: "detail",
    label: "Knot density close-up",
    altSuffix: "close-up showing knot density and pile texture",
    transformation: { c: "fill", g: "auto", w: 1400, h: 1050, q: "auto", f: "auto" },
  },
  {
    role: "edge",
    label: "Fringe and edge detail",
    altSuffix: "fringe and edge detail",
    transformation: { c: "fill", g: "auto", w: 1400, h: 1050, q: "auto", f: "auto" },
  },
  {
    role: "back",
    label: "Reverse side",
    altSuffix: "reverse side construction detail",
    transformation: { c: "fill", g: "auto", w: 1400, h: 1050, q: "auto", f: "auto" },
  },
  {
    role: "scale",
    label: "Scale reference",
    altSuffix: "shown with scale reference",
    transformation: { c: "fill", g: "auto", w: 1600, h: 1200, q: "auto", f: "auto" },
  },
  {
    role: "motif",
    label: "Motif detail",
    altSuffix: "detail of one woven motif",
    transformation: { c: "fill", g: "auto", w: 1400, h: 1050, q: "auto", f: "auto" },
  },
] as const satisfies ReadonlyArray<{
  role: MediaAsset["role"];
  label: string;
  altSuffix: string;
  transformation: CloudinaryTransformation;
}>;

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

export async function listHomepageFeaturedProductCards(input?: {
  limit?: number;
  repository?: ProductRepository;
}): Promise<CatalogProductCardViewModel[]> {
  const repository = input?.repository ?? createProductRepository();
  const limit = input?.limit ?? 4;
  const products = await repository.listHomepageFeatured(limit);

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

  if (normalizeSlug(product.rugStyle) !== normalizeSlug(input.style)) {
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
  const secondaryImage = getSecondaryImage(product, primaryImage?.id);

  return {
    id: product.id,
    href: getProductRoutePath(product),
    name: createDisplayProductTitle(product),
    subtitle: createProductSubtitle(product),
    category: product.category,
    type: product.type,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    description: normalizeDimensionSeparators(product.description),
    merchandisingNote: normalizeDimensionSeparators(getProductMerchandisingNote(product)),
    routePattern: getProductRoutePattern(product),
    badge: getProductBadgeLabel(product),
    primaryImage: primaryImage
      ? {
          src: buildCloudinaryUrl(primaryImage.publicId),
          publicId: primaryImage.publicId,
          altText: primaryImage.altText,
        }
      : undefined,
    secondaryImage: secondaryImage
      ? {
          src: buildCloudinaryUrl(secondaryImage.publicId),
          publicId: secondaryImage.publicId,
          altText: secondaryImage.altText,
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
  const similarRugs = createSimilarRugCards(product, allProducts);

  const baseViewModel = {
    id: product.id,
    slug: product.slug,
    name: createDisplayProductTitle(product),
    subtitle: createProductSubtitle(product),
    category: product.category,
    description: createProductDescriptionLead(product),
    descriptionSections: createProductDescriptionSections(product),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    type: product.type,
    priceUsd: product.priceUsd,
    priceUsdLabel: formatProductPriceUsd(product.priceUsd),
    gallery: createProductGallery(product),
    materialLabel: product.materials.join(", "),
    originLabel: product.origin,
    techniqueLabel: product.type === "rug" ? "Handwoven" : undefined,
    specifications: createProductSpecifications(product),
    supportPanels: createProductSupportPanels(product),
    detailSections: createProductDetailSections(product),
    similarRugs,
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
    variants: product.variants.map((variant) => ({
      ...variant,
      name: normalizeDimensionSeparators(variant.name),
    })),
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
      ? product.verificationNotes.filter(Boolean).map(normalizeDimensionSeparators)
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
      ? product.shippingNotes.filter(Boolean).map(normalizeDimensionSeparators)
      : [
          "Ships from Morocco.",
          "Free shipping applies to the United States, Canada, and Australia.",
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
      body: normalizeDimensionSeparators(product.conditionNote.trim()),
      items: [],
    });
  }

  return panels;
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

function createSimilarRugCards(product: Product, allProducts: Product[]): CatalogProductCardViewModel[] {
  const rugs = allProducts.filter(
    (candidate): candidate is RugProduct => candidate.type === "rug" && candidate.id !== product.id,
  );

  if (!rugs.length) {
    return [];
  }

  const rankedRugs = rugs
    .map((candidate) => ({
      product: candidate,
      score: getSimilarityScore(product, candidate),
    }))
    .sort((left, right) => right.score - left.score)
    .map((item) => item.product);

  return rankedRugs.slice(0, 4).map(createCatalogProductCardViewModel);
}

function getSimilarityScore(product: Product, candidate: RugProduct) {
  let score = 0;

  if (product.category === candidate.category) {
    score += 4;
  }

  if (product.type === "rug" && product.rugStyle === candidate.rugStyle) {
    score += 5;
  }

  if (product.origin === candidate.origin) {
    score += 2;
  }

  const materialOverlap = product.materials.filter((material) => candidate.materials.includes(material)).length;
  score += materialOverlap;

  return score;
}

function createProductDetailSections(product: Product) {
  return createProductDescriptionSections(product);
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

function createProductDescriptionLead(product: Product) {
  if (product.type === "rug") {
    const construction = getRugConstructionLabel(product, product.name)
      .replace(/\s+Rug$/u, "")
      .toLowerCase();
    const motifText = /pile\s+motifs?/iu.test(`${product.name} ${product.description}`)
      ? " with 40+ hand-knotted pile motifs"
      : getRugFeatureLabel(product.name).toLowerCase();

    return normalizeDimensionSeparators(
      `A one-of-one ${construction}${motifText ? ` ${motifText.replace(/^with\s+/u, "with ")}` : ""}.`,
    ).replace(/\s+/gu, " ");
  }

  return getFirstSentence(product.description) || `${getDisplayProductName(product.name)} from Morocco.`;
}

function createProductDescriptionSections(product: Product): ProductDetailSectionViewModel[] {
  if (product.type === "rug") {
    return [
      {
        title: "Materials",
        body: `${product.materials.join(", ")} from ${product.origin}. ${getFirstSentence(product.description)}`,
      },
      {
        title: "Construction",
        body: createRugConstructionDescription(product),
      },
      {
        title: "Condition",
        body:
          normalizeDimensionSeparators(product.conditionNote?.trim() || "") ||
          "One-of-one handmade rugs can show natural variation in pile height, edge line, and color. Any condition notes are reviewed against the exact piece before payment is captured.",
      },
      {
        title: "Provenance",
        body: createProvenanceDescription(product),
      },
      {
        title: "What to expect",
        body:
          "After inquiry, the studio confirms the actual rug with you in natural, warm, and cool light before payment is captured. Shipping details, destination fit, and any final questions are reviewed first.",
      },
    ];
  }

  return [
    {
      title: "Materials",
      body: `${product.materials.join(", ")} from ${product.origin}. ${getFirstSentence(product.description)}`,
    },
    {
      title: "Construction",
      body: "Selected as a supporting handcrafted piece for layered interiors, with availability reviewed before payment is captured.",
    },
    {
      title: "Condition",
      body:
        normalizeDimensionSeparators(product.conditionNote?.trim() || "") ||
        "Handmade pieces can show natural variation in color, texture, and finish.",
    },
    {
      title: "Provenance",
      body: createProvenanceDescription(product),
    },
    {
      title: "What to expect",
      body:
        "Use the inquiry flow to confirm availability, destination, lead time, and delivery conditions before payment is captured.",
    },
  ];
}

function createRugConstructionDescription(product: Extract<Product, { type: "rug" }>) {
  const construction = getRugConstructionLabel(product, product.name).toLowerCase();
  const feature = getRugFeatureLabel(product.name).toLowerCase();
  const dimensions = formatRugDimensions(product);
  const weight = formatRugWeight(product);

  return normalizeDimensionSeparators(
    `Handwoven as a ${construction}${feature ? ` ${feature}` : ""}. Dimensions: ${dimensions}. Weight: ${weight}.`,
  );
}

function createProvenanceDescription(product: Product) {
  const provenance = normalizeDimensionSeparators(product.provenanceNote?.trim() || "");
  const region = product.attributionRegion?.trim();
  const confidence = product.attributionConfidence?.trim();
  const parts = [
    provenance || `Sourced across Morocco and listed with origin noted as ${product.origin}.`,
    region ? `Region: ${region}.` : "",
    confidence ? `Attribution: ${confidence}.` : "",
  ].filter(Boolean);

  return parts.join(" ");
}

function getFirstSentence(value: string) {
  return normalizeDimensionSeparators(value.trim().split(/(?<=[.!?])\s+/u)[0] ?? "").trim();
}

function createProductGallery(product: Product) {
  const images = product.images
    .filter((image) => image.mediaType === "image" && image.publicId.trim())
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);

  if (product.type !== "rug") {
    return images.map((image, index) => createGalleryItem(image, index));
  }

  const roleImages = new Map<MediaAsset["role"], MediaAsset>();

  for (const image of images) {
    if (!roleImages.has(image.role)) {
      roleImages.set(image.role, image);
    }
  }

  const plannedGallery = rugGalleryShotPlan.flatMap((shot, index) => {
    const source =
      roleImages.get(shot.role) ??
      (shot.role === "hero" ? images[0] : undefined) ??
      images[index] ??
      images[index % images.length];

    if (!source) {
      return [];
    }

    const hasExactRole = source.role === shot.role;

    return {
      id: hasExactRole ? source.id : `${source.id}-${shot.role}-crop`,
      label: shot.label,
      src: buildCloudinaryUrl(source.publicId, { transformation: shot.transformation }),
      publicId: source.publicId,
      altText: source.altText.trim()
        ? source.altText
        : `${createDisplayProductTitle(product)} ${shot.altSuffix}`,
      role: shot.role,
      isDerived: !hasExactRole,
    };
  });

  const plannedIds = new Set(plannedGallery.map((image) => image.id));
  const additionalImages = images
    .map((image, index) => createGalleryItem(image, plannedGallery.length + index))
    .filter((image) => !plannedIds.has(image.id));

  return [...plannedGallery, ...additionalImages];
}

function createGalleryItem(image: MediaAsset, index: number) {
  return {
    id: image.id,
    label: createGalleryLabel(image, index),
    src: buildCloudinaryUrl(image.publicId, {
      transformation: { c: "fill", g: "auto", w: 1600, h: 1200, q: "auto", f: "auto" },
    }),
    publicId: image.publicId,
    altText: image.altText,
    role: image.role,
  };
}

function createGalleryLabel(image: MediaAsset, index: number) {
  if (image.role === "hero") {
    return "Full product view";
  }

  if (image.role === "styled") {
    return "Styled in room";
  }

  if (image.role === "detail") {
    return "Detail view";
  }

  if (image.role === "edge") {
    return "Edge detail";
  }

  if (image.role === "back") {
    return "Reverse side";
  }

  if (image.role === "scale") {
    return "Scale reference";
  }

  if (image.role === "motif") {
    return "Motif detail";
  }

  return `Gallery image ${String(index + 1).padStart(2, "0")}`;
}

function createDisplayProductTitle(product: Product) {
  const displayName = normalizeDimensionSeparators(getDisplayProductName(product.name));
  const titleWithoutDimensions = removeProductDimensions(displayName);

  if (product.type !== "rug") {
    return limitProductTitle(titleWithoutDimensions);
  }

  if (displayName.length <= productTitleMaxLength && displayName === titleWithoutDimensions) {
    return limitProductTitle(titleWithoutDimensions);
  }

  return limitProductTitle(createCondensedRugTitle(product, titleWithoutDimensions));
}

function createCondensedRugTitle(product: Extract<Product, { type: "rug" }>, title: string) {
  const color = removeConstructionFromColor(getPrimaryColorFromTitle(title));
  const construction = getRugConstructionLabel(product, title);
  const feature = getRugFeatureLabel(title);

  if (color && construction && feature) {
    return `${color} ${construction} ${feature}`;
  }

  if (color && construction) {
    return `${color} ${construction}`;
  }

  return title
    .replace(/\bMixed[-\s]Technique\b/giu, "")
    .replace(/\bMoroccan\b/giu, "")
    .replace(/\bGround\b/giu, "")
    .replace(/\bScattered\b/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function createProductSubtitle(product: Product) {
  if (product.type === "rug") {
    return [
      formatRugDimensionsShort(product),
      createMaterialOriginLabel(product),
      "One-of-one",
    ].join(" | ");
  }

  return [
    createMaterialOriginLabel(product),
    createInventoryStateLabel(product),
  ].join(" | ");
}

function removeProductDimensions(title: string) {
  return title
    .replace(/\b\d{1,2}'\s*\d{0,2}"?\s*(?:[x×-]\s*)?\d{1,2}'\s*\d{0,2}"?(?=\s|$)/gu, " ")
    .replace(
      /\b\d{1,3}(?:\.\d+)?\s*(?:x|×|by)\s*\d{1,3}(?:\.\d+)?\s*(?:cm|in|inch|inches|ft|feet)?\b/giu,
      " ",
    )
    .replace(/\b\d{1,3}(?:\.\d+)?\s*(?:cm|in|inch|inches|ft|feet)\b/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function limitProductTitle(title: string) {
  const normalizedTitle = title.replace(/\s+/gu, " ").trim();

  if (normalizedTitle.length <= productTitleMaxLength) {
    return normalizedTitle;
  }

  const truncated = normalizedTitle.slice(0, productTitleMaxLength + 1);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return (
    lastSpaceIndex > 36
      ? truncated.slice(0, lastSpaceIndex)
      : normalizedTitle.slice(0, productTitleMaxLength)
  ).trim();
}

function getPrimaryColorFromTitle(title: string) {
  const groundColor = title.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+Ground\b/u)?.[1];

  if (groundColor) {
    return groundColor;
  }

  const colorMatch = title.match(
    /\b(Ivory|Cream|Natural|Sand|Oat|Beige|Brown|Terracotta|Clay|Rust|Red|Black|Charcoal|Indigo|Blue|Green|Olive|Gold|Ochre|White)\b/iu,
  )?.[1];

  return colorMatch ? toTitleCase(colorMatch) : "";
}

function removeConstructionFromColor(value: string) {
  return value
    .replace(/\b(?:Flatweave|Beni|Ourain|Kilim|Vintage|Moroccan|Rug)\b/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function getRugConstructionLabel(product: Extract<Product, { type: "rug" }>, title: string) {
  if (/flat\s*weave|flatweave/iu.test(title)) {
    return "Flatweave";
  }

  if (/beni\s+ourain/iu.test(title) || /beni\s+ourain/iu.test(product.rugStyle)) {
    return "Beni Ourain Rug";
  }

  if (/kilim/iu.test(title) || /kilim/iu.test(product.rugStyle)) {
    return "Kilim Rug";
  }

  if (/vintage/iu.test(title) || product.category === "vintage") {
    return "Vintage Rug";
  }

  const styleLabel = humanizeProductToken(product.rugStyle);

  return styleLabel ? `${styleLabel} Rug` : "Moroccan Rug";
}

function getRugFeatureLabel(title: string) {
  if (/pile\s+motifs?/iu.test(title)) {
    return "with Pile Motifs";
  }

  if (/diamond/iu.test(title)) {
    return "with Diamond Motifs";
  }

  if (/stripe|striped/iu.test(title)) {
    return "with Stripes";
  }

  if (/border/iu.test(title)) {
    return "with Border Detail";
  }

  return "";
}

function formatRugDimensionsShort(product: Extract<Product, { type: "rug" }>) {
  return [
    formatFeetAndInchesShort(product.dimensionsCm.length),
    formatFeetAndInchesShort(product.dimensionsCm.width),
  ].join(dimensionSeparator);
}

function formatFeetAndInchesShort(valueCm: number) {
  const totalInches = Math.round(valueCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${feet}'${inches}"`;
}

function createMaterialOriginLabel(product: Product) {
  const materialLabel = product.materials.map(humanizeProductToken).filter(Boolean).join(" and ");
  const originLabel = humanizeProductToken(
    product.type === "rug" && product.rugStyle ? product.rugStyle : product.origin,
  );

  if (!materialLabel) {
    return originLabel;
  }

  if (!originLabel) {
    return materialLabel;
  }

  return `${originLabel} ${materialLabel.toLowerCase()}`;
}

function humanizeProductToken(value: string) {
  return toTitleCase(value.replace(/[-_]+/gu, " ").trim());
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/gu, (character) => character.toUpperCase())
    .replace(/\bUsa\b/gu, "USA");
}

function normalizeDimensionSeparators(value: string) {
  return value.replace(
    /(?:\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)\s+){1,2}\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)/giu,
    (match) => {
      const tokens =
        match.match(
          /\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)/giu,
        ) ?? [];

      return tokens.length > 1 ? tokens.join(dimensionSeparator) : match;
    },
  );
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
