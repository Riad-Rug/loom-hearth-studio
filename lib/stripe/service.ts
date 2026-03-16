import "server-only";

import {
  getStripeCheckoutServiceConfig,
  launchStripeIntegrationMode,
} from "@/lib/stripe/config";
import type {
  StripeCheckoutSessionCreationResult,
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
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
