import type {
  OrderConfirmationEmailBoundary,
  OrderConfirmationEmailDeliveryResult,
  OrderConfirmationEmailPayload,
  OrderConfirmationEmailPreview,
  OrderConfirmationEmailRequest,
  PostmarkEmailPayload,
} from "@/lib/email/contracts";
import type {
  OrderCreationRequest,
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order";
import type { Order } from "@/types/domain";

export function createOrderConfirmationEmailPayload(input: {
  submissionPayload: OrderSubmissionPayload | null;
  submissionPreview: OrderSubmissionPreview | null;
}): OrderConfirmationEmailPayload | null {
  const { submissionPayload, submissionPreview } = input;

  if (!submissionPayload || !submissionPreview) {
    return null;
  }

  return {
    to: submissionPayload.email,
    orderReference: submissionPreview.orderReference,
    customerName: submissionPayload.shippingAddress.fullName,
    shippingLabel: submissionPayload.shippingMethod.label,
    totalUsd: submissionPayload.totalUsd,
    currency: submissionPayload.currency,
    itemCount: submissionPayload.items.reduce(
      (runningTotal, item) => runningTotal + item.quantity,
      0,
    ),
  };
}

export function createOrderConfirmationEmailPreview(
  payload: OrderConfirmationEmailPayload | null,
): OrderConfirmationEmailPreview | null {
  if (!payload) {
    return null;
  }

  const subject = `Order received - pre-shipment verification next (${payload.orderReference})`;
  const text = [
    `Hi ${payload.customerName},`,
    "",
    "Thank you for your order. We have received it and your payment method has been authorised at checkout, but payment has not been captured yet.",
    `Within the pre-shipment verification window, up to 7 days from your order date, we will email you a video of the actual piece for review.`,
    "If you confirm the piece, we will capture payment and ship your order.",
    "If you decline after the verification, the authorisation will be released in full and no charge will be collected.",
  ].join("\n");

  return {
    status: "placeholder",
    subject,
    message: {
      to: payload.to,
      subject,
      html: [
        `<p>Hi ${escapeHtml(payload.customerName)},</p>`,
        "<p>Thank you for your order. We have received it and your payment method has been authorised at checkout, but payment has not been captured yet.</p>",
        "<p>Within the pre-shipment verification window, up to 7 days from your order date, we will email you a video of the actual piece for review.</p>",
        "<p>If you confirm the piece, we will capture payment and ship your order.</p>",
        "<p>If you decline after the verification, the authorisation will be released in full and no charge will be collected.</p>",
      ].join(""),
      text,
    },
  };
}

export function createOrderConfirmationEmailBoundary(): OrderConfirmationEmailBoundary {
  return {
    source: "order-creation",
    deliveryProvider: "postmark",
    status: "ready-placeholder",
    acceptedPaymentStatuses: ["paid"],
  };
}

export function createOrderConfirmationEmailRequestFromCreatedOrder(input: {
  order: Pick<
    Order,
    | "id"
    | "orderNumber"
    | "items"
    | "paymentStatus"
    | "shippingAddress"
    | "totalUsd"
    | "currency"
    | "placedAt"
  >;
  orderCreationRequest: OrderCreationRequest | null;
}): OrderConfirmationEmailDeliveryResult {
  const boundary = createOrderConfirmationEmailBoundary();
  const { order, orderCreationRequest } = input;
  const itemSummaryLines = order.items.map((item) =>
    createEmailItemSummaryLine({
      name: item.name,
      quantity: item.quantity,
      totalUsd: item.priceUsd * item.quantity,
    }),
  );
  const shippingAddressLabel = createShippingAddressLabel(order.shippingAddress);
  const placedAtLabel = formatOrderConfirmationPlacedAt(order.placedAt);
  const itemCount = order.items.reduce((runningTotal, item) => runningTotal + item.quantity, 0);

  if (!orderCreationRequest) {
    return {
      status: "ignored",
      request: null,
      message:
        "Order creation request is required before a confirmation email handoff can be prepared.",
    };
  }

  if (order.paymentStatus !== "paid") {
    return {
      status: "ignored",
      request: null,
      message: "Only created paid orders can hand off into confirmation email delivery.",
    };
  }

  const request: OrderConfirmationEmailRequest = {
    source: "created-order",
    orderId: order.id,
    orderNumber: order.orderNumber,
    to: order.shippingAddress.email,
    customerName: order.shippingAddress.fullName,
    shippingLabel: null,
    totalUsd: order.totalUsd,
    currency: order.currency,
    itemCount,
    itemSummaryLines,
    shippingAddressLabel,
    placedAtLabel,
    paymentStatus: boundary.acceptedPaymentStatuses[0],
    message: createLaunchOrderConfirmationMessage({
      to: order.shippingAddress.email,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress.fullName,
      itemCount,
      itemSummaryLines,
      shippingAddressLabel,
      totalUsd: order.totalUsd,
      currency: order.currency,
      placedAtLabel,
    }),
  };

  return {
    status: "ready",
    request,
    message: "Created order is ready to hand off into confirmation email delivery.",
  };
}

export function createPostmarkEmailPayload(input: {
  fromEmail: string;
  request: OrderConfirmationEmailRequest;
}): PostmarkEmailPayload {
  return {
    From: input.fromEmail,
    To: input.request.to,
    Subject: input.request.message.subject,
    HtmlBody: input.request.message.html,
    TextBody: input.request.message.text,
    MessageStream: "outbound",
  };
}

function createLaunchOrderConfirmationMessage(input: {
  to: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  itemSummaryLines: string[];
  shippingAddressLabel: string;
  totalUsd: number;
  currency: "USD";
  placedAtLabel: string;
}) {
  const totalLabel = formatEmailMoney(input.totalUsd);
  const itemListHtml = input.itemSummaryLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const itemListText = input.itemSummaryLines.map((line) => `- ${line}`).join("\n");

  return {
    to: input.to,
    subject: `Order received - pre-shipment verification next (${input.orderNumber})`,
    html: [
      `<p>Hi ${escapeHtml(input.customerName)},</p>`,
      "<p>Thank you for your order with Loom & Hearth Studio. We have received your order, and your payment method has been authorised at checkout, but payment has not been captured yet.</p>",
      `<p>Within the pre-shipment verification window, up to 7 days from ${escapeHtml(input.placedAtLabel.replace("Order received ", ""))}, you will receive an email with a video of the actual piece for review.</p>`,
      "<p>If you confirm the piece, we will capture payment and ship your order.</p>",
      "<p>If you decline after the verification, the authorisation will be released in full and no charge will be collected.</p>",
      `<p><strong>Order number:</strong> ${escapeHtml(input.orderNumber)}<br />`,
      `<strong>${escapeHtml(input.placedAtLabel)}</strong><br />`,
      `<strong>Total:</strong> ${escapeHtml(totalLabel)} ${escapeHtml(input.currency)}</p>`,
      `<p><strong>Items (${input.itemCount})</strong></p>`,
      `<ul>${itemListHtml}</ul>`,
      `<p><strong>Shipping address</strong><br />${escapeHtml(input.shippingAddressLabel).replace(/\n/g, "<br />")}</p>`,
      "<p>Launch shipping is limited to the United States and is fixed at $0.00.</p>",
      "<p>If you need help with this order, reply to this email and we will assist you.</p>",
      "<p>Thank you,<br />Loom & Hearth Studio</p>",
    ].join(""),
    text: [
      `Hi ${input.customerName},`,
      "",
      "Thank you for your order with Loom & Hearth Studio. We have received your order, and your payment method has been authorised at checkout, but payment has not been captured yet.",
      `Within the pre-shipment verification window, up to 7 days from ${input.placedAtLabel.replace("Order received ", "")}, you will receive an email with a video of the actual piece for review.`,
      "If you confirm the piece, we will capture payment and ship your order.",
      "If you decline after the verification, the authorisation will be released in full and no charge will be collected.",
      "",
      `Order number: ${input.orderNumber}`,
      input.placedAtLabel,
      `Total: ${totalLabel} ${input.currency}`,
      "",
      `Items (${input.itemCount})`,
      itemListText,
      "",
      "Shipping address",
      input.shippingAddressLabel,
      "",
      "Launch shipping is limited to the United States and is fixed at $0.00.",
      "If you need help with this order, reply to this email and we will assist you.",
      "",
      "Thank you,",
      "Loom & Hearth Studio",
    ].join("\n"),
  };
}

function createEmailItemSummaryLine(input: {
  name: string;
  quantity: number;
  totalUsd: number;
}) {
  return `${input.name} x${input.quantity} - ${formatEmailMoney(input.totalUsd)}`;
}

function createShippingAddressLabel(address: Order["shippingAddress"]) {
  return [
    address.fullName,
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatOrderConfirmationPlacedAt(placedAt: string) {
  return `Order received ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt))}`;
}

function formatEmailMoney(amountUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountUsd);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

