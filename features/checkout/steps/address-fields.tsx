"use client";

import type { UseFormReturn } from "react-hook-form";

import { usStates } from "@/config/us-states";
import type { AddressFormValues } from "@/lib/checkout/address-schema";

import styles from "@/features/checkout/checkout-page.module.css";

type AddressFieldsProps = {
  form: UseFormReturn<AddressFormValues>;
  idPrefix: string;
  includeContactFields?: boolean;
};

export function AddressFields({ form, idPrefix, includeContactFields = true }: AddressFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className={styles.formGrid}>
      {includeContactFields ? (
        <>
          <label className={styles.field} htmlFor={`${idPrefix}-email`}>
            <span>Email address</span>
            <input id={`${idPrefix}-email`} placeholder="name@example.com" type="email" {...register("email")} />
            {errors.email ? <em className={styles.fieldError}>{errors.email.message}</em> : null}
          </label>
          <label className={styles.field} htmlFor={`${idPrefix}-phone`}>
            <span>Phone (optional)</span>
            <input id={`${idPrefix}-phone`} placeholder="(555) 555-5555" type="tel" {...register("phone")} />
            {errors.phone ? <em className={styles.fieldError}>{errors.phone.message}</em> : null}
          </label>
        </>
      ) : null}
      <label className={styles.field} htmlFor={`${idPrefix}-fullName`}>
        <span>Full name</span>
        <input id={`${idPrefix}-fullName`} placeholder="Jordan Smith" type="text" {...register("fullName")} />
        {errors.fullName ? <em className={styles.fieldError}>{errors.fullName.message}</em> : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-address1`}>
        <span>Address line 1</span>
        <input id={`${idPrefix}-address1`} placeholder="123 Main Street" type="text" {...register("address1")} />
        {errors.address1 ? <em className={styles.fieldError}>{errors.address1.message}</em> : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-address2`}>
        <span>Address line 2</span>
        <input id={`${idPrefix}-address2`} placeholder="Apartment, suite, etc." type="text" {...register("address2")} />
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-city`}>
        <span>City</span>
        <input id={`${idPrefix}-city`} placeholder="Los Angeles" type="text" {...register("city")} />
        {errors.city ? <em className={styles.fieldError}>{errors.city.message}</em> : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-state`}>
        <span>State</span>
        <select id={`${idPrefix}-state`} defaultValue="" {...register("state")}>
          <option disabled value="">
            Select a state
          </option>
          {usStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state ? <em className={styles.fieldError}>{errors.state.message}</em> : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-postalCode`}>
        <span>ZIP code</span>
        <input id={`${idPrefix}-postalCode`} placeholder="90001" type="text" {...register("postalCode")} />
        {errors.postalCode ? <em className={styles.fieldError}>{errors.postalCode.message}</em> : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-country`}>
        <span>Country</span>
        <input id={`${idPrefix}-country`} readOnly value="United States" />
      </label>
    </div>
  );
}
