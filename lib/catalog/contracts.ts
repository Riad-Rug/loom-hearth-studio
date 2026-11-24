import type { ProductAvailability } from "@/lib/catalog/availability";
import type { LaunchInventoryState } from "@/lib/catalog/helpers";
import type {
  MultiUnitProduct,
  Product,
  ProductCategory,
  ProductVariant,
  RugProduct,
} from "@/types/domain";

// Five size tiers, classified from the product's footprint area (length x width)
// rather than a single side — see getProductSizeBucket in lib/catalog/service.ts
// for the per-category cutoffs and the data they were calibrated against.
export type CatalogProductSizeBucket =
  | "accent"
  | "small"
  | "medium"
  | "large"
  | "oversized";

export type CatalogProductCardViewModel = {
  id: string;
  href: string;
  name: string;
  displayName: string;
  dimensionsLabel?: string;
  sizeBucket?: CatalogProductSizeBucket;
  subtitle: string;
  category: ProductCategory;
  availability: ProductAvailability;
  type: Product["type"];
  priceUsd: number;
  priceUsdLabel: string;
  /** ISO time the listing was created, for a "Newest" sort. */
  createdAt?: string;
  /** Same shape as the product page palette, for a colour filter and search. */
  palette?: Array<{
    hex: string;
    label: string;
  }>;
  description: string;
  routePattern: string;
  badge: string;
  primaryImage?: {
    src: string;
    publicId: string;
    altText: string;
  };
  secondaryImage?: {
    src: string;
    publicId: string;
    altText: string;
  };
};

export type ProductLinkViewModel = {
  title: string;
  categoryLabel: string;
  href: string;
};

export type ProductDetailSectionViewModel = {
  title: string;
  body: string;
};

type ProductDetailPageViewModelBase = {
  id: string;
  catalogNumber: string;
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  availability: ProductAvailability;
  description: string;
  descriptionSections: ProductDetailSectionViewModel[];
  seoTitle: string;
  seoDescription: string;
  type: Product["type"];
  priceUsd: number;
  priceUsdLabel: string;
  gallery: Array<{
    id: string;
    label: string;
    src: string;
    thumbSrc: string;
    zoomSrc: string;
    width?: number;
    height?: number;
    publicId: string;
    altText: string;
    role: string;
    isDerived?: boolean;
  }>;
  /** Alt for gallery[0] as the og:image, which shows it alone, so with no gallery position. */
  ogImageAlt: string;
  palette: Array<{
    hex: string;
    label: string;
  }>;
  materialLabel: string;
  originLabel: string;
  detailSections: ProductDetailSectionViewModel[];
  similarRugs: CatalogProductCardViewModel[];
  crossSellRecommendations: CatalogProductCardViewModel[];
  related: ProductLinkViewModel[];
  recentlyViewed: ProductLinkViewModel[];
  sharePlatforms: string[];
};

export type RugProductDetailPageViewModel = ProductDetailPageViewModelBase & {
  type: "rug";
  rugStyle: RugProduct["rugStyle"];
  /** Specifications "Type" row; undefined hides the row. */
  typeLabel?: string;
  /** Specifications "Region" row; undefined hides the row. */
  regionLabel?: string;
  /** Set only from the new Type/Region fields, for JSON-LD. */
  schemaTypeLabel?: string;
  schemaRegionLabel?: string;
  quantityLabel: "1";
  dimensionsLabel: string;
  placementNote: string;
  weightLabel: string;
  cartProduct: RugProduct;
};

export type MultiUnitProductDetailPageViewModel = ProductDetailPageViewModelBase & {
  type: "multiUnit";
  dimensionsCm?: { length: number; width: number };
  variants: ProductVariant[];
  quantityMin: 1;
  inventoryState: LaunchInventoryState;
  inventoryMessage: string;
  variantLabel?: string;
  notifyMeLabel?: string;
  cartProduct: MultiUnitProduct;
};

export type ProductDetailPageViewModel =
  | RugProductDetailPageViewModel
  | MultiUnitProductDetailPageViewModel;

export type LaunchCheckoutValidationIssue = {
  code:
    | "unsupported-checkout-mode"
    | "unsupported-currency"
    | "unsupported-market"
    | "missing-shipping-address"
    | "empty-cart"
    | "product-not-found"
    | "product-type-mismatch"
    | "slug-mismatch"
    | "name-mismatch"
    | "product-unavailable"
    | "variant-not-found"
    | "invalid-rug-quantity"
    | "invalid-quantity"
    | "insufficient-inventory"
    | "price-mismatch"
    | "invalid-shipping"
    | "invalid-tax"
    | "subtotal-mismatch"
    | "total-mismatch"
    | "invalid-promo"
    | "customer-email-mismatch";
  message: string;
  lineItemId?: string;
  productId?: string;
};

export type LaunchCheckoutValidationResult = {
  status: "ready" | "invalid";
  validatedRequest: import("@/lib/stripe/contracts").StripeCheckoutSessionRequest | null;
  issues: LaunchCheckoutValidationIssue[];
  message: string;
};
