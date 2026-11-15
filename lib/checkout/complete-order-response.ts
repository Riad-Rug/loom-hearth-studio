type UnavailablePiece = { productId: string; name: string };

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
      // Another order holds a unit and nothing was saved. "unresolved": the hold
      // on the buyer's card could not be released yet.
      status: "unavailable";
      order: null;
      orderNumber: null;
      cardHold: "released" | "unresolved";
      unavailableItems: UnavailablePiece[];
      message: string;
    }
  | {
      // Another order holds a unit, but the payment had already been captured, so
      // orderNumber names the order the studio will refund.
      status: "oversold";
      order: null;
      orderNumber: string;
      cardHold: "captured";
      unavailableItems: UnavailablePiece[];
      message: string;
    }
  | {
      status: "invalid-request" | "ignored" | "configuration-error" | "api-error";
      order: null;
      message: string;
    };
