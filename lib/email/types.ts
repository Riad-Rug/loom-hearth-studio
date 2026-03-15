export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}

export const emailServiceTodo =
  "TODO: Select an email provider before implementing order confirmation and password reset delivery.";
