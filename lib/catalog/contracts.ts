import type { LaunchInventoryState } from "@/lib/catalog/helpers";
import type {
  MultiUnitProduct,
  Product,
  ProductCategory,
  ProductVariant,
  RugProduct,
} from "@/types/domain";

export type CatalogProductCardViewModel = {
  id: string;
  href: string;
  name: string;
  category: ProductCategory;
  type: Product["type"];
  priceUsdLabel: string;
  description: string;
  merchandisingNote: string;
  routePattern: string;
  badge: string;
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
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  type: Product["type"];
  priceUsd: number;
  priceUsdLabel: string;
  gallery: Array<{
    id: string;
    label: string;
  }>;
  materialsLabel: string;
  originLabel: string;
  detailSections: ProductDetailSectionViewModel[];
  related: ProductLinkViewModel[];
  recentlyViewed: ProductLinkViewModel[];
  sharePlatforms: string[];
};

export type RugProductDetailPageViewModel = ProductDetailPageViewModelBase & {
  type: "rug";
  rugStyle: RugProduct["rugStyle"];
  quantityLabel: "1";
  dimensionsLabel: string;
  weightLabel: string;
  cartProduct: RugProduct;
};

export type MultiUnitProductDetailPageViewModel = ProductDetailPageViewModelBase & {
  type: "multiUnit";
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
