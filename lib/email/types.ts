import type { EmailMissingConfig } from "@/lib/email/config";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailDeliveryResult = {
  status: "sent" | "configuration-error" | "api-error";
  provider: "postmark";
  providerMessageId: string | null;
  missingConfig: EmailMissingConfig[];
  message: string;
};

export interface EmailService {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export const emailServiceTodo =
  "Postmark transactional email delivery is implemented for order confirmation and password reset. Broader marketing and lifecycle email flows remain out of scope.";
