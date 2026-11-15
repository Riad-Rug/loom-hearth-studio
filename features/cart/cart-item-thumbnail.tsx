"use client";

import { useState } from "react";

import { getCartItemLabel, type CartStoreItem } from "@/features/cart/cart-items";

type CartItemThumbnailProps = {
  item: CartStoreItem;
  className: string;
};

export function CartItemThumbnail({ item, className }: CartItemThumbnailProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  return (
    <div className={className}>
      {item.imageUrl && item.imageUrl !== failedImageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.imageAlt || item.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailedImageUrl(item.imageUrl ?? null)}
        />
      ) : (
        <span>{getCartItemLabel(item)}</span>
      )}
    </div>
  );
}
