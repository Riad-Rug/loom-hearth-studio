import type { EntityStatus, MediaAsset, SeoFields } from "@/types/domain/common";

export type ProductCategory =
  | "rugs"
  | "poufs"
  | "pillows"
  | "decor"
  | "vintage";

export type ProductBase = SeoFields & {
  id: string;
  catalogNumber?: string;
  slug: string;
  name: string;
  cardName?: string;
  category: ProductCategory;
  description: string;
  priceUsd: number;
  images: MediaAsset[];
  materials: string[];
  palette: string[];
  origin: string;
  status: EntityStatus;
  provenanceNote?: string;
  sourcingNote?: string;
  attributionRegion?: string;
  attributionConfidence?: string;
  conditionNote?: string;
  ageClass?: string;
  ageBasis?: string;
  /** Pouf-only, admin-internal: what the face panels were cut from. */
  faceFabricSource?: string;
  /** Pouf-only, admin-internal: whether the design can be repeated. */
  uniquenessTier?: string;
  /** Pouf-only, admin-internal: covers cut from one source rug. */
  sourceCoverCount?: number;
  verificationNotes?: string[];
  shippingNotes?: string[];
  careNote?: string;
  dimensionsCm?: {
    length: number;
    width: number;
  };
  weightKg?: number;
  homepageFeatured: boolean;
  homepageRank: number | null;
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
