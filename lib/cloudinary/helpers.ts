import { getCloudinaryConfig } from "@/lib/cloudinary/config";
import type {
  CloudinaryDeliveryOptions,
  CloudinaryImageAsset,
  CloudinaryTransformation,
} from "@/lib/cloudinary/types";

function serializeTransformation(transformation: CloudinaryTransformation) {
  return Object.entries(transformation)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}_${String(value)}`)
    .join(",");
}

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryDeliveryOptions = {},
) {
  const { baseDeliveryUrl } = getCloudinaryConfig();
  const segments = [];

  if (options.transformation) {
    segments.push(serializeTransformation(options.transformation));
  }

  segments.push(publicId);

  return `${baseDeliveryUrl}/${segments.filter(Boolean).join("/")}`;
}

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
