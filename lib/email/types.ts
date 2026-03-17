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
  "TODO: Keep Postmark transactional email delivery scoped to order confirmation only until password reset and other flows are defined.";
