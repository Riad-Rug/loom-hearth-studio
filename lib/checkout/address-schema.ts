import { z } from "zod";

import { defaultSupportedCheckoutCountry } from "@/config/supported-markets";
import { usStates } from "@/config/us-states";
import type { OrderAddress } from "@/types/domain";

const stateCodes = usStates.map((state) => state.code) as [string, ...string[]];

export const addressSchema = z.object({
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
