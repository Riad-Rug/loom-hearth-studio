import {
  productCategoryOptions,
  productStatusOptions,
  productTypeOptions,
} from "@/lib/catalog/product-validation";
import type { Product } from "@/types/domain";

export type AdminProductFormValues = {
  id?: string;
  type: Product["type"];
  slug: string;
  name: string;
  category: Product["category"];
  description: string;
  priceUsd: string;
  images: Product["images"];
  materials: string[];
  palette: string[];
  origin: string;
  status: Product["status"];
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
