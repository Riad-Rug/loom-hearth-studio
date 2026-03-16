"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { cartSummary } from "@/features/cart/cart-data";
import {
  cartFoundationTodos,
  formatUsd,
  getCartItemLabel,
  getCartItemQuantityRule,
  useCart,
} from "@/features/cart/cart-provider";

import styles from "./cart-drawer.module.css";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount, items, removeItem, shippingUsd, subtotalUsd, totalUsd, updateQuantity } =
    useCart();
  const isEmpty = items.length === 0;

  return (
    <>
      <button
        aria-controls="cart-drawer"
        aria-expanded={isOpen}
        className="site-header__cart-button"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Cart
        <span className="site-header__cart-count">{itemCount}</span>
      </button>

      {isOpen ? (
        <div className={styles.overlay} role="presentation" onClick={() => setIsOpen(false)}>
          <aside
            id="cart-drawer"
            aria-label="Cart drawer"
            className={styles.drawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Cart</p>
                <h2>Storefront cart</h2>
              </div>
              <button className={styles.closeButton} type="button" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            {isEmpty ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>Your cart is currently empty.</p>
                <p className={styles.emptyBody}>
                  Client-side cart state is active in this slice, but checkout, promo codes,
                  and order submission remain placeholder-only.
                </p>
              </div>
            ) : (
              <>
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
                            <h3>
                              <Link
                                className={styles.itemLink}
                                href={item.href as Route}
                                onClick={() => setIsOpen(false)}
                              >
                                {item.name}
                              </Link>
                            </h3>
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

                <div className={styles.promoCard}>
                  <label className={styles.promoLabel} htmlFor="promo-code">
                    Promo code
                  </label>
                  <div className={styles.promoControls}>
                    <input
                      id="promo-code"
                      className={styles.promoInput}
                      name="promoCode"
                      placeholder={cartSummary.promoPlaceholder}
                      type="text"
                    />
                    <button className={styles.applyButton} type="button">
                      Apply
                    </button>
                  </div>
                  <p className={styles.summaryTodo}>{cartFoundationTodos.promoCodes}</p>
                </div>

                <div className={styles.summaryCard}>
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
                  <p className={styles.summaryTodo}>{cartFoundationTodos.checkout}</p>
                  <Link
                    className={styles.checkoutButton}
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue to checkout
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
