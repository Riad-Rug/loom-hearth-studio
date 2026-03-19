"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
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
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  useEffect(() => {
    function handleOpenCart() {
      setIsOpen(true);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("loom-hearth:open-cart", handleOpenCart);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("loom-hearth:open-cart", handleOpenCart);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <Link className="site-header__cart-button" href="/cart">
        <span>Cart</span>
        <span className="site-header__cart-count">{itemCount}</span>
      </Link>

      {isOpen ? (
        <div className={styles.overlay} role="presentation" onClick={() => setIsOpen(false)}>
          <aside
            id="cart-drawer"
            aria-label="Shopping cart"
            className={styles.drawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              <div>
                <h2>Cart</h2>
                <p className={styles.headerMeta}>
                  {isEmpty ? "Your latest picks appear here." : `${itemCountLabel} ready for checkout`}
                </p>
              </div>
              <button
                aria-label="Close cart"
                className={styles.closeButton}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                <span aria-hidden="true" className={styles.closeButtonIcon}>
                  x
                </span>
                <span>Close cart</span>
              </button>
            </div>

            {isEmpty ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>Your cart is empty.</p>
                <p className={styles.emptyBody}>
                  Add a launch piece to review it here, then move straight into checkout.
                </p>
                <Link className={styles.secondaryButton} href="/shop" onClick={() => setIsOpen(false)}>
                  Continue shopping
                </Link>
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

                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <p className={styles.summaryEyebrow}>Ready when you are</p>
                    <p className={styles.summaryLead}>
                      Secure your order with free U.S. launch shipping.
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
                  <div className={styles.actionGroup}>
                    <Link
                      className={styles.checkoutButton}
                      href="/checkout/information"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
                    </Link>
                    <Link className={styles.secondaryButton} href="/cart" onClick={() => setIsOpen(false)}>
                      View cart
                    </Link>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
