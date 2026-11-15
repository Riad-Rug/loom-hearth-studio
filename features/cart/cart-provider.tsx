"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addProductToCart,
  getAddedCartLine,
  limitCartItems,
  parseStoredCartItem,
  setCartItemQuantity,
  toCommerceItem,
  type AddCartProductInput,
  type CartLineLimit,
  type CartLineStock,
  type CartStoreItem,
} from "@/features/cart/cart-items";
import { trackCommerceEvent } from "@/lib/analytics/commerce-tracking";
import type { ProductAvailability } from "@/lib/catalog/availability";
import { calculateShippingUsd } from "@/lib/order/shipping";

const CART_STORAGE_KEY = "loom-hearth-studio.cart";

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
  shippingUsd: number;
  totalUsd: number;
  // A line not checked against the catalog yet counts as available; checkout
  // validates every line again before the card is authorized.
  getItemAvailability: (item: CartStoreItem) => ProductAvailability;
  hasUnavailableItems: boolean;
  // The cart lowered this line to the units left since the shopper last set it.
  isQuantityReduced: (item: CartStoreItem) => boolean;
  addProduct: (input: AddCartProductInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  limitItems: (limits: CartLineLimit[]) => void;
  // A line keeps the price it was added at until this sets the price charged now; it also re-reads stock.
  refreshItems: (prices: ReadonlyArray<{ id: string; priceUsd: number }>) => void;
  applyPromoCode: (code: string) => Promise<{ status: "success" | "error"; message: string }>;
  removePromoCode: () => void;
  clearCart: () => void;
};

type StoredCartState = {
  items: CartStoreItem[];
  promo: AppliedPromo | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStoreItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [stockByLineId, setStockByLineId] = useState<Partial<Record<string, CartLineStock>>>({});
  const [reducedLineIds, setReducedLineIds] = useState<ReadonlySet<string>>(new Set());
  const [stockReadCount, setStockReadCount] = useState(0);
  // Quantities are part of the key so a changed line is checked against fresh stock.
  const stockRequestKey = JSON.stringify(
    items
      .map((item) => ({ id: item.id, productId: item.productId, variantName: item.variantName, quantity: item.quantity }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  );

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as unknown;

      if (Array.isArray(parsedValue)) {
        setItems(parsedValue.filter(parseStoredCartItem));
        return;
      }

      if (parsedValue && typeof parsedValue === "object") {
        const candidate = parsedValue as Partial<StoredCartState>;
        if (Array.isArray(candidate.items)) {
          setItems(candidate.items.filter(parseStoredCartItem));
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
    const lines = JSON.parse(stockRequestKey) as Array<{ id: string; productId: string; variantName?: string }>;

    if (!lines.length) {
      return;
    }

    let cancelled = false;
    void fetchLineStock(lines.map(({ id, productId, variantName }) => ({ id, productId, variantName }))).then((stock) => {
      if (!cancelled && stock) {
        setStockByLineId(stock);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [stockRequestKey, stockReadCount]);

  // Keeps each line's cap at the units the shop has left, and lowers a line the
  // stock no longer covers instead of letting checkout refuse it.
  useEffect(() => {
    const limits = items.flatMap((item) => {
      const availableQuantity = stockByLineId[item.id]?.availableQuantity;

      return availableQuantity !== undefined && (item.availableQuantity !== availableQuantity || item.quantity > availableQuantity)
        ? [{ id: item.id, availableQuantity, reduced: item.quantity > availableQuantity }]
        : [];
    });

    if (!limits.length) {
      return;
    }

    setItems((currentItems) => limitCartItems(currentItems, limits));
    setReducedLineIds((current) => new Set([...current, ...limits.filter((limit) => limit.reduced).map((limit) => limit.id)]));
  }, [items, stockByLineId]);

  const getItemAvailability = useCallback(
    (item: CartStoreItem) => stockByLineId[item.id]?.availability ?? "available",
    [stockByLineId],
  );
  // Only lines that can be bought count toward the totals, the discount and free shipping.
  const buyableItems = useMemo(
    () => items.filter((item) => getItemAvailability(item) === "available"),
    [getItemAvailability, items],
  );

  useEffect(() => {
    if (!appliedPromo?.code || !buyableItems.length) {
      if (!items.length && appliedPromo) {
        setAppliedPromo(null);
      }
      return;
    }

    let cancelled = false;
    void validatePromo(appliedPromo.code, buyableItems).then((result) => {
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
  }, [items, buyableItems, appliedPromo?.code]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalUsd = roundCurrency(
      buyableItems.reduce((runningTotal, item) => runningTotal + item.priceUsd * item.quantity, 0),
    );
    const discountUsd = Math.min(appliedPromo?.discountUsd ?? 0, subtotalUsd);
    const shippingUsd = calculateShippingUsd(subtotalUsd - discountUsd);

    return {
      items,
      itemCount: items.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
      subtotalUsd,
      discountUsd,
      promoCode: appliedPromo?.code ?? null,
      promoMessage: appliedPromo?.message ?? null,
      shippingUsd,
      totalUsd: roundCurrency(subtotalUsd - discountUsd + shippingUsd),
      getItemAvailability,
      hasUnavailableItems: items.some((item) => getItemAvailability(item) !== "available"),
      isQuantityReduced: (item) => reducedLineIds.has(item.id),
      addProduct(input) {
        const addedLine = getAddedCartLine(items, input);

        setItems((currentItems) => addProductToCart(currentItems, input));

        if (addedLine) {
          trackCommerceEvent({
            name: "add_to_cart",
            items: [toCommerceItem({ ...addedLine.item, quantity: addedLine.quantity })],
          });
        }
      },
      removeItem(id) {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      },
      updateQuantity(id, quantity) {
        setItems((currentItems) => setCartItemQuantity(currentItems, id, quantity));
        setReducedLineIds((current) => new Set([...current].filter((lineId) => lineId !== id)));
      },
      limitItems(limits) {
        setItems((currentItems) => limitCartItems(currentItems, limits));
      },
      refreshItems(prices) {
        const priceById = new Map(prices.map((line) => [line.id, line.priceUsd]));

        setItems((currentItems) =>
          currentItems.map((item) => ({ ...item, priceUsd: priceById.get(item.id) ?? item.priceUsd })),
        );
        setStockReadCount((count) => count + 1);
      },
      async applyPromoCode(code) {
        const result = await validatePromo(code, buyableItems);

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
      clearCart() {
        setItems([]);
        setAppliedPromo(null);
      },
    };
  }, [appliedPromo, buyableItems, getItemAvailability, items, reducedLineIds]);

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

async function fetchLineStock(lines: Array<{ id: string; productId: string; variantName?: string }>) {
  try {
    const response = await fetch("/api/cart/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });

    if (!response.ok) {
      return null;
    }

    return ((await response.json()) as { lines: Record<string, CartLineStock> }).lines;
  } catch {
    return null;
  }
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
