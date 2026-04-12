export type NewsletterSignupActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialNewsletterSignupActionState: NewsletterSignupActionState = {
  status: "idle",
  message: null,
};
