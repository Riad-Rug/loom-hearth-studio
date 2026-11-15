// The body of POST /api/checkout/complete, shared by the route and the review step.
export type CompleteOrderResponse =
  | {
      status: "created";
      order: {
        orderNumber: string;
        totalUsd: number;
        currency: "USD";
        paymentIntentId: string;
        items: Array<{ id: string; name: string; quantity: number; sku: string | null }>;
      };
      message: string;
    }
  | {
      // Another order holds a unit. "unavailable": nothing was saved and cardHold
      // says whether the buyer's hold was released. "oversold": the payment had
      // already been captured, so orderNumber names the order the studio will refund.
      status: "unavailable" | "oversold";
      order: null;
      orderNumber: string | null;
      cardHold: "released" | "captured" | "unresolved";
      unavailableItems: Array<{ productId: string; name: string }>;
      message: string;
    }
  | {
      status: "invalid-request" | "ignored" | "configuration-error" | "api-error";
      order: null;
      message: string;
    };
