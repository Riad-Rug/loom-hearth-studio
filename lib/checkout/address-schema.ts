import { z } from "zod";

import {
  defaultSupportedCheckoutCountry,
  requiresUsAddressFields,
  supportedCheckoutCountries,
} from "@/config/supported-markets";
import { usStates } from "@/config/us-states";
import type { OrderAddress } from "@/types/domain";

const stateCodes = new Set(usStates.map((state) => state.code));
const stateNamesByCode = new Map(usStates.map((state) => [state.code, state.name]));

export const addressSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    address1: z.string().trim().min(1, "Address is required"),
    address2: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().min(1, "City is required"),
    country: z.enum(supportedCheckoutCountries, { message: "Select a country" }),
    // Free text outside the US; the US rules below narrow both fields.
    state: z.string().trim().max(100, "Keep this under 100 characters"),
    postalCode: z.string().trim().max(20, "Enter a valid postal code"),
  })
  .superRefine(
    async (data, ctx) => {
      if (!requiresUsAddressFields(data.country)) {
        return;
      }

      const hasValidState = stateCodes.has(data.state);
      const hasValidZip = /^\d{5}(-\d{4})?$/.test(data.postalCode);

      if (!hasValidState) {
        ctx.addIssue({ code: "custom", path: ["state"], message: "Select a state" });
      }

      if (!hasValidZip) {
        ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a valid ZIP code" });
      }

      if (!hasValidState || !hasValidZip) {
        return;
      }

      // Best-effort cross-check against a real ZIP -> state lookup. Any
      // failure (network, unrecognized ZIP) fails open — this is a data-
      // quality nudge, not a security boundary, so it should never block a
      // real customer over a lookup we couldn't complete.
      try {
        const response = await fetch(`/api/checkout/validate-zip?postalCode=${data.postalCode.slice(0, 5)}`);

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { state: string | null };

        if (result.state && result.state !== data.state) {
          ctx.addIssue({
            code: "custom",
            path: ["postalCode"],
            message: `That ZIP code is in ${stateNamesByCode.get(result.state) ?? result.state}, not ${
              stateNamesByCode.get(data.state) ?? data.state
            }.`,
          });
        }
      } catch {
        // Ignore — see comment above.
      }
    },
    // Run the US state/ZIP rules even while other fields still have errors, so
    // every problem shows at once instead of in a second round.
    {
      when: (payload) =>
        typeof payload.value === "object" &&
        payload.value !== null &&
        typeof (payload.value as Record<string, unknown>).country === "string" &&
        typeof (payload.value as Record<string, unknown>).state === "string" &&
        typeof (payload.value as Record<string, unknown>).postalCode === "string",
    },
  );

export type AddressFormValues = z.infer<typeof addressSchema>;

export const emptyAddressFormValues: AddressFormValues = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  country: defaultSupportedCheckoutCountry,
  state: "",
  postalCode: "",
};

export function toOrderAddress(values: AddressFormValues): OrderAddress {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone || undefined,
    address1: values.address1,
    address2: values.address2 || undefined,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
  };
}
