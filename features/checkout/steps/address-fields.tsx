"use client";

import { useEffect, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

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

  // The ZIP/state mismatch check only runs when the ZIP field itself
  // re-validates. Without this, correcting the state after seeing "That ZIP
  // code is in California, not New York" leaves the now-stale message on
  // screen. Re-check the ZIP whenever the state changes, but only once the
  // customer has actually reached that field.
  const stateValue = useWatch({ control: form.control, name: "state" });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (form.getFieldState("postalCode").isTouched) {
      void form.trigger("postalCode");
    }
    // form.trigger/getFieldState are stable; re-running only on state change is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateValue]);

  function errorId(field: string) {
    return `${idPrefix}-${field}-error`;
  }

  return (
    <div className={styles.formGrid}>
      {includeContactFields ? (
        <>
          <label className={styles.field} htmlFor={`${idPrefix}-email`}>
            <span>Email address</span>
            <input
              id={`${idPrefix}-email`}
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? errorId("email") : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <em id={errorId("email")} role="alert" className={styles.fieldError}>
                {errors.email.message}
              </em>
            ) : null}
          </label>
          <label className={styles.field} htmlFor={`${idPrefix}-phone`}>
            <span>Phone (optional)</span>
            <input
              id={`${idPrefix}-phone`}
              placeholder="(555) 555-5555"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? errorId("phone") : undefined}
              {...register("phone")}
            />
            {errors.phone ? (
              <em id={errorId("phone")} role="alert" className={styles.fieldError}>
                {errors.phone.message}
              </em>
            ) : null}
          </label>
        </>
      ) : null}
      <label className={styles.field} htmlFor={`${idPrefix}-fullName`}>
        <span>Full name</span>
        <input
          id={`${idPrefix}-fullName`}
          placeholder="Jordan Smith"
          type="text"
          autoComplete="name"
          aria-invalid={errors.fullName ? "true" : undefined}
          aria-describedby={errors.fullName ? errorId("fullName") : undefined}
          {...register("fullName")}
        />
        {errors.fullName ? (
          <em id={errorId("fullName")} role="alert" className={styles.fieldError}>
            {errors.fullName.message}
          </em>
        ) : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-address1`}>
        <span>Address line 1</span>
        <input
          id={`${idPrefix}-address1`}
          placeholder="123 Main Street"
          type="text"
          autoComplete="address-line1"
          aria-invalid={errors.address1 ? "true" : undefined}
          aria-describedby={errors.address1 ? errorId("address1") : undefined}
          {...register("address1")}
        />
        {errors.address1 ? (
          <em id={errorId("address1")} role="alert" className={styles.fieldError}>
            {errors.address1.message}
          </em>
        ) : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-address2`}>
        <span>Address line 2 (optional)</span>
        <input
          id={`${idPrefix}-address2`}
          placeholder="Apartment, suite, etc."
          type="text"
          autoComplete="address-line2"
          {...register("address2")}
        />
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-city`}>
        <span>City</span>
        <input
          id={`${idPrefix}-city`}
          placeholder="Los Angeles"
          type="text"
          autoComplete="address-level2"
          aria-invalid={errors.city ? "true" : undefined}
          aria-describedby={errors.city ? errorId("city") : undefined}
          {...register("city")}
        />
        {errors.city ? (
          <em id={errorId("city")} role="alert" className={styles.fieldError}>
            {errors.city.message}
          </em>
        ) : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-state`}>
        <span>State</span>
        <select
          id={`${idPrefix}-state`}
          defaultValue=""
          autoComplete="address-level1"
          aria-invalid={errors.state ? "true" : undefined}
          aria-describedby={errors.state ? errorId("state") : undefined}
          {...register("state")}
        >
          <option disabled value="">
            Select a state
          </option>
          {usStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state ? (
          <em id={errorId("state")} role="alert" className={styles.fieldError}>
            {errors.state.message}
          </em>
        ) : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-postalCode`}>
        <span>ZIP code</span>
        <input
          id={`${idPrefix}-postalCode`}
          placeholder="90001"
          type="text"
          autoComplete="postal-code"
          inputMode="numeric"
          aria-invalid={errors.postalCode ? "true" : undefined}
          aria-describedby={errors.postalCode ? errorId("postalCode") : undefined}
          {...register("postalCode")}
        />
        {errors.postalCode ? (
          <em id={errorId("postalCode")} role="alert" className={styles.fieldError}>
            {errors.postalCode.message}
          </em>
        ) : null}
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-country`}>
        <span>Country</span>
        <input id={`${idPrefix}-country`} readOnly autoComplete="country-name" tabIndex={-1} value="United States" />
      </label>
    </div>
  );
}
