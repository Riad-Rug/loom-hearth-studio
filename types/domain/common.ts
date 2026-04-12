export type EntityStatus = "draft" | "active" | "archived";

export type SeoFields = {
  seoTitle: string;
  seoDescription: string;
};

export type CloudinaryAssetRole =
  | "hero"
  | "gallery"
  | "thumbnail"
  | "featured"
  | "og"
  | "lookbook"
  | "detail"
  | "back";

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
