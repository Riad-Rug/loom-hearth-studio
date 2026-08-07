import { z } from "zod";

import { defaultSupportedCheckoutCountry } from "@/config/supported-markets";
import { usStates } from "@/config/us-states";
import type { OrderAddress } from "@/types/domain";

const stateCodes = usStates.map((state) => state.code) as [string, ...string[]];
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
    state: z.enum(stateCodes, { message: "Select a state" }),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  })
  .superRefine(async (data, ctx) => {
    const zip5 = data.postalCode.slice(0, 5);

    if (!data.state || !/^\d{5}$/.test(zip5)) {
      return;
    }

    // Best-effort cross-check against a real ZIP -> state lookup. Any
    // failure (network, unrecognized ZIP) fails open — this is a data-
    // quality nudge, not a security boundary, so it should never block a
    // real customer over a lookup we couldn't complete.
    try {
      const response = await fetch(`/api/checkout/validate-zip?postalCode=${zip5}`);

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as { state: string | null };

      if (result.state && result.state !== data.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["postalCode"],
          message: `That ZIP code is in ${stateNamesByCode.get(result.state) ?? result.state}, not ${
            stateNamesByCode.get(data.state) ?? data.state
          }.`,
        });
      }
    } catch {
      // Ignore — see comment above.
    }
  });

export type AddressFormValues = z.infer<typeof addressSchema>;

export const emptyAddressFormValues: AddressFormValues = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "" as AddressFormValues["state"],
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
    country: defaultSupportedCheckoutCountry,
  };
}
