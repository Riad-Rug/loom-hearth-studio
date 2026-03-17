"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProductRoutePath } from "@/lib/catalog/helpers";
import type { Product } from "@/types/domain";

const CART_STORAGE_KEY = "loom-hearth-studio.cart";

export type CartStoreItem = {
  id: string;
  href: string;
  productId: string;
  productType: Product["type"];
  name: string;
  priceUsd: number;
  quantity: number;
  variantName?: string;
};

type AddCartProductInput = {
  product: Product;
  quantity: number;
  variantName?: string;
};

type CartContextValue = {
  items: CartStoreItem[];
  itemCount: number;
  subtotalUsd: number;
  shippingUsd: 0;
  totalUsd: number;
  addProduct: (input: AddCartProductInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStoreItem[]>([]);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        return;
      }

      setItems(parsedValue.filter(isCartStoreItem));
    } catch {
      // Ignore malformed local cart data and continue with an empty cart.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalUsd = items.reduce(
      (runningTotal, item) => runningTotal + item.priceUsd * item.quantity,
      0,
    );

    return {
      items,
      itemCount: items.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
      subtotalUsd,
      shippingUsd: 0,
      totalUsd: subtotalUsd,
      addProduct(input) {
        setItems((currentItems) => addProductToCart(currentItems, input));
      },
      removeItem(id) {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      },
      updateQuantity(id, quantity) {
        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.id !== id) {
              return [item];
            }

            if (item.productType === "rug") {
              return [{ ...item, quantity: 1 }];
            }

            if (quantity < 1) {
              return [];
            }

            return [{ ...item, quantity }];
          }),
        );
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return value;
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getCartItemLabel(item: CartStoreItem) {
  return item.productType === "rug" ? "Type A rug" : "Type B multi-unit";
}

export function getCartItemQuantityRule(item: CartStoreItem) {
  return item.productType === "rug" ? "Locked to 1" : "Quantity controls allowed";
}

function addProductToCart(
  currentItems: CartStoreItem[],
  input: AddCartProductInput,
): CartStoreItem[] {
  const nextItem = createCartStoreItem(input);
  const existingItemIndex = currentItems.findIndex((item) => item.id === nextItem.id);

  if (existingItemIndex === -1) {
    return [...currentItems, nextItem];
  }

  return currentItems.map((item, index) => {
    if (index !== existingItemIndex) {
      return item;
    }

    if (item.productType === "rug") {
      return { ...item, quantity: 1 };
    }

    return {
      ...item,
      quantity: item.quantity + nextItem.quantity,
    };
  });
}

function createCartStoreItem({
  product,
  quantity,
  variantName,
}: AddCartProductInput): CartStoreItem {
  const normalizedQuantity = product.type === "rug" ? 1 : Math.max(1, quantity);

  return {
    id:
      product.type === "multiUnit" && variantName
        ? `${product.id}::${variantName}`
        : product.id,
    href: getProductRoutePath(product),
    productId: product.id,
    productType: product.type,
    name: product.name,
    priceUsd: product.priceUsd,
    quantity: normalizedQuantity,
    variantName,
  };
}

function isCartStoreItem(value: unknown): value is CartStoreItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CartStoreItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.href === "string" &&
    typeof candidate.productId === "string" &&
    (candidate.productType === "rug" || candidate.productType === "multiUnit") &&
    typeof candidate.name === "string" &&
    typeof candidate.priceUsd === "number" &&
    typeof candidate.quantity === "number" &&
    (candidate.variantName === undefined || typeof candidate.variantName === "string")
  );
}

export const cartFoundationTodos = {
  promoCodes:
    "TODO: Promo code validation remains placeholder-only until pricing and checkout integrations are implemented.",
  checkout:
    "TODO: Replace client-only cart state with server-backed checkout and order creation when the Stripe flow is implemented.",
} as const;
