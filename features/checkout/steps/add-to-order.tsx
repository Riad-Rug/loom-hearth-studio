"use client";

import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/features/cart/cart-provider";
import type { AddToOrderCandidateViewModel } from "@/lib/catalog/service";

import styles from "@/features/checkout/checkout-page.module.css";

type AddToOrderSuggestionsResponse = {
  candidates?: AddToOrderCandidateViewModel[];
};

// Cross-sell on the Shipping step: up to two small, meaningfully-cheaper
// items the customer can add to the order they're already placing, without
// leaving checkout. Adding a product here just mutates the cart — the
// checkout provider's draftSignature (features/checkout/checkout-provider.tsx)
// already reacts to cart changes and re-prices the PaymentIntent, so no
// extra wiring is needed for the total (sidebar summary, payment amount) to
// pick it up.
export function AddToOrder() {
  const { items, addProduct } = useCart();
  const [candidates, setCandidates] = useState<AddToOrderCandidateViewModel[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  // Keyed on which products (and how many of them) are in the cart, not on
  // quantity/price/etc., so re-renders from unrelated cart-state changes
  // don't re-fetch.
  const cartProductIdsSignature = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.productId)))
        .sort()
        .join(","),
    [items],
  );

  useEffect(() => {
    if (!cartProductIdsSignature) {
      setCandidates([]);
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({ productIds: cartProductIdsSignature });

    fetch(`/api/checkout/add-to-order-suggestions?${params.toString()}`)
      .then((response) => (response.ok ? (response.json() as Promise<AddToOrderSuggestionsResponse>) : null))
      .then((data) => {
        if (!cancelled) {
          setCandidates(data?.candidates ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCandidates([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cartProductIdsSignature]);

  const visibleCandidates = candidates.filter((candidate) => !addedProductIds.includes(candidate.id));

  if (!visibleCandidates.length) {
    return null;
  }

  function handleAdd(candidate: AddToOrderCandidateViewModel) {
    addProduct({ product: candidate.cartProduct, quantity: 1 });
    setAddedProductIds((current) => [...current, candidate.id]);
  }

  return (
    <div className={styles.addToOrder}>
      <h3>Add something small?</h3>
      <p className={styles.summaryNote}>
        Add it to this order now — nothing extra to fill out, and your card is only charged once, after you approve
        your order.
      </p>
      <div className={styles.addToOrderGrid}>
        {visibleCandidates.map((candidate) => (
          <div key={candidate.id} className={styles.addToOrderCard}>
            {candidate.image ? (
              <img
                className={styles.addToOrderImage}
                src={candidate.image.src}
                alt={candidate.image.altText || candidate.name}
                loading="lazy"
              />
            ) : null}
            <div className={styles.addToOrderInfo}>
              <p className={styles.addToOrderName}>{candidate.name}</p>
              <p className={styles.addToOrderPrice}>{candidate.priceUsdLabel}</p>
            </div>
            <button
              className={styles.addToOrderButton}
              type="button"
              aria-label={`Add ${candidate.name} (${candidate.priceUsdLabel}) to your order`}
              onClick={() => handleAdd(candidate)}
            >
              Add to order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
