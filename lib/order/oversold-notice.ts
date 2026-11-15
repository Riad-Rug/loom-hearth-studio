import type { EmailMessage } from "@/lib/email/types";

// An oversold order was paid for a piece another buyer reserved first. The buyer
// learns that from the checkout or, when the webhook created the order, only
// from this email; the studio gets the refund to do.
export function createOversoldEmails(input: {
  orderNumber: string;
  buyerEmail: string;
  buyerName: string;
  studioEmail: string | undefined;
  paymentIntentId: string | null;
  pieceNames: string[];
}): EmailMessage[] {
  const pieces = input.pieceNames.length ? input.pieceNames.join(", ") : "a piece in your order";
  const buyerLines = [
    `Hi ${input.buyerName},`,
    `Your payment for order ${input.orderNumber} went through, but ${pieces} had been reserved by another buyer moments before.`,
    "We will refund your payment in full. You do not need to do anything, and we will email you when the refund is on its way.",
    "We are sorry for the disappointment. Reply to this email if you would like help finding a similar piece.",
  ];
  const studioLines = [
    `Order ${input.orderNumber} was paid for stock another order already holds: ${pieces}.`,
    `Refund it in Stripe (PaymentIntent ${input.paymentIntentId ?? "unknown"}), then mark the order Refunded in the admin.`,
    "The buyer has been told a full refund is coming.",
  ];

  return [
    toEmail(input.buyerEmail, `Order ${input.orderNumber}: your piece was no longer available`, buyerLines),
    ...(input.studioEmail
      ? [toEmail(input.studioEmail, `Oversold: refund order ${input.orderNumber}`, studioLines)]
      : []),
  ];
}

function toEmail(to: string, subject: string, lines: string[]): EmailMessage {
  return {
    to,
    subject,
    text: lines.join("\n\n"),
    html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(""),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
