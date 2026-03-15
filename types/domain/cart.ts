import type { Product, ProductVariant } from "@/types/domain/product";

export type CartItem = {
  id: string;
  productId: Product["id"];
  productType: Product["type"];
  name: string;
  slug: string;
  priceUsd: number;
  quantity: number;
  variant?: ProductVariant;
};

export type Cart = {
  id: string;
  items: CartItem[];
  promoCode?: string;
  shippingUsd: 0;
  subtotalUsd: number;
  totalUsd: number;
  currency: "USD";
};
