export const newsletterSignupSources = [
  "homepage",
  "footer",
  "blog",
  "sold-piece",
  "exit-intent",
] as const;

export type NewsletterSignupSource = (typeof newsletterSignupSources)[number];

export type NewsletterSignupActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialNewsletterSignupActionState: NewsletterSignupActionState = {
  status: "idle",
  message: null,
};
