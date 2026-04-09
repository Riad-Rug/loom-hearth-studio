export type InquiryCountryDefinition = {
  code: string;
  label: string;
  regionLabel: string;
  postalCodeLabel: string;
  requiresRegion: boolean;
  requiresPostalCode: boolean;
  shippingAvailabilityNote: string | null;
};

const baseSupportedInquiryCountries = {
  US: {
    code: "US",
    label: "United States",
    regionLabel: "State",
    postalCodeLabel: "ZIP code",
    requiresRegion: true,
    requiresPostalCode: true,
    shippingAvailabilityNote: null,
  },
  CA: {
    code: "CA",
    label: "Canada",
    regionLabel: "Province or territory",
    postalCodeLabel: "Postal code",
    requiresRegion: true,
    requiresPostalCode: true,
    shippingAvailabilityNote: null,
  },
  AU: {
    code: "AU",
    label: "Australia",
    regionLabel: "State or territory",
    postalCodeLabel: "Postcode",
    requiresRegion: true,
    requiresPostalCode: true,
    shippingAvailabilityNote: null,
  },
  GB: {
    code: "GB",
    label: "United Kingdom",
    regionLabel: "County, region, or nation",
    postalCodeLabel: "Postcode",
    requiresRegion: true,
    requiresPostalCode: true,
    shippingAvailabilityNote: null,
  },
  OTHER: {
    code: "OTHER",
    label: "Other country - reviewed case by case",
    regionLabel: "State, province, region, or county",
    postalCodeLabel: "Postal code",
    requiresRegion: false,
    requiresPostalCode: false,
    shippingAvailabilityNote:
      "Inquiries from outside our launch markets are welcome. Shipping availability is reviewed case by case before payment is captured.",
  },
} as const satisfies Record<string, InquiryCountryDefinition>;

export const supportedInquiryCountriesByCode = {
  ...baseSupportedInquiryCountries,
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

