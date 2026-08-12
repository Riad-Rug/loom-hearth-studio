"use client";

import { useState } from "react";

import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import type {
  CloudinaryBrowserUploadResult,
  CloudinarySignedUploadPayload,
  CloudinaryUploadTarget,
} from "@/lib/cloudinary/types";

export type CloudinaryUploadStatus = "idle" | "uploading" | "success" | "error";

export type CloudinaryUploadState = {
  status: CloudinaryUploadStatus;
  message: string | null;
  slotId: string | null;
};

export type CloudinaryUploadOutcome = {
  publicId: string;
  url: string;
  fileName: string;
  width?: number;
  height?: number;
};

const initialUploadState: CloudinaryUploadState = {
  status: "idle",
  message: null,
  slotId: null,
};

/**
 * Shared client-side flow for signed Cloudinary uploads: request a signature
 * from /api/admin/cloudinary/upload-signature, POST the file straight to
 * Cloudinary, then resolve a usable delivery URL. Extracted from the product
 * admin form so the blog admin editor (and any future upload surface) can
 * reuse the exact same mechanics.
 */
export function useCloudinarySignedUpload() {
  const [state, setState] = useState<CloudinaryUploadState>(initialUploadState);

  async function upload(
    file: File,
    target: CloudinaryUploadTarget,
    slotId: string,
  ): Promise<CloudinaryUploadOutcome> {
    setState({
      status: "uploading",
      message: `Uploading ${file.name}...`,
      slotId,
    });

    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/upload-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
        }),
      });

      const signatureResult = (await signatureResponse.json()) as
        | {
            status: "ready";
            payload: CloudinarySignedUploadPayload;
          }
        | {
            status: "forbidden" | "invalid-input" | "configuration-error";
            message: string;
          };

      if (!signatureResponse.ok || signatureResult.status !== "ready") {
        throw new Error(
          "message" in signatureResult
            ? signatureResult.message
            : "Upload signing failed before a Cloudinary payload was returned.",
        );
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signatureResult.payload.apiKey);
      uploadFormData.append("timestamp", String(signatureResult.payload.timestamp));
      uploadFormData.append("folder", signatureResult.payload.folder);
      uploadFormData.append("signature", signatureResult.payload.signature);

      const uploadResponse = await fetch(signatureResult.payload.uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await readUploadErrorMessage(uploadResponse);

        throw new Error(
          uploadErrorText || "Cloudinary upload failed before media metadata was returned.",
        );
      }

      const uploadResult = (await uploadResponse.json()) as CloudinaryBrowserUploadResult;
      const url = uploadResult.secure_url || buildCloudinaryUrl(uploadResult.public_id);

      setState({
        status: "success",
        message: `${file.name} uploaded.`,
        slotId,
      });

      return {
        publicId: uploadResult.public_id,
        url,
        fileName: file.name,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";

      setState({
        status: "error",
        message,
        slotId,
      });

      throw error instanceof Error ? error : new Error(message);
    }
  }

  return { state, upload };
}

async function readUploadErrorMessage(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return "";
  }

  try {
    const parsed = JSON.parse(responseText) as
      | {
          error?: {
            message?: string;
          };
        }
      | undefined;

    return parsed?.error?.message ?? responseText;
  } catch {
    return responseText;
  }
}
