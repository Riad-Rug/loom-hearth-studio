import { cloudinaryFolders } from "@/lib/cloudinary/types";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  baseDeliveryUrl: string;
  folders: typeof cloudinaryFolders;
};

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";

  return {
    cloudName,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    baseDeliveryUrl: cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload`
      : "https://res.cloudinary.com/demo/image/upload",
    folders: cloudinaryFolders,
  };
}

export function hasCloudinaryEnv() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME);
}
