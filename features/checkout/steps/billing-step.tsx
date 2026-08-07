"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCheckout } from "@/features/checkout/checkout-provider";
import { AddressFields } from "@/features/checkout/steps/address-fields";
import { addressSchema, type AddressFormValues } from "@/lib/checkout/address-schema";

import styles from "@/features/checkout/checkout-page.module.css";

export function BillingStep() {
  const { billing, submitBilling, canAccessShipping, items } = useCheckout();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: billing,
    mode: "onBlur",
  });

  function onSubmit(values: AddressFormValues) {
    submitBilling(values);
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelHeader}>
        <p className={styles.eyebrow}>Step 1</p>
        <h2>Billing</h2>
      </div>
      <form className={styles.panelStack} onSubmit={form.handleSubmit(onSubmit)}>
        <AddressFields form={form} idPrefix="billing" />
        <p className={styles.summaryNote}>
          This is the address on your card. If your order ships somewhere else, you can set that on
          the next step.
        </p>
        <div className={styles.reviewCard}>
          <h3>Need Help Before You Continue?</h3>
          <p>
            If you are checking out a ONE OF A KIND rug and want guidance before payment, use the
            inquiry flow and we will review the piece with you directly.
          </p>
          <Link className={styles.secondaryAction} href="/contact">
            Contact the Studio
          </Link>
        </div>
        <button className={styles.primaryAction} disabled={items.length === 0} type="submit">
          {canAccessShipping ? "Continue to shipping" : "Continue"}
        </button>
      </form>
    </div>
  );
}
