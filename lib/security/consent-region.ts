/**
 * Region rules for the analytics consent default.
 *
 * EU/EEA, UK and Switzerland visitors get opt-in (analytics off until they
 * accept). Everyone else gets analytics on by default with a visible opt-out.
 * Anything we cannot place — no header, Cloudflare's "XX" (unknown) or "T1"
 * (Tor) — falls back to opt-in, the safe default.
 */
const OPT_IN_COUNTRIES = new Set([
  // EU-27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // Rest of the EEA
  "IS", "LI", "NO",
  // UK and Switzerland
  "GB", "CH",
]);

export function normalizeCountryCode(value: string | null | undefined) {
  const code = value?.trim().toUpperCase() ?? "";

  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") {
    return null;
  }

  return code;
}

export function countryRequiresOptIn(country: string | null) {
  return country === null || OPT_IN_COUNTRIES.has(country);
}
