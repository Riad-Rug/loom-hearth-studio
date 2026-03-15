export type CartPlaceholderItem =
  | {
      id: string;
      type: "rug";
      name: string;
      categoryLabel: "Type A rug";
      priceUsdLabel: string;
      quantity: 1;
      quantityRule: "Locked to 1";
    }
  | {
      id: string;
      type: "multiUnit";
      name: string;
      categoryLabel: "Type B multi-unit";
      priceUsdLabel: string;
      quantity: number;
      quantityRule: "Quantity controls allowed";
    };

export const cartPlaceholderItems: CartPlaceholderItem[] = [
  {
    id: "cart-rug-atlas-morning",
    type: "rug",
    name: "Atlas Morning Rug",
    categoryLabel: "Type A rug",
    priceUsdLabel: "$0.00",
    quantity: 1,
    quantityRule: "Locked to 1",
  },
  {
    id: "cart-pouf-clay-knot",
    type: "multiUnit",
    name: "Clay Knot Pouf",
    categoryLabel: "Type B multi-unit",
    priceUsdLabel: "$0.00",
    quantity: 2,
    quantityRule: "Quantity controls allowed",
  },
] as const;

export const cartSummary = {
  subtotalUsdLabel: "$0.00",
  shippingUsdLabel: "$0.00",
  totalUsdLabel: "$0.00",
  promoPlaceholder: "Enter promo code",
} as const;
