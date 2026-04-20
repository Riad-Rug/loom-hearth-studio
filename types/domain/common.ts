export type EntityStatus = "draft" | "active" | "archived";

export type SeoFields = {
  seoTitle: string;
  seoDescription: string;
};

export type CloudinaryAssetRole =
  | "hero"
  | "gallery"
  | "styled"
  | "thumbnail"
  | "featured"
  | "og"
  | "lookbook"
  | "detail"
  | "edge"
  | "back"
  | "scale"
  | "motif";

export type MediaAsset = {
  id: string;
  publicId: string;
  altText: string;
  sortOrder: number;
  role: CloudinaryAssetRole;
  mediaType: "image" | "video";
  width?: number;
  height?: number;
};
