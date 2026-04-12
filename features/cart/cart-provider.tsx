"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCategoryLabel, getProductRoutePath } from "@/lib/catalog/helpers";
import type { Product } from "@/types/domain";

const CART_STORAGE_KEY = "loom-hearth-studio.cart";

export type CartStoreItem = {
  id: string;
  href: string;
  productId: string;
  productType: Product["type"];
  productCategory: Product["category"];
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

type AppliedPromo = {
  code: string;
  discountUsd: number;
  message: string;
};

type CartContextValue = {
  items: CartStoreItem[];
  itemCount: number;
  subtotalUsd: number;
  discountUsd: number;
  promoCode: string | null;
  promoMessage: string | null;
  shippingUsd: 0;
  totalUsd: number;
  addProduct: (input: AddCartProductInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyPromoCode: (code: string) => Promise<{ status: "success" | "error"; message: string }>;
  removePromoCode: () => void;
};

type StoredCartState = {
  items: CartStoreItem[];
  promo: AppliedPromo | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStoreItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as unknown;

      if (Array.isArray(parsedValue)) {
        setItems(parsedValue.filter(isCartStoreItem));
        return;
      }

      if (parsedValue && typeof parsedValue === "object") {
        const candidate = parsedValue as Partial<StoredCartState>;
        if (Array.isArray(candidate.items)) {
          setItems(candidate.items.filter(isCartStoreItem));
        }
        if (candidate.promo && isAppliedPromo(candidate.promo)) {
          setAppliedPromo(candidate.promo);
        }
      }
    } catch {
      // Ignore malformed local cart data and continue with an empty cart.
    }
  }, []);

  useEffect(() => {
    const storedState: StoredCartState = {
      items,
      promo: appliedPromo,
    };

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedState));
  }, [appliedPromo, items]);

  useEffect(() => {
    if (!appliedPromo?.code || !items.length) {
      if (!items.length && appliedPromo) {
        setAppliedPromo(null);
      }
      return;
    }

    let cancelled = false;
    void validatePromo(appliedPromo.code, items).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.status === "success") {
        setAppliedPromo({
          code: appliedPromo.code,
          discountUsd: result.discountUsd,
          message: result.message,
        });
        return;
      }

      setAppliedPromo(null);
    });

    return () => {
      cancelled = true;
    };
  }, [items, appliedPromo?.code]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalUsd = roundCurrency(
      items.reduce((runningTotal, item) => runningTotal + item.priceUsd * item.quantity, 0),
    );
    const discountUsd = Math.min(appliedPromo?.discountUsd ?? 0, subtotalUsd);

    return {
      items,
      itemCount: items.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
      subtotalUsd,
      discountUsd,
      promoCode: appliedPromo?.code ?? null,
      promoMessage: appliedPromo?.message ?? null,
      shippingUsd: 0,
      totalUsd: roundCurrency(subtotalUsd - discountUsd),
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
      async applyPromoCode(code) {
        const result = await validatePromo(code, items);

        if (result.status === "success") {
          setAppliedPromo({
            code: result.code,
            discountUsd: result.discountUsd,
            message: result.message,
          });
          return { status: "success", message: result.message };
        }

        setAppliedPromo(null);
        return { status: "error", message: result.message };
      },
      removePromoCode() {
        setAppliedPromo(null);
      },
    };
  }, [appliedPromo, items]);

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
  return getCategoryLabel(item.productCategory);
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
    productCategory: product.category,
    name: product.name,
    priceUsd: product.priceUsd,
    quantity: normalizedQuantity,
    variantName,
  };
}

async function validatePromo(code: string, items: CartStoreItem[]) {
  const subtotalUsd = roundCurrency(
    items.reduce((runningTotal, item) => runningTotal + item.priceUsd * item.quantity, 0),
  );

  const response = await fetch("/api/promos/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      subtotalUsd,
      items: items.map((item) => ({
        productId: item.productId,
        productCategory: item.productCategory,
        quantity: item.quantity,
        priceUsd: item.priceUsd,
      })),
    }),
  });

  const data = (await response.json()) as {
    status: "valid" | "invalid";
    promoCode: string;
    discountUsd: number;
    message: string;
  };

  if (!response.ok || data.status !== "valid") {
    return {
      status: "error" as const,
      code: data.promoCode || code.trim().toUpperCase(),
      discountUsd: 0,
      message: data.message || "That promo code could not be applied.",
    };
  }

  return {
    status: "success" as const,
    code: data.promoCode,
    discountUsd: data.discountUsd,
    message: data.message,
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
    (candidate.productCategory === "rugs" ||
      candidate.productCategory === "vintage" ||
      candidate.productCategory === "decor" ||
      candidate.productCategory === "pillows" ||
      candidate.productCategory === "poufs") &&
    typeof candidate.name === "string" &&
    typeof candidate.priceUsd === "number" &&
    typeof candidate.quantity === "number" &&
    (candidate.variantName === undefined || typeof candidate.variantName === "string")
  );
}

function isAppliedPromo(value: unknown): value is AppliedPromo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppliedPromo>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.discountUsd === "number" &&
    typeof candidate.message === "string"
  );
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export const cartFoundationTodos = {
  checkout:
    "TODO: Replace client-only cart state with server-backed checkout and order creation when the Stripe flow is implemented.",
} as const;
