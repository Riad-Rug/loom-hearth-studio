declare module "@/lib/cloudinary/default-delivery.mjs" {
  export const cloudinaryTransformationPrefix: RegExp;
  export function withDefaultDelivery(src: string): string;
}
