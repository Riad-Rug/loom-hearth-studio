"use client";

import { formatUsd, useCart } from "@/features/cart/cart-provider";
import { getFreeShippingProgress } from "@/features/cart/free-shipping";

import styles from "./free-shipping-progress.module.css";

export function FreeShippingProgress({ className }: { className?: string }) {
  const { subtotalUsd, discountUsd } = useCart();
  const progress = getFreeShippingProgress(subtotalUsd - discountUsd);
  const ratio = progress.status === "qualified" ? 1 : progress.ratio;

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <p className={styles.message}>
        {progress.status === "qualified"
          ? "Your order ships free."
          : `Add ${formatUsd(progress.remainingUsd)} more for free shipping.`}
      </p>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
