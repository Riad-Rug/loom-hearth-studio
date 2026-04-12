import { createNewsletterSubscriberRepository } from "@/lib/db/repositories/newsletter-subscriber-repository";
import { getMailchimpConfig } from "@/lib/newsletter/config";

export type AdminNewsletterMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminNewsletterSubscriberItem = {
  email: string;
  status: string;
  source: string;
  consentedAt: string;
  lastSyncedAt: string;
};

export type AdminNewsletterPageData = {
  metrics: AdminNewsletterMetric[];
  providerPills: string[];
  setupNotes: string[];
  subscribers: AdminNewsletterSubscriberItem[];
};

export async function getAdminNewsletterPageData(): Promise<AdminNewsletterPageData> {
  const repository = createNewsletterSubscriberRepository();
  const subscribers = await repository.list();
  const config = getMailchimpConfig();

  const subscribedCount = subscribers.filter((item) => item.status === "subscribed").length;
  const pendingCount = subscribers.filter((item) => item.status === "pending").length;
  const unsubscribedCount = subscribers.filter((item) => item.status === "unsubscribed" || item.status === "cleaned").length;

  return {
    metrics: [
      {
        label: "Total subscribers",
        value: formatInteger(subscribers.length),
        detail: subscribers.length ? "Local audience records" : "No signups yet",
      },
      {
        label: "Subscribed",
        value: formatInteger(subscribedCount),
        detail: subscribedCount ? "Active audience members" : "No confirmed subscribers yet",
      },
      {
        label: "Pending sync",
        value: formatInteger(pendingCount),
        detail: pendingCount ? "Needs Mailchimp confirmation or retry" : "No pending sync backlog",
      },
      {
        label: "Unsubscribed / cleaned",
        value: formatInteger(unsubscribedCount),
        detail: unsubscribedCount ? "Updated through webhook or sync" : "No churn recorded yet",
      },
    ],
    providerPills: [
      config.status === "ready" ? `Mailchimp audience: ${config.audienceId}` : "Mailchimp configuration incomplete",
      config.serverPrefix ? `API region: ${config.serverPrefix}` : "Mailchimp server prefix missing",
      config.webhookSecret ? "Webhook secret configured" : "Webhook secret optional and not set",
    ],
    setupNotes: [
      "Newsletter signups persist locally first, then sync outward to Mailchimp.",
      config.status === "ready"
        ? "Mailchimp API credentials are present for subscribe/update requests."
        : `Missing config: ${config.missingConfig.join(", ")}`,
      "Webhook updates can mark records unsubscribed or cleaned after Mailchimp events arrive.",
    ],
    subscribers: subscribers.slice(0, 50).map((subscriber) => ({
      email: subscriber.email,
      status: subscriber.status,
      source: subscriber.source,
      consentedAt: formatDateTime(subscriber.consentedAt),
      lastSyncedAt: formatDateTime(subscriber.lastSyncedAt),
    })),
  };
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
