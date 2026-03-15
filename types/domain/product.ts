import type { EntityStatus, MediaAsset, SeoFields } from "@/types/domain/common";

export type ProductCategory =
  | "rugs"
  | "poufs"
  | "pillows"
  | "decor"
  | "vintage";

export type ProductBase = SeoFields & {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  priceUsd: number;
  images: MediaAsset[];
  materials: string[];
  origin: string;
  status: EntityStatus;
};

export type RugProduct = ProductBase & {
  type: "rug";
  rugStyle: string;
  dimensionsCm: {
    length: number;
    width: number;
  };
  weightKg: number;
  fixedQuantity: 1;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceUsd?: number;
  inventory: number;
};

export type MultiUnitProduct = ProductBase & {
  type: "multiUnit";
  inventory: number;
  lowStockThreshold: number;
  variants: ProductVariant[];
  notifyMeEnabled: boolean;
};

export type Product = RugProduct | MultiUnitProduct;
