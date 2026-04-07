export type InquiryCountryDefinition = {
  code: string;
  label: string;
  regionLabel: string;
  postalCodeLabel: string;
  requiresRegion: boolean;
  requiresPostalCode: boolean;
};

const baseSupportedInquiryCountries = {
  US: {
    code: "US",
    label: "United States",
    regionLabel: "State",
    postalCodeLabel: "ZIP code",
    requiresRegion: true,
    requiresPostalCode: true,
  },
  CA: {
    code: "CA",
    label: "Canada",
    regionLabel: "Province or territory",
    postalCodeLabel: "Postal code",
    requiresRegion: true,
    requiresPostalCode: true,
  },
  AU: {
    code: "AU",
    label: "Australia",
    regionLabel: "State or territory",
    postalCodeLabel: "Postcode",
    requiresRegion: true,
    requiresPostalCode: true,
  },
} as const satisfies Record<string, InquiryCountryDefinition>;

const europeanSupportedInquiryCountries = {
  // TODO: Fill this object with the exact European inquiry-country list chosen by the user.
} as const satisfies Record<string, InquiryCountryDefinition>;

export const supportedInquiryCountriesByCode = {
  ...baseSupportedInquiryCountries,
  ...europeanSupportedInquiryCountries,
} as const;

export type SupportedInquiryCountry = keyof typeof supportedInquiryCountriesByCode;

export const supportedInquiryCountries = Object.values(supportedInquiryCountriesByCode);

export const allSupportedInquiryCountriesRequireRegion = supportedInquiryCountries.every(
  (country) => country.requiresRegion,
);

export const allSupportedInquiryCountriesRequirePostalCode = supportedInquiryCountries.every(
  (country) => country.requiresPostalCode,
);

export function getSupportedInquiryCountry(code: string) {
  return supportedInquiryCountriesByCode[code as SupportedInquiryCountry] ?? null;
}

