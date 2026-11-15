import {
  productCategoryOptions,
  productStatusOptions,
  productTypeOptions,
} from "@/lib/catalog/product-validation";
import type { Product } from "@/types/domain";

export type AdminProductFormValues = {
  id?: string;
  catalogNumber: string;
  type: Product["type"];
  slug: string;
  name: string;
  cardName: string;
  category: Product["category"];
  description: string;
  priceUsd: string;
  acquisitionCostMad: string;
  images: Product["images"];
  materials: string[];
  palette: string[];
  origin: string;
  attributionRegion: string;
  attributionConfidence: string;
  provenanceNote: string;
  sourcingNote: string;
  conditionNote: string;
  ageClass: string;
  ageBasis: string;
  faceFabricSource: string;
  uniquenessTier: string;
  sourceCoverCount: string;
  insertIncluded: boolean;
  decorSubtype: string;
  objectType: string;
  makerMarksNote: string;
  verificationNotes: string[];
  shippingNotes: string[];
  careNote: string;
  status: Product["status"];
  soldAt: string;
  seoTitle: string;
  seoDescription: string;
  rugStyle: string;
  dimensionsCmLength: string;
  dimensionsCmWidth: string;
  heightCm: string;
  weightKg: string;
  fixedQuantity: string;
  inventory: string;
  lowStockThreshold: string;
  variants: Extract<Product, { type: "multiUnit" }>["variants"];
  notifyMeEnabled: boolean;
  homepageFeatured: boolean;
  homepageRank: string;
  routePath: string;
};

export const adminProductTypeOptions = productTypeOptions;
// Only an order sets "reserved", so the select never offers it; the form shows a
// reserved piece's status read-only instead.
export const adminProductStatusOptions = productStatusOptions.filter(
  (option): option is Exclude<(typeof productStatusOptions)[number], "reserved"> => option !== "reserved",
);
export const adminProductCategoryOptions = productCategoryOptions;
