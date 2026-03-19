"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatUsd, getCartItemLabel, useCart } from "@/features/cart/cart-provider";

import styles from "./cart-drawer.module.css";

const PREVIEW_ITEM_LIMIT = 3;

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const {
    itemCount,
    items,
    subtotalUsd,
    totalUsd,
  } = useCart();
  const visibleItems = items.slice(0, PREVIEW_ITEM_LIMIT);
  const hiddenItemCount = Math.max(0, items.length - PREVIEW_ITEM_LIMIT);
  const isEmpty = items.length === 0;
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    function syncPointerMode() {
      setIsPointerFine(mediaQuery.matches);
    }

    syncPointerMode();
    mediaQuery.addEventListener("change", syncPointerMode);

    return () => {
      mediaQuery.removeEventListener("change", syncPointerMode);
    };
  }, []);

  useEffect(() => {
    function handleOpenCart() {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setIsOpen(true);
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("loom-hearth:open-cart", handleOpenCart);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("loom-hearth:open-cart", handleOpenCart);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function openPreview() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsOpen(true);
  }

  function scheduleClose() {
    if (!isPointerFine) {
      return;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 140);
  }

  function handleButtonClick() {
    if (isPointerFine) {
      setIsOpen((current) => !current);
      return;
    }

    setIsOpen((current) => !current);
  }

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      onMouseEnter={() => {
        if (isPointerFine) {
          openPreview();
        }
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        aria-controls="cart-mini-panel"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="site-header__cart-button"
        type="button"
        onClick={handleButtonClick}
      >
        <span>Cart</span>
        <span className="site-header__cart-count">{itemCount}</span>
      </button>

      {isOpen ? (
        <div
          id="cart-mini-panel"
          aria-label="Shopping cart preview"
          className={styles.popover}
          role="dialog"
        >
          <div className={styles.panel}>
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Cart</p>
                <h2>Mini cart</h2>
                <p className={styles.headerMeta}>
                  {isEmpty ? "No pieces added yet." : `${itemCountLabel} ready to review.`}
                </p>
              </div>
              <button
                aria-label="Close cart preview"
                className={styles.closeButton}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
            </div>

            {isEmpty ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>Your cart is empty.</p>
                <p className={styles.emptyBody}>
                  Add a launch piece and preview it here before checkout.
                </p>
                <Link className={styles.secondaryButton} href="/shop" onClick={() => setIsOpen(false)}>
                  Keep shopping
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.itemList}>
                  {visibleItems.map((item) => (
                    <article key={item.id} className={styles.itemRow}>
                      <div className={styles.itemMedia}>
                        <span>{getCartItemLabel(item)}</span>
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemTopline}>
                          <p className={styles.itemCategory}>{getCartItemLabel(item)}</p>
                          <p className={styles.itemPrice}>{formatUsd(item.priceUsd)}</p>
                        </div>
                        <h3>
                          <Link
                            className={styles.itemLink}
                            href={item.href as Route}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className={styles.itemMeta}>
                          Qty {item.quantity}
                          {item.variantName ? ` · ${item.variantName}` : ""}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {hiddenItemCount > 0 ? (
                  <p className={styles.moreItems}>
                    +{hiddenItemCount} more {hiddenItemCount === 1 ? "item" : "items"} in cart
                  </p>
                ) : null}

                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <strong>{formatUsd(subtotalUsd)}</strong>
                  </div>
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
                    <Link
                      className={styles.secondaryButton}
                      href="/shop"
                      onClick={() => setIsOpen(false)}
                    >
                      Keep shopping
                    </Link>
                  </div>
                  <Link className={styles.viewCartLink} href="/cart" onClick={() => setIsOpen(false)}>
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
