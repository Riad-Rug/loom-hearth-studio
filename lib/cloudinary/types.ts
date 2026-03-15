import type { MediaAsset } from "@/types/domain";

export type CloudinaryFolder =
  | "loom-hearth/homepage"
  | "loom-hearth/categories"
  | "loom-hearth/products/rugs"
  | "loom-hearth/products/multi-unit"
  | "loom-hearth/blog"
  | "loom-hearth/lookbook"
  | "loom-hearth/og";

export interface MediaService {
  upload(fileName: string, folder: CloudinaryFolder): Promise<MediaAsset>;
  delete(publicId: string): Promise<void>;
  buildUrl(publicId: string, transformation?: string): string;
}

export const cloudinaryServiceTodo =
  "TODO: Implement Cloudinary upload and transformation helpers once environment wiring is in place.";
