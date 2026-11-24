/**
 * Checkout ships worldwide: every ISO 3166-1 alpha-2 country, plus Kosovo
 * (XK), is accepted. The shipping rule is the same everywhere (see
 * lib/order/shipping.ts), so the list only exists to validate the address
 * country and fill the country picker.
 */
export const supportedCheckoutCountries = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export type SupportedCheckoutCountry = (typeof supportedCheckoutCountries)[number];

/** Pre-selected in the address form; customers can pick any other country. */
export const defaultSupportedCheckoutCountry: SupportedCheckoutCountry = "US";

const supportedCheckoutCountrySet = new Set<string>(supportedCheckoutCountries);

export function isSupportedCheckoutCountry(value: string): value is SupportedCheckoutCountry {
  return supportedCheckoutCountrySet.has(value);
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function getCheckoutCountryLabel(code: string) {
  if (code === "XK") {
    return "Kosovo";
  }

  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export const checkoutCountryOptions = supportedCheckoutCountries
  .map((code) => ({ code, label: getCheckoutCountryLabel(code) }))
  .sort((a, b) => a.label.localeCompare(b.label, "en"));

/**
 * US addresses keep the state picker, ZIP format and ZIP-to-state check. Other
 * countries take a free-text region and postal code, both optional because
 * many countries have neither.
 */
export function requiresUsAddressFields(country: string) {
  return country === "US";
}

/** "Austin, TX 78701" for the US; "Lyon 69002" or "Dubai" elsewhere. */
export function formatAddressLocality(address: { city: string; state: string; postalCode: string; country: string }) {
  if (requiresUsAddressFields(address.country)) {
    return `${address.city}, ${address.state} ${address.postalCode}`.trim();
  }

  return [address.city, address.state, address.postalCode].filter((part) => part && part.trim()).join(", ");
}
