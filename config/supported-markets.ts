export const supportedCheckoutCountries = ["US"] as const;

export type SupportedCheckoutCountry = (typeof supportedCheckoutCountries)[number];

export const defaultSupportedCheckoutCountry: SupportedCheckoutCountry =
  supportedCheckoutCountries[0];

export const supportedCheckoutCountryLabels: Record<SupportedCheckoutCountry, string> = {
  US: "United States",
};

export function isSupportedCheckoutCountry(
  value: string,
): value is SupportedCheckoutCountry {
  return supportedCheckoutCountries.includes(value as SupportedCheckoutCountry);
}
