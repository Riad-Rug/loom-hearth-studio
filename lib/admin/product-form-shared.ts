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
export const adminProductStatusOptions = productStatusOptions;
export const adminProductCategoryOptions = productCategoryOptions;
