import type { CloudinaryImageAsset } from "@/lib/cloudinary/types";

export function toCloudinaryImageAsset(input: {
  id: string;
  publicId: string;
  altText: string;
  width?: number;
  height?: number;
  role: CloudinaryImageAsset["role"];
  folder?: CloudinaryImageAsset["folder"];
}) {
  return {
    ...input,
    mediaType: "image" as const,
    sortOrder: 0,
  };
}
