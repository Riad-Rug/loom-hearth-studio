"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCheckout } from "@/features/checkout/checkout-provider";
import { AddressFields } from "@/features/checkout/steps/address-fields";
import { addressSchema, emptyAddressFormValues, type AddressFormValues } from "@/lib/checkout/address-schema";

import styles from "@/features/checkout/checkout-page.module.css";

export function ShippingStep() {
  const { billing, shippingAddressMode, setShippingAddressMode, shippingAddressDraft, submitShipping } =
    useCheckout();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: shippingAddressDraft.fullName ? shippingAddressDraft : emptyAddressFormValues,
    mode: "onBlur",
  });

  function handleSameAsBilling() {
    setShippingAddressMode("same-as-billing");
  }

  function handleDifferentAddress() {
    setShippingAddressMode("different");
  }

  function onSubmit(values: AddressFormValues) {
    submitShipping(values);
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Step 2</p>
        <h2>Shipping</h2>
      </div>

      <div className={styles.toggleGroup} role="radiogroup" aria-label="Shipping address">
        <button
          className={`${styles.toggleOption} ${shippingAddressMode === "same-as-billing" ? styles.toggleOptionActive : ""}`}
          type="button"
          role="radio"
          aria-checked={shippingAddressMode === "same-as-billing"}
          onClick={handleSameAsBilling}
        >
          <strong>Ship to the same address</strong>
          <span>{billing.address1 ? `${billing.address1}, ${billing.city}` : "Same as billing"}</span>
        </button>
        <button
          className={`${styles.toggleOption} ${shippingAddressMode === "different" ? styles.toggleOptionActive : ""}`}
          type="button"
          role="radio"
          aria-checked={shippingAddressMode === "different"}
          onClick={handleDifferentAddress}
        >
          <strong>Use a different address</strong>
          <span>Gift, second home, or a different recipient</span>
        </button>
      </div>

      {shippingAddressMode === "different" ? (
        <form className={styles.panelStack} onSubmit={form.handleSubmit(onSubmit)}>
          <AddressFields form={form} idPrefix="shipping" includeContactFields={false} />
          <button className={styles.primaryAction} type="submit">
            Continue to payment
          </button>
        </form>
      ) : (
        <div className={styles.panelStack}>
          <div className={styles.reviewCard}>
            <h3>Shipping Review</h3>
            <p>
              We review the destination and shipping conditions before payment is captured. If
              anything needs clarification, we contact you before moving forward.
            </p>
          </div>
          <button className={styles.primaryAction} type="button" onClick={() => submitShipping(null)}>
            Continue to payment
          </button>
        </div>
      )}
    </div>
  );
}
