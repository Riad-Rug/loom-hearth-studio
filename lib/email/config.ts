import { getEnvSnapshot } from "@/lib/validation/env";

export type EmailProvider = "postmark";
export type EmailMissingConfig = "EMAIL_FROM" | "POSTMARK_SERVER_TOKEN";
export type PostmarkEmailConfig = {
  provider: EmailProvider;
  fromEmail?: string;
  serverToken?: string;
  sendEndpoint: "https://api.postmarkapp.com/email";
  status: "missing-config" | "ready";
  missingConfig: EmailMissingConfig[];
};

export function getPostmarkEmailConfig(): PostmarkEmailConfig {
  const env = getEnvSnapshot();
  const missingConfig: EmailMissingConfig[] = [
    ...(env.EMAIL_FROM ? [] : (["EMAIL_FROM"] as EmailMissingConfig[])),
    ...(env.POSTMARK_SERVER_TOKEN
      ? []
      : (["POSTMARK_SERVER_TOKEN"] as EmailMissingConfig[])),
  ];

  return {
    provider: "postmark",
    fromEmail: env.EMAIL_FROM,
    serverToken: env.POSTMARK_SERVER_TOKEN,
    sendEndpoint: "https://api.postmarkapp.com/email",
    status: missingConfig.length ? "missing-config" : "ready",
    missingConfig,
  };
}

export function hasPostmarkEmailConfig() {
  const config = getPostmarkEmailConfig();

  return config.status === "ready";
}

export const emailConfigTodo =
  "TODO: Keep Postmark as the launch transactional email provider and defer broader email provider abstractions until more delivery flows exist.";
