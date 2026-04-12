import "server-only";

import { createPromoRepository } from "@/lib/db/repositories/promo-repository";
import type { ProductCategory } from "@/types/domain";

export type PromoValidationCartItem = {
  productId: string;
  productCategory: ProductCategory;
  quantity: number;
  priceUsd: number;
};

export type PromoValidationResult =
  | {
      status: "valid";
      promoId: string;
      promoCode: string;
      discountUsd: number;
      adjustedTotalUsd: number;
      message: string;
    }
  | {
      status: "invalid";
      promoCode: string;
      discountUsd: 0;
      adjustedTotalUsd: number;
      message: string;
    };

export async function validatePromoCode(input: {
  code: string;
  subtotalUsd: number;
  items: PromoValidationCartItem[];
}): Promise<PromoValidationResult> {
  const promoCode = input.code.trim().toUpperCase();
  const repository = createPromoRepository();
  const promo = await repository.getByCode(promoCode);

  if (!promo || !promo.active) {
    return invalidResult(promoCode, input.subtotalUsd, "That promo code is not active.");
  }

  const now = Date.now();
  if (promo.startsAt && now < promo.startsAt.getTime()) {
    return invalidResult(promoCode, input.subtotalUsd, "That promo code is not active yet.");
  }

  if (promo.endsAt && now > promo.endsAt.getTime()) {
    return invalidResult(promoCode, input.subtotalUsd, "That promo code has expired.");
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return invalidResult(promoCode, input.subtotalUsd, "That promo code has reached its usage limit.");
  }

  if (promo.minimumSubtotalUsd !== null && input.subtotalUsd < Number(promo.minimumSubtotalUsd)) {
    return invalidResult(
      promoCode,
      input.subtotalUsd,
      `This code requires a minimum subtotal of ${formatUsd(Number(promo.minimumSubtotalUsd))}.`,
    );
  }

  const eligibleSubtotalUsd = getEligibleSubtotalUsd({
    items: input.items,
    scopeType: promo.scopeType,
    scopeCategory: promo.scopeCategory,
    scopeProductIds: Array.isArray(promo.scopeProductIds) ? (promo.scopeProductIds as string[]) : [],
  });

  if (eligibleSubtotalUsd <= 0) {
    return invalidResult(promoCode, input.subtotalUsd, "This promo code does not apply to the current cart.");
  }

  const discountUsd =
    promo.type === "percent"
      ? roundCurrency(eligibleSubtotalUsd * (Number(promo.amount) / 100))
      : Math.min(roundCurrency(Number(promo.amount)), eligibleSubtotalUsd);

  if (discountUsd <= 0) {
    return invalidResult(promoCode, input.subtotalUsd, "This promo code does not create a discount on the current cart.");
  }

  return {
    status: "valid",
    promoId: promo.id,
    promoCode,
    discountUsd,
    adjustedTotalUsd: Math.max(0, roundCurrency(input.subtotalUsd - discountUsd)),
    message: `${promoCode} applied. ${formatUsd(discountUsd)} will be deducted at checkout.`,
  };
}

export async function recordPromoRedemption(input: {
  promoCode: string;
  discountUsd: number;
  orderId: string | null;
  customerEmail: string | null;
}) {
  const repository = createPromoRepository();
  const promo = await repository.getByCode(input.promoCode.trim().toUpperCase());

  if (!promo || input.discountUsd <= 0) {
    return null;
  }

  await repository.incrementUsage({ promoId: promo.id });
  return repository.createRedemption({
    promoId: promo.id,
    orderId: input.orderId,
    customerEmail: input.customerEmail,
    code: promo.code,
    discountUsd: input.discountUsd,
  });
}

function getEligibleSubtotalUsd(input: {
  items: PromoValidationCartItem[];
  scopeType: "all" | "category" | "product";
  scopeCategory: string | null;
  scopeProductIds: string[];
}) {
  if (input.scopeType === "all") {
    return roundCurrency(input.items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0));
  }

  if (input.scopeType === "category") {
    return roundCurrency(
      input.items
        .filter((item) => item.productCategory === input.scopeCategory)
        .reduce((sum, item) => sum + item.priceUsd * item.quantity, 0),
    );
  }

  const eligibleIds = new Set(input.scopeProductIds);
  return roundCurrency(
    input.items
      .filter((item) => eligibleIds.has(item.productId))
      .reduce((sum, item) => sum + item.priceUsd * item.quantity, 0),
  );
}

function invalidResult(code: string, subtotalUsd: number, message: string): PromoValidationResult {
  return {
    status: "invalid",
    promoCode: code,
    discountUsd: 0,
    adjustedTotalUsd: roundCurrency(subtotalUsd),
    message,
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
