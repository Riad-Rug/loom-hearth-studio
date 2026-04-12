import { getEnvSnapshot } from "@/lib/validation/env";

export type MailchimpMissingConfig =
  | "MAILCHIMP_API_KEY"
  | "MAILCHIMP_SERVER_PREFIX"
  | "MAILCHIMP_AUDIENCE_ID";

export type MailchimpConfig = {
  provider: "mailchimp";
  apiKey?: string;
  serverPrefix?: string;
  audienceId?: string;
  webhookSecret?: string;
  status: "missing-config" | "ready";
  missingConfig: MailchimpMissingConfig[];
  apiBaseUrl: string;
};

export function getMailchimpConfig(): MailchimpConfig {
  const env = getEnvSnapshot();
  const missingConfig: MailchimpMissingConfig[] = [
    ...(env.MAILCHIMP_API_KEY ? [] : (["MAILCHIMP_API_KEY"] as MailchimpMissingConfig[])),
    ...(env.MAILCHIMP_SERVER_PREFIX
      ? []
      : (["MAILCHIMP_SERVER_PREFIX"] as MailchimpMissingConfig[])),
    ...(env.MAILCHIMP_AUDIENCE_ID ? [] : (["MAILCHIMP_AUDIENCE_ID"] as MailchimpMissingConfig[])),
  ];

  const serverPrefix = env.MAILCHIMP_SERVER_PREFIX;

  return {
    provider: "mailchimp",
    apiKey: env.MAILCHIMP_API_KEY,
    serverPrefix,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
    webhookSecret: env.MAILCHIMP_WEBHOOK_SECRET,
    status: missingConfig.length ? "missing-config" : "ready",
    missingConfig,
    apiBaseUrl: serverPrefix ? `https://${serverPrefix}.api.mailchimp.com/3.0` : "",
  };
}
