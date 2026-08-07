import "server-only";

import { isSupportedCheckoutCountry, supportedCheckoutCountryLabels } from "@/config/supported-markets";
import { createProductRepository, type ProductRepository } from "@/lib/db/repositories/product-repository";
import { calculateShippingUsd } from "@/lib/order/shipping";
import { createStripeMetadataChunks } from "@/lib/stripe/service";
import { validatePromoCode } from "@/lib/promos/service";
import type { OrderAddress } from "@/types/domain";
import type { ProductVariant } from "@/types/domain/product";

const orderDraftSnapshotMetadataKeyPrefix = "order_draft_snapshot_";

export type CheckoutOrderDraftLineItemRequest = {
  id: string;
  productId: string;
  productType: "rug" | "multiUnit";
  quantity: number;
  variantName?: string;
};

export type CheckoutOrderDraftRequest = {
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  items: CheckoutOrderDraftLineItemRequest[];
  promoCode?: string;
};

export type CheckoutOrderDraftSnapshot = {
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  promoCode?: string;
  discountUsd: number;
  items: Array<{
    id: string;
    productId: string;
    productType: "rug" | "multiUnit";
    name: string;
    slug: string;
    priceUsd: number;
    quantity: number;
    variant?: ProductVariant;
  }>;
  subtotalUsd: number;
  shippingUsd: number;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
};

export type CheckoutOrderDraftValidationIssue = {
  code: string;
  message: string;
  productId?: string;
};

export type CheckoutOrderDraftValidationResult =
  | {
      status: "ready";
      validatedDraft: CheckoutOrderDraftSnapshot;
      issues: [];
      message: string;
    }
  | {
      status: "invalid";
      validatedDraft: null;
      issues: CheckoutOrderDraftValidationIssue[];
      message: string;
    };

