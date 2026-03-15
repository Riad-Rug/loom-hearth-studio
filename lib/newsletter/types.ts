export interface NewsletterService {
  subscribe(email: string): Promise<void>;
  unsubscribe(email: string): Promise<void>;
}

export const newsletterServiceTodo =
  "TODO: Select the newsletter platform before wiring admin newsletter tools or storefront subscriptions.";
