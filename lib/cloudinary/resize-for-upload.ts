import { computeTargetSize, shouldSkipResize } from "@/lib/cloudinary/upload-resize.mjs";

const MAX_EDGE = 2600;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    try {
      if (shouldSkipResize({ type: file.type, width: bitmap.width, height: bitmap.height, size: file.size })) {
        return file;
      }

      const target = computeTargetSize(bitmap.width, bitmap.height, MAX_EDGE);
      if (!target.width || !target.height) return file;

      const canvas: HTMLCanvasElement | OffscreenCanvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(target.width, target.height)
          : Object.assign(document.createElement("canvas"), {
              width: target.width,
              height: target.height,
            });
      const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
      if (!context) return file;
      context.drawImage(bitmap, 0, 0, target.width, target.height);

      const blob = await canvasToWebp(canvas);
      if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

      const stem = file.name.replace(/\.[^.]*$/u, "");
      return new File([blob], `${stem}.webp`, { type: "image/webp", lastModified: file.lastModified });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}

function canvasToWebp(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob | null> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/webp", quality: 0.85 });
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
  });
}
