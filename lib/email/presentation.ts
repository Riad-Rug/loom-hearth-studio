import type {
  OrderConfirmationEmailPayload,
  OrderConfirmationEmailPreview,
} from "@/lib/email/contracts";

export type OrderConfirmationEmailPresentation = {
  headline: string;
  stateLabel: string;
  toLabel: string | null;
  subjectLabel: string | null;
  itemCountLabel: string | null;
  totalLabel: string | null;
  previewTextLabel: string | null;
};

function formatEmailPreviewTotal(totalUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalUsd);
}

export function createOrderConfirmationEmailPresentation(input: {
  payload: OrderConfirmationEmailPayload | null;
  preview: OrderConfirmationEmailPreview | null;
}): OrderConfirmationEmailPresentation {
  const { payload, preview } = input;

  return {
    headline: "Order confirmation email boundary",
    stateLabel:
      payload && preview
        ? "State: placeholder payload ready"
        : "No confirmation email payload is available until the submission attempt succeeds.",
    toLabel: payload ? `To: ${payload.to}` : null,
    subjectLabel: preview ? `Subject: ${preview.subject}` : null,
    itemCountLabel: payload ? `Items: ${payload.itemCount}` : null,
    totalLabel: payload
      ? `Total: ${formatEmailPreviewTotal(payload.totalUsd)} ${payload.currency}`
      : null,
    previewTextLabel: preview?.message.text ? `Preview text: ${preview.message.text}` : null,
  };
}
