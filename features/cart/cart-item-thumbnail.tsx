import { getCartItemLabel, type CartStoreItem } from "@/features/cart/cart-items";

type CartItemThumbnailProps = {
  item: CartStoreItem;
  className: string;
};

export function CartItemThumbnail({ item, className }: CartItemThumbnailProps) {
  return (
    <div className={className}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.imageAlt || item.name}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span>{getCartItemLabel(item)}</span>
      )}
    </div>
  );
}
