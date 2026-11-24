"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCheckout } from "@/features/checkout/checkout-provider";
import { AddressFields } from "@/features/checkout/steps/address-fields";
import { AddToOrder } from "@/features/checkout/steps/add-to-order";
import { addressSchema, emptyAddressFormValues, type AddressFormValues } from "@/lib/checkout/address-schema";
import { storePromiseCopy } from "@/lib/order/store-promise";

import styles from "@/features/checkout/checkout-page.module.css";

export function ShippingStep() {
  const { addresses, submitAddresses, items } = useCheckout();
  const shippingForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: addresses?.shipping ?? emptyAddressFormValues,
    mode: "onBlur",
  });
  const billingForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: addresses?.billing ?? emptyAddressFormValues,
    mode: "onBlur",
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    addresses ? addresses.billing === null : true,
  );

  const handleSubmit = shippingForm.handleSubmit(async (shipping) => {
    if (billingSameAsShipping) {
      submitAddresses({ shipping, billing: null });
      return;
    }

    // The billing form hides the contact fields, but addressSchema and the
    // server both require an email on every address, so carry it over.
    billingForm.setValue("email", shipping.email);
    billingForm.setValue("phone", shipping.phone ?? "");
    await billingForm.handleSubmit((billing) => submitAddresses({ shipping, billing }))();
  });

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <h2>Contact & shipping</h2>
      </div>
      <form className={styles.panelStack} onSubmit={handleSubmit}>
        <AddressFields form={shippingForm} idPrefix="shipping" />
        <p className={styles.summaryNote}>
          Dispatched within {storePromiseCopy.dispatchWindow} of your approval; delivery usually takes{" "}
          {storePromiseCopy.deliveryWindow} after that.
        </p>

        <fieldset className={styles.toggleFieldset}>
          <legend className={styles.toggleLegend}>Billing address</legend>
          <div className={styles.toggleGroup}>
            <label
              className={`${styles.toggleOption} ${billingSameAsShipping ? styles.toggleOptionActive : ""}`}
            >
              <input
                checked={billingSameAsShipping}
                name="billing-address"
                type="radio"
                onChange={() => setBillingSameAsShipping(true)}
              />
              <span className={styles.toggleText}>
                <strong>Same as shipping address</strong>
              </span>
            </label>
            <label
              className={`${styles.toggleOption} ${billingSameAsShipping ? "" : styles.toggleOptionActive}`}
            >
              <input
                checked={!billingSameAsShipping}
                name="billing-address"
                type="radio"
                onChange={() => setBillingSameAsShipping(false)}
              />
              <span className={styles.toggleText}>
                <strong>Use a different billing address</strong>
                <span>The address on your card statement</span>
              </span>
            </label>
          </div>
        </fieldset>

        {billingSameAsShipping ? null : (
          <AddressFields form={billingForm} idPrefix="billing" includeContactFields={false} />
        )}

        <AddToOrder />

        <button className={styles.primaryAction} disabled={items.length === 0} type="submit">
          Continue to payment
        </button>

        <div className={styles.reviewCard}>
          <h3>Need help before you continue?</h3>
          <p>
            If you are checking out a one-of-a-kind rug and want guidance before payment, contact
            the studio and we will review the piece with you directly.
          </p>
          <Link className={styles.secondaryAction} href="/contact">
            Contact the Studio
          </Link>
        </div>
      </form>
    </div>
  );
}
