import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import {
  getStripeCheckoutServiceConfig,
  getStripeCheckoutWebhookConfig,
  launchStripeIntegrationMode,
} from "@/lib/stripe/config";
import type {
  StripeCheckoutSessionCreationResult,
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
  StripeWebhookSignature,
  StripeWebhookSignatureVerificationResult,
} from "@/lib/stripe/contracts";

export async function createStripeCheckoutSession(
  input: StripeCheckoutSessionRequest,
): Promise<StripeCheckoutSessionResponse> {
  const result = await createStripeCheckoutSessionWithResult(input);

  if (!result.session) {
    throw new Error(result.message);
  }

  return result.session;
}

export async function createStripeCheckoutSessionWithResult(
  input: StripeCheckoutSessionRequest,
): Promise<StripeCheckoutSessionCreationResult> {
  const config = getStripeCheckoutServiceConfig();

  if (!config.secretKey) {
    return {
      status: "configuration-error",
      session: null,
      redirectTarget: null,
      message: "Stripe secret key is missing for Checkout session creation.",
    };
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: createStripeCheckoutSessionFormBody(input),
    cache: "no-store",
  });

  const data = (await response.json()) as {
    id?: string;
    url?: string;
    expires_at?: number;
    error?: { message?: string };
  };

  if (!response.ok || !data.id) {
    return {
      status: "api-error",
      session: null,
      redirectTarget: null,
      message:
        data.error?.message ??
        "Stripe Checkout session creation failed at the execution boundary.",
    };
  }

  const session: StripeCheckoutSessionResponse = {
    id: data.id,
    mode: launchStripeIntegrationMode,
    url: data.url,
    expiresAt: data.expires_at
      ? new Date(data.expires_at * 1000).toISOString()
      : undefined,
    status: "created",
  };

  return {
    status: "created",
    session,
    redirectTarget: session.url ?? null,
    message: "Stripe Checkout session created.",
  };
}

export function verifyStripeCheckoutWebhookSignature(input: {
  payload: string;
  signatureHeader: string | null;
}): StripeWebhookSignatureVerificationResult {
  const config = getStripeCheckoutWebhookConfig();

  if (!config.webhookSecret) {
    return {
      status: "configuration-error",
      message:
        "Stripe webhook secret is missing for Checkout webhook signature verification.",
    };
  }

  if (!input.signatureHeader) {
    return {
      status: "missing-header",
      message: "Stripe webhook signature header is missing.",
    };
  }

  const parsedSignature = parseStripeWebhookSignature(input.signatureHeader);

  if (!parsedSignature) {
    return {
      status: "invalid-header",
      message: "Stripe webhook signature header is malformed.",
    };
  }

  const expectedSignature = createHmac("sha256", config.webhookSecret)
    .update(`${parsedSignature.timestamp}.${input.payload}`)
    .digest("hex");
  const hasMatchingSignature = parsedSignature.signatures.some((candidate) =>
    compareStripeSignatures(candidate, expectedSignature),
  );

  return hasMatchingSignature
    ? {
        status: "verified",
        message: "Stripe Checkout webhook signature verified.",
      }
    : {
        status: "mismatch",
        message: "Stripe Checkout webhook signature did not match the expected value.",
      };
}

function createStripeCheckoutSessionFormBody(input: StripeCheckoutSessionRequest) {
  const formBody = new URLSearchParams();

  formBody.set("mode", "payment");
  formBody.set("success_url", input.successUrl);
  formBody.set("cancel_url", input.cancelUrl);

  if (input.customerEmail) {
    formBody.set("customer_email", input.customerEmail);
  }

  formBody.set("metadata[checkout_mode]", input.metadata.checkoutMode);

  input.lineItems.forEach((item, index) => {
    formBody.set(`line_items[${index}][quantity]`, String(item.quantity));
    formBody.set(`line_items[${index}][price_data][currency]`, input.currency.toLowerCase());
    formBody.set(
      `line_items[${index}][price_data][unit_amount]`,
      String(Math.round(item.unitAmountUsd * 100)),
    );
    formBody.set(`line_items[${index}][price_data][product_data][name]`, item.name);
  });

  return formBody;
}

function parseStripeWebhookSignature(value: string): StripeWebhookSignature | null {
  const parts = value.split(",");
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, rawValue] = part.split("=", 2);
    const trimmedKey = key?.trim();
    const trimmedValue = rawValue?.trim();

    if (!trimmedKey || !trimmedValue) {
      continue;
    }

    if (trimmedKey === "t") {
      timestamp = trimmedValue;
      continue;
    }

    if (trimmedKey === "v1") {
      signatures.push(trimmedValue);
    }
  }

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return {
    timestamp,
    signatures,
    scheme: "v1",
  };
}

function compareStripeSignatures(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}
