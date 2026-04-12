import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { createNewsletterSubscriberRepository } from "@/lib/db/repositories/newsletter-subscriber-repository";
import { getMailchimpConfig } from "@/lib/newsletter/config";

export type NewsletterSubscribeResult = {
  status: "subscribed" | "configuration-error" | "api-error" | "validation-error";
  message: string;
  missingConfig: string[];
};

export async function subscribeToNewsletter(input: {
  email: string;
  source: string;
  tags?: string[];
}): Promise<NewsletterSubscribeResult> {
  const email = input.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return {
      status: "validation-error",
      message: "Enter a valid email address before joining the newsletter.",
      missingConfig: [],
    };
  }

  const repository = createNewsletterSubscriberRepository();
  const config = getMailchimpConfig();
  const now = new Date();

  await repository.save({
    email,
    source: input.source,
    status: config.status === "ready" ? "pending" : "subscribed",
    mailchimpAudienceId: config.audienceId ?? null,
    mailchimpMemberId: null,
    tags: input.tags ?? [],
    consentedAt: now,
    unsubscribedAt: null,
    lastSyncedAt: config.status === "ready" ? null : now,
  });

  if (config.status !== "ready" || !config.apiKey || !config.audienceId || !config.apiBaseUrl) {
    return {
      status: "configuration-error",
      message: "Subscriber saved locally, but Mailchimp is not fully configured yet.",
      missingConfig: config.missingConfig,
    };
  }

  const memberHash = createMailchimpSubscriberHash(email);
  const response = await fetch(`${config.apiBaseUrl}/lists/${config.audienceId}/members/${memberHash}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: "subscribed",
      status: "subscribed",
      tags: input.tags ?? [],
      merge_fields: {
        SOURCE: input.source.slice(0, 100),
      },
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | { id?: string; status?: string; detail?: string }
    | null;

  if (!response.ok || !data?.id) {
    await repository.save({
      email,
      source: input.source,
      status: "pending",
      mailchimpAudienceId: config.audienceId,
      mailchimpMemberId: null,
      tags: input.tags ?? [],
      consentedAt: now,
      unsubscribedAt: null,
      lastSyncedAt: null,
    });

    return {
      status: "api-error",
      message: data?.detail ?? "Mailchimp did not accept the newsletter subscriber update.",
      missingConfig: config.missingConfig,
    };
  }

  await repository.save({
    email,
    source: input.source,
    status: data.status ?? "subscribed",
    mailchimpAudienceId: config.audienceId,
    mailchimpMemberId: data.id,
    tags: input.tags ?? [],
    consentedAt: now,
    unsubscribedAt: null,
    lastSyncedAt: now,
  });

  return {
    status: "subscribed",
    message: "You are on the list. Expect first access to new arrivals and studio releases.",
    missingConfig: [],
  };
}

export async function applyMailchimpWebhookUpdate(input: {
  email: string;
  status: "subscribed" | "unsubscribed" | "cleaned";
}) {
  const repository = createNewsletterSubscriberRepository();
  const existing = await repository.getByEmail(input.email.trim().toLowerCase());

  if (!existing) {
    return null;
  }

  return repository.updateStatusByEmail({
    email: existing.email,
    status: input.status,
    unsubscribedAt: input.status === "unsubscribed" || input.status === "cleaned" ? new Date() : null,
    lastSyncedAt: new Date(),
  });
}

export function createMailchimpSubscriberHash(email: string) {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

export function isAuthorizedMailchimpWebhook(secret: string | null) {
  const configuredSecret = getMailchimpConfig().webhookSecret;

  if (!configuredSecret) {
    return true;
  }

  if (!secret) {
    return false;
  }

  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(secret);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
