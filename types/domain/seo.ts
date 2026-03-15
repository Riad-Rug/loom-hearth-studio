export type SeoOverride = {
  id: string;
  route: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  noIndex?: boolean;
};
