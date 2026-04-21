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
  const { itemCount, items, subtotalUsd, discountUsd, promoCode, totalUsd } = useCart();
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
        aria-label={`Open cart with ${itemCountLabel}`}
        className="site-header__cart-button"
        type="button"
        onClick={handleButtonClick}
      >
        <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
          <path
            d="M7 8.5A5 5 0 0 1 17 8.5V9h1.25A1.75 1.75 0 0 1 20 10.75v8.5A1.75 1.75 0 0 1 18.25 21h-12.5A1.75 1.75 0 0 1 4 19.25v-8.5A1.75 1.75 0 0 1 5.75 9H7zm1.5.5h7V8.5a3.5 3.5 0 0 0-7 0zm9.75 1.5H5.75a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25"
            fill="currentColor"
          />
        </svg>
        <span
          className="site-header__cart-count"
          data-empty={itemCount === 0 ? "true" : "false"}
          aria-hidden="true"
        >
          {itemCount}
        </span>
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
                <h2>Mini Cart</h2>
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
                          {item.variantName ? ` ? ${item.variantName}` : ""}
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
                  {discountUsd > 0 ? (
                    <div className={styles.summaryRow}>
                      <span>Discount{promoCode ? ` (${promoCode})` : ""}</span>
                      <strong>-{formatUsd(discountUsd)}</strong>
                    </div>
                  ) : null}
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
