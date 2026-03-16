import type { MediaAsset } from "@/types/domain";

export const cloudinaryFolders = {
  homepage: "loom-hearth/homepage",
  categories: "loom-hearth/categories",
  productsRugs: "loom-hearth/products/rugs",
  productsMultiUnit: "loom-hearth/products/multi-unit",
  blog: "loom-hearth/blog",
  lookbook: "loom-hearth/lookbook",
  og: "loom-hearth/og",
} as const;

export type CloudinaryFolder =
  (typeof cloudinaryFolders)[keyof typeof cloudinaryFolders];

export type CloudinaryTransformation = {
  c?: "fill" | "fit" | "limit" | "scale" | "crop";
  f?: "auto" | "webp" | "jpg" | "png";
  q?: "auto" | number;
  w?: number;
  h?: number;
  g?: "auto" | "center";
  dpr?: "auto" | number;
};

export type CloudinaryDeliveryOptions = {
  transformation?: CloudinaryTransformation;
};

export type CloudinaryImageAsset = MediaAsset & {
  mediaType: "image";
  folder?: CloudinaryFolder;
};

export interface MediaService {
  upload(fileName: string, folder: CloudinaryFolder): Promise<MediaAsset>;
  delete(publicId: string): Promise<void>;
  buildUrl(publicId: string, transformation?: string): string;
}

export const cloudinaryServiceTodo =
  "TODO: Implement Cloudinary upload and transformation helpers once environment wiring is in place. Do not add API calls until integration details are validated.";
