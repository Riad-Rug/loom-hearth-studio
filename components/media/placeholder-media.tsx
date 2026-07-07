import Image from "next/image";

import { hasCloudinaryEnv } from "@/lib/cloudinary/config";
import { createPlaceholderDataUrl } from "@/lib/media/placeholder";

import styles from "./placeholder-media.module.css";

type PlaceholderMediaProps = {
  alt: string;
  aspectRatio: `${number} / ${number}`;
  label: string;
  sizes: string;
  priority?: boolean;
  tone?: "neutral" | "condition";
};

export function PlaceholderMedia({
  alt,
  aspectRatio,
  label,
  sizes,
  priority = false,
  tone = "neutral",
}: PlaceholderMediaProps) {
  const usingPlaceholderOnly = !hasCloudinaryEnv();

  return (
    <div className={styles.frame} data-tone={tone} style={{ aspectRatio }}>
      <Image
        alt={alt}
        className={styles.image}
        fill
        placeholder="empty"
        priority={priority}
        sizes={sizes}
        src={createPlaceholderDataUrl(label)}
        unoptimized={usingPlaceholderOnly}
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
