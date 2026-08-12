"use client";

import type { ReactNode } from "react";

import type { CloudinaryUploadTarget } from "@/lib/cloudinary/types";
import { useCloudinarySignedUpload, type CloudinaryUploadOutcome } from "@/lib/cloudinary/use-signed-upload";

import styles from "./admin.module.css";

type CloudinaryUploadButtonProps = {
  target: CloudinaryUploadTarget;
  slotId: string;
  disabled?: boolean;
  onUploaded: (result: CloudinaryUploadOutcome) => void;
  onError?: (message: string) => void;
  children?: ReactNode;
};

/**
 * Click-to-upload-to-Cloudinary button: a hidden file input inside a styled
 * label, backed by useCloudinarySignedUpload(). Shared between the product
 * admin form and the blog admin editor so both surfaces get the same signed
 * upload flow and status handling.
 */
export function CloudinaryUploadButton(props: CloudinaryUploadButtonProps) {
  const { state, upload } = useCloudinarySignedUpload();
  const isUploading = state.status === "uploading" && state.slotId === props.slotId;
  const message = state.slotId === props.slotId ? state.message : null;

  return (
    <div className={styles.stack}>
      <label className={styles.navLink}>
        <span>{isUploading ? "Uploading image..." : props.children ?? "Upload image"}</span>
        <input
          accept="image/*"
          disabled={props.disabled || state.status === "uploading"}
          hidden
          type="file"
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            try {
              const result = await upload(file, props.target, props.slotId);
              props.onUploaded(result);
            } catch (error) {
              props.onError?.(error instanceof Error ? error.message : "Image upload failed.");
            } finally {
              event.target.value = "";
            }
          }}
        />
      </label>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
