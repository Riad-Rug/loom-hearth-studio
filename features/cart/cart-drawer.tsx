"use client";

import { useState } from "react";

import { cartPlaceholderItems, cartSummary } from "@/features/cart/cart-data";

import styles from "./cart-drawer.module.css";

type CartDrawerProps = {
  itemCount?: number;
};

export function CartDrawer({ itemCount = cartPlaceholderItems.length }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"filled" | "empty">("filled");

  const isEmpty = previewMode === "empty";

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
                <h2>Cart drawer UI shell</h2>
              </div>
              <button className={styles.closeButton} type="button" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            <div className={styles.previewToggle}>
              <button
                className={previewMode === "filled" ? styles.previewTabActive : styles.previewTab}
                type="button"
                onClick={() => setPreviewMode("filled")}
              >
                Filled preview
              </button>
              <button
                className={previewMode === "empty" ? styles.previewTabActive : styles.previewTab}
                type="button"
                onClick={() => setPreviewMode("empty")}
              >
                Empty preview
              </button>
            </div>

            {isEmpty ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>Your cart is currently empty.</p>
                <p className={styles.emptyBody}>
                  Empty cart state placeholder only. This slice does not implement real cart
                  state or add-to-cart behavior.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.itemList}>
                  {cartPlaceholderItems.map((item) => (
                    <article key={item.id} className={styles.itemRow}>
                      <div className={styles.itemMedia}>
                        <span>{item.categoryLabel}</span>
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemTopline}>
                          <div>
                            <p className={styles.itemCategory}>{item.categoryLabel}</p>
                            <h3>{item.name}</h3>
                          </div>
                          <p className={styles.itemPrice}>{item.priceUsdLabel}</p>
                        </div>
                        <div className={styles.itemFooter}>
                          {item.type === "rug" ? (
                            <div className={styles.lockedQuantity}>
                              <span>Quantity</span>
                              <strong>1</strong>
                            </div>
                          ) : (
                            <div className={styles.quantityShell}>
                              <button className={styles.quantityButton} type="button">
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button className={styles.quantityButton} type="button">
                                +
                              </button>
                            </div>
                          )}
                          <p className={styles.quantityRule}>{item.quantityRule}</p>
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
                </div>

                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <strong>{cartSummary.subtotalUsdLabel}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <strong>{cartSummary.shippingUsdLabel}</strong>
                  </div>
                  <div className={styles.freeShippingLine}>Free shipping at launch</div>
                  <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <strong>{cartSummary.totalUsdLabel}</strong>
                  </div>
                  <button className={styles.checkoutButton} type="button">
                    Checkout UI placeholder
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
