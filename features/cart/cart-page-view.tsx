"use client";

import type { Route } from "next";
import Link from "next/link";

import {
  formatUsd,
  getCartItemLabel,
  getCartItemQuantityRule,
  useCart,
} from "@/features/cart/cart-provider";

import styles from "./cart-page.module.css";

export function CartPageView() {
  const { itemCount, items, removeItem, shippingUsd, subtotalUsd, totalUsd, updateQuantity } =
    useCart();
  const isEmpty = items.length === 0;
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Cart</p>
            <h1>Your cart</h1>
            <p className={styles.lede}>
              {isEmpty
                ? "Your cart is empty. Add a launch piece and it will appear here."
                : `${itemCountLabel} ready for checkout with free U.S. launch shipping.`}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.secondaryAction} href="/shop">
              Continue shopping
            </Link>
            <Link
              className={styles.primaryAction}
              href={isEmpty ? "/shop" : "/checkout/information"}
            >
              {isEmpty ? "Shop products" : "Checkout"}
            </Link>
          </div>
        </div>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <h2>Nothing in your cart yet.</h2>
            <p>
              Browse the launch collection, then return here to review quantity, pricing, and
              checkout.
            </p>
            <Link className={styles.primaryAction} href="/shop">
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            <div className={styles.itemList}>
              {items.map((item) => (
                <article key={item.id} className={styles.itemRow}>
                  <div className={styles.itemMedia}>
                    <span>{getCartItemLabel(item)}</span>
                  </div>
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
                        <div className={styles.quantityShell}>
                          <button
                            className={styles.quantityButton}
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className={styles.quantityButton}
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      )}
                      <div className={styles.itemActions}>
                        <p className={styles.quantityRule}>{getCartItemQuantityRule(item)}</p>
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
              ))}
            </div>

            <aside className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <p className={styles.summaryEyebrow}>Order summary</p>
                <h2>Cart total</h2>
                <p className={styles.summaryLead}>
                  Review your items here before continuing to the checkout flow.
                </p>
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{formatUsd(subtotalUsd)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>{formatUsd(shippingUsd)}</strong>
              </div>
              <div className={styles.freeShippingLine}>Free shipping at launch</div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <strong>{formatUsd(totalUsd)}</strong>
              </div>
              <div className={styles.summaryActions}>
                <Link className={styles.primaryAction} href="/checkout/information">
                  Proceed to checkout
                </Link>
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