export async function validateCheckoutOrderDraft(input: {
  draft: CheckoutOrderDraftRequest;
  repository?: ProductRepository;
}): Promise<CheckoutOrderDraftValidationResult> {
  const { draft } = input;
  const repository = input.repository ?? createProductRepository();
  const products = await repository.listAll();
  const productById = new Map(products.map((product) => [product.id, product] as const));
  const issues: CheckoutOrderDraftValidationIssue[] = [];

  for (const [label, address] of [
    ["billing", draft.billingAddress],
    ["shipping", draft.shippingAddress],
  ] as const) {
    const requiredFields = [
      address?.fullName,
      address?.email,
      address?.address1,
      address?.city,
      address?.state,
      address?.postalCode,
    ];

    if (!address || requiredFields.some((value) => !value || value.trim().length === 0)) {
      issues.push({
        code: `missing-${label}-address`,
        message: `A complete ${label} address is required before checkout can continue.`,
      });
    }
  }

  if (draft.shippingAddress && !isSupportedCheckoutCountry(draft.shippingAddress.country)) {
    issues.push({
      code: "unsupported-market",
      message: `Checkout only supports ${supportedCheckoutCountryLabels.US} shipping addresses.`,
    });
  }

  if (!draft.items.length) {
    issues.push({
      code: "empty-cart",
      message: "At least one item is required before checkout can continue.",
    });
  }

  type ValidatedLineItem = CheckoutOrderDraftSnapshot["items"][number];

  const validatedLineItems = draft.items.flatMap((lineItem): ValidatedLineItem[] => {
    const product = productById.get(lineItem.productId);

    if (!product) {
      issues.push({
        code: "product-not-found",
        message: `Product ${lineItem.productId} no longer exists in the catalog.`,
        productId: lineItem.productId,
      });
      return [];
    }

    if (product.status !== "active") {
      issues.push({
        code: "product-unavailable",
        message: `Product ${product.id} is no longer available for checkout.`,
        productId: product.id,
      });
      return [];
    }

    if (product.type === "rug") {
      if (lineItem.quantity !== product.fixedQuantity) {
        issues.push({
          code: "invalid-rug-quantity",
          message: `Rug ${product.id} must be ordered in a quantity of 1.`,
          productId: product.id,
        });
        return [];
      }

      return [
        {
          id: lineItem.id,
          productId: product.id,
          productType: product.type,
          name: product.name,
          slug: product.slug,
          quantity: lineItem.quantity,
          priceUsd: product.priceUsd,
          variant: undefined,
        },
      ];
    }

    if (lineItem.quantity < 1) {
      issues.push({
        code: "invalid-quantity",
        message: `Product ${product.id} quantity must be at least 1.`,
        productId: product.id,
      });
      return [];
    }

    if (lineItem.variantName) {
      const matchedVariant = product.variants.find((variant) => variant.name === lineItem.variantName);

      if (!matchedVariant) {
        issues.push({
          code: "variant-not-found",
          message: `Product ${product.id} no longer has the selected variant.`,
          productId: product.id,
        });
        return [];
      }

      if (lineItem.quantity > matchedVariant.inventory) {
        issues.push({
          code: "insufficient-inventory",
          message: `Variant inventory for ${product.id} is lower than the requested quantity.`,
          productId: product.id,
        });
        return [];
      }

      return [
        {
          id: lineItem.id,
          productId: product.id,
          productType: product.type,
          name: product.name,
          slug: product.slug,
          quantity: lineItem.quantity,
          priceUsd: matchedVariant.priceUsd ?? product.priceUsd,
          variant: matchedVariant,
        },
      ];
    }

    if (lineItem.quantity > product.inventory) {
      issues.push({
        code: "insufficient-inventory",
        message: `Product ${product.id} inventory is lower than the requested quantity.`,
        productId: product.id,
      });
      return [];
    }

    return [
      {
        id: lineItem.id,
        productId: product.id,
        productType: product.type,
        name: product.name,
        slug: product.slug,
        quantity: lineItem.quantity,
        priceUsd: product.priceUsd,
        variant: undefined,
      },
    ];
  });

  const subtotalUsd = validatedLineItems.reduce(
    (runningTotal, lineItem) => runningTotal + lineItem.priceUsd * lineItem.quantity,
    0,
  );
  let discountUsd = 0;

  if (draft.promoCode) {
    const promoValidation = await validatePromoCode({
      code: draft.promoCode,
      subtotalUsd,
      items: validatedLineItems.map((lineItem) => ({
        productId: lineItem.productId,
        productCategory: productById.get(lineItem.productId)?.category ?? "decor",
        quantity: lineItem.quantity,
        priceUsd: lineItem.priceUsd,
      })),
    });

    if (promoValidation.status !== "valid") {
      issues.push({
        code: "invalid-promo",
        message: promoValidation.message,
      });
    } else {
      discountUsd = promoValidation.discountUsd;
    }
  }

  const shippingUsd = calculateShippingUsd(subtotalUsd - discountUsd);
  const totalUsd = subtotalUsd - discountUsd + shippingUsd;

  if (issues.length || !draft.billingAddress || !draft.shippingAddress) {
    return {
      status: "invalid",
      validatedDraft: null,
      issues,
      message: issues[0]?.message ?? "Checkout draft is invalid.",
    };
  }

  return {
    status: "ready",
    validatedDraft: {
      billingAddress: draft.billingAddress,
      shippingAddress: draft.shippingAddress,
      promoCode: draft.promoCode,
      discountUsd,
      items: validatedLineItems,
      subtotalUsd,
      shippingUsd,
      taxUsd: 0,
      totalUsd,
      currency: "USD",
    },
    issues: [],
    message: "Checkout draft validated against the catalog.",
  };
}

// Stripe metadata values are capped at 500 characters, so a validated
// snapshot (two addresses, line items, totals) is JSON-stringified and
// split across numbered keys, then reassembled in order on the way back.
export function buildCheckoutOrderDraftSnapshotMetadata(
  snapshot: CheckoutOrderDraftSnapshot,
): Record<string, string> {
  const metadata: Record<string, string> = {};

  createStripeMetadataChunks(JSON.stringify(snapshot)).forEach((chunk, index) => {
    metadata[`${orderDraftSnapshotMetadataKeyPrefix}${index}`] = chunk;
  });

  return metadata;
}

export function parseCheckoutOrderDraftSnapshotFromMetadata(
  metadata: Record<string, string | null | undefined>,
): CheckoutOrderDraftSnapshot | null {
  const chunkedValue = Object.entries(metadata)
    .flatMap(([key, value]) => {
      if (!key.startsWith(orderDraftSnapshotMetadataKeyPrefix) || typeof value !== "string") {
        return [];
      }

      const suffix = Number(key.slice(orderDraftSnapshotMetadataKeyPrefix.length));

      return Number.isInteger(suffix) ? [{ suffix, value }] : [];
    })
    .sort((left, right) => left.suffix - right.suffix)
    .map((entry) => entry.value)
    .join("");

  if (!chunkedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(chunkedValue) as CheckoutOrderDraftSnapshot;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.billingAddress ||
      !parsed.shippingAddress ||
      !Array.isArray(parsed.items) ||
      typeof parsed.totalUsd !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
