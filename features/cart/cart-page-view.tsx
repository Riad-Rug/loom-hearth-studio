"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { CartItemThumbnail } from "@/features/cart/cart-item-thumbnail";
import {
  getCartItemAvailabilityNote,
  getCartItemLabel,
  getMaxQuantity,
  toCommerceItems,
  unavailableCheckoutNote,
} from "@/features/cart/cart-items";
import { formatUsd, useCart } from "@/features/cart/cart-provider";
import { FreeShippingProgress } from "@/features/cart/free-shipping-progress";
import { trackCommerceEvent } from "@/lib/analytics/commerce-tracking";
import { storePromise } from "@/lib/order/store-promise";

import styles from "./cart-page.module.css";

export function CartPageView() {
  const {
    discountUsd,
    getItemAvailability,
    hasUnavailableItems,
    itemCount,
    items,
    promoCode,
    removeItem,
    shippingUsd,
    subtotalUsd,
    totalUsd,
    updateQuantity,
  } = useCart();
  const isEmpty = items.length === 0;
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
  const hasTrackedViewCart = useRef(false);

  // The cart hydrates from localStorage after the first render, so wait for items.
  useEffect(() => {
    if (hasTrackedViewCart.current || items.length === 0) {
      return;
    }

    hasTrackedViewCart.current = true;
    trackCommerceEvent({
      name: "view_cart",
      items: toCommerceItems(items),
      coupon: promoCode ?? undefined,
      discountUsd,
    });
  }, [discountUsd, items, promoCode]);

  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Cart</p>
            <h1>Your cart</h1>
            <p className={styles.lede}>
              {isEmpty
                ? "Your cart is empty. Add a piece and it will appear here."
                : `${itemCountLabel} in your cart. Free shipping on orders of $${storePromise.freeShippingThresholdUsd} or more.`}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.secondaryAction} href="/shop">
              Continue shopping
            </Link>
            {hasUnavailableItems ? (
              <button className={styles.primaryAction} disabled type="button">
                Checkout
              </button>
            ) : (
              <Link
                className={styles.primaryAction}
                href={isEmpty ? "/shop" : "/checkout"}
              >
                {isEmpty ? "Shop products" : "Checkout"}
              </Link>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <h2>Nothing in your cart yet.</h2>
            <p>
              Browse the collection, then return here to review quantity, pricing, and
              checkout.
            </p>
            <Link className={styles.primaryAction} href="/shop">
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            <div className={styles.itemList}>
              {items.map((item) => {
                const availabilityNote = getCartItemAvailabilityNote(item, getItemAvailability(item));

                return (
                  <article key={item.id} className={styles.itemRow}>
                    <CartItemThumbnail item={item} className={styles.itemMedia} />
                    <div className={styles.itemContent}>
                      <div className={styles.itemTopline}>
                        <div>
                          <p className={styles.itemCategory}>{getCartItemLabel(item)}</p>
                          <h2>
                            <Link className={styles.itemLink} href={item.href as Route}>
                              {item.name}
                            </Link>
                          </h2>
                          {item.variantName ? (
                            <p className={styles.itemVariant}>{item.variantName}</p>
                          ) : null}
                        </div>
                        <p className={styles.itemPrice}>{formatUsd(item.priceUsd)}</p>
                      </div>
                      <div className={styles.itemFooter}>
                        {item.productType === "rug" ? (
                          <div className={styles.lockedQuantity}>
                            <span>Quantity</span>
                            <strong>1</strong>
                          </div>
                        ) : (
                          <div
                            aria-label={`Quantity of ${item.name}`}
                            className={styles.quantityShell}
                            role="group"
                          >
                            <button
                              aria-label={`Decrease quantity of ${item.name}`}
                              className={styles.quantityButton}
                              disabled={item.quantity <= 1}
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span aria-live="polite">{item.quantity}</span>
                            <button
                              aria-label={`Increase quantity of ${item.name}`}
                              className={styles.quantityButton}
                              disabled={item.quantity >= getMaxQuantity(item)}
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                        <div className={styles.itemActions}>
                          {availabilityNote ? (
                            <p className={styles.quantityRule}>{availabilityNote}</p>
                          ) : null}
                          <button
                            className={styles.removeButton}
                            type="button"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <p className={styles.summaryEyebrow}>Order summary</p>
                <h2>Cart total</h2>
                <p className={styles.summaryLead}>
                  Review your items, then continue to checkout.
                </p>
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{formatUsd(subtotalUsd)}</strong>
              </div>
              {discountUsd > 0 ? (
                <div className={styles.summaryRow}>
                  <span>Discount{promoCode ? ` (${promoCode})` : ""}</span>
                  <strong>-{formatUsd(discountUsd)}</strong>
                </div>
              ) : null}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>{shippingUsd === 0 ? "Free" : formatUsd(shippingUsd)}</strong>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <strong>{formatUsd(totalUsd)}</strong>
              </div>
              <FreeShippingProgress />
              <div className={styles.summaryActions}>
                {hasUnavailableItems ? (
                  <>
                    <p className={styles.quantityRule} role="status">
                      {unavailableCheckoutNote}
                    </p>
                    <button className={styles.primaryAction} disabled type="button">
                      Proceed to checkout
                    </button>
                  </>
                ) : (
                  <Link className={styles.primaryAction} href="/checkout">
                    Proceed to checkout
                  </Link>
                )}
                <Link className={styles.secondaryAction} href="/shop">
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
