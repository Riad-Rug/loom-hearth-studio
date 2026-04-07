import "server-only";

import { isSupportedCheckoutCountry, supportedCheckoutCountryLabels } from "@/config/supported-markets";
import type {
  LaunchCheckoutValidationIssue,
  LaunchCheckoutValidationResult,
} from "@/lib/catalog/contracts";
import { createProductRepository, type ProductRepository } from "@/lib/db/repositories/product-repository";
import type {
  StripeCheckoutOrderSnapshot,
  StripeCheckoutSessionRequest,
} from "@/lib/stripe/contracts";
import type { Product } from "@/types/domain";

export async function validateCheckoutSessionRequestAgainstLaunchCatalog(input: {
  request: StripeCheckoutSessionRequest;
  repository?: ProductRepository;
}): Promise<LaunchCheckoutValidationResult> {
  const repository = input.repository ?? createProductRepository();
  const products = await repository.listAll();
  const issues: LaunchCheckoutValidationIssue[] = [];
  const productById = new Map(products.map((product) => [product.id, product] as const));
  const parsedSnapshot = input.request.metadata.orderSnapshot
    ? parseCheckoutOrderSnapshot(input.request.metadata.orderSnapshot)
    : null;

  if (input.request.metadata.checkoutMode !== "guest") {
    issues.push({
      code: "unsupported-checkout-mode",
      message: "Only guest checkout is supported for the launch Checkout boundary.",
    });
  }

  if (input.request.currency !== "USD") {
    issues.push({
      code: "unsupported-currency",
      message: "Launch Checkout only supports USD.",
    });
  }

  if (input.request.shippingUsd !== 0) {
    issues.push({
      code: "invalid-shipping",
      message: "Launch shipping must remain fixed at $0.00.",
    });
  }

  if (input.request.taxUsd !== 0) {
    issues.push({
      code: "invalid-tax",
      message: "Launch tax must remain fixed at $0.00 until tax handling is implemented.",
    });
  }

  if (!parsedSnapshot?.shippingAddress) {
    issues.push({
      code: "missing-shipping-address",
      message: "A shipping address is required before a Checkout session can be created.",
    });
  }

  if (
    parsedSnapshot?.shippingAddress &&
    !isSupportedCheckoutCountry(parsedSnapshot.shippingAddress.country)
  ) {
    issues.push({
      code: "unsupported-market",
      message: `Launch Checkout only supports ${supportedCheckoutCountryLabels.US} shipping addresses.`,
    });
  }

  if (parsedSnapshot?.shippingAddress) {
    const requiredShippingFields = [
      parsedSnapshot.shippingAddress.fullName,
      parsedSnapshot.shippingAddress.email,
      parsedSnapshot.shippingAddress.address1,
      parsedSnapshot.shippingAddress.city,
      parsedSnapshot.shippingAddress.state,
      parsedSnapshot.shippingAddress.postalCode,
    ];

    if (requiredShippingFields.some((value) => value.trim().length === 0)) {
      issues.push({
        code: "missing-shipping-address",
        message: `Launch Checkout requires a complete ${supportedCheckoutCountryLabels.US} shipping address.`,
      });
    }
  }

  if (!input.request.lineItems.length) {
    issues.push({
      code: "empty-cart",
      message: "At least one launch catalog item is required before Checkout can begin.",
    });
  }

  const validatedLineItems = input.request.lineItems.flatMap((lineItem) => {
    const product = productById.get(lineItem.productId);

    if (!product) {
      issues.push({
        code: "product-not-found",
        message: `Product ${lineItem.productId} no longer exists in the launch catalog.`,
        lineItemId: lineItem.id,
        productId: lineItem.productId,
      });
      return [];
    }

    const lineItemIssues = validateLineItem({ lineItem, product });
    issues.push(...lineItemIssues);

    if (lineItemIssues.length) {
      return [];
    }

    const validatedVariant =
      product.type === "multiUnit" && lineItem.variant
        ? product.variants.find((variant) => variant.name === lineItem.variant?.name) ?? undefined
        : undefined;
    const validatedUnitAmountUsd = validatedVariant?.priceUsd ?? product.priceUsd;

    return [
      {
        id: lineItem.id,
        productId: product.id,
        productType: product.type,
        name: product.name,
        slug: product.slug,
        quantity: lineItem.quantity,
        unitAmountUsd: validatedUnitAmountUsd,
        variant: validatedVariant,
      },
    ];
  });

  const validatedSubtotalUsd = validatedLineItems.reduce(
    (runningTotal, lineItem) => runningTotal + lineItem.unitAmountUsd * lineItem.quantity,
    0,
  );
  const validatedTotalUsd = validatedSubtotalUsd + input.request.shippingUsd + input.request.taxUsd;

  if (input.request.subtotalUsd !== validatedSubtotalUsd) {
    issues.push({
      code: "subtotal-mismatch",
      message: "Checkout subtotal does not match the launch catalog prices.",
    });
  }

  if (input.request.totalUsd !== validatedTotalUsd) {
    issues.push({
      code: "total-mismatch",
      message: "Checkout total does not match the launch catalog prices and launch shipping assumptions.",
    });
  }

  if (
    parsedSnapshot?.shippingAddress?.email &&
    input.request.customerEmail &&
    input.request.customerEmail !== parsedSnapshot.shippingAddress.email
  ) {
    issues.push({
      code: "customer-email-mismatch",
      message: "Checkout customer email must match the shipping address email for launch orders.",
    });
  }

  if (issues.length || !parsedSnapshot?.shippingAddress) {
    return {
      status: "invalid",
      validatedRequest: null,
      issues,
      message: issues[0]?.message ?? "Checkout session request is invalid.",
    };
  }

  const validatedSnapshot: StripeCheckoutOrderSnapshot = {
    shippingAddress: parsedSnapshot.shippingAddress,
    items: validatedLineItems.map((lineItem) => ({
      id: lineItem.id,
      productId: lineItem.productId,
      productType: lineItem.productType,
      name: lineItem.name,
      slug: lineItem.slug,
      priceUsd: lineItem.unitAmountUsd,
      quantity: lineItem.quantity,
      variant: lineItem.variant,
    })),
    subtotalUsd: validatedSubtotalUsd,
    shippingUsd: 0,
    taxUsd: 0,
    totalUsd: validatedTotalUsd,
    currency: "USD",
  };

  return {
    status: "ready",
    validatedRequest: {
      mode: "checkout",
      customerEmail: parsedSnapshot.shippingAddress.email,
      successUrl: input.request.successUrl,
      cancelUrl: input.request.cancelUrl,
      currency: "USD",
      subtotalUsd: validatedSubtotalUsd,
      shippingUsd: 0,
      taxUsd: 0,
      totalUsd: validatedTotalUsd,
      lineItems: validatedLineItems,
      metadata: {
        checkoutMode: "guest",
        orderSnapshot: JSON.stringify(validatedSnapshot),
      },
    },
    issues: [],
    message: "Checkout session request validated against the launch catalog.",
  };
}

function validateLineItem(input: {
  lineItem: StripeCheckoutSessionRequest["lineItems"][number];
  product: Product;
}): LaunchCheckoutValidationIssue[] {
  const issues: LaunchCheckoutValidationIssue[] = [];
  const expectedUnitAmountUsd = input.product.priceUsd;

  if (input.lineItem.productType !== input.product.type) {
    issues.push({
      code: "product-type-mismatch",
      message: `Product ${input.product.id} no longer matches the requested product type.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  if (input.lineItem.slug !== input.product.slug) {
    issues.push({
      code: "slug-mismatch",
      message: `Product ${input.product.id} no longer matches the requested slug.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  if (input.lineItem.name !== input.product.name) {
    issues.push({
      code: "name-mismatch",
      message: `Product ${input.product.id} no longer matches the requested product name.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  if (input.product.type === "rug") {
    if (input.lineItem.quantity !== input.product.fixedQuantity) {
      issues.push({
        code: "invalid-rug-quantity",
        message: `Rug ${input.product.id} must be ordered in a quantity of 1.`,
        lineItemId: input.lineItem.id,
        productId: input.product.id,
      });
    }

    if (input.lineItem.unitAmountUsd !== expectedUnitAmountUsd) {
      issues.push({
        code: "price-mismatch",
        message: `Rug ${input.product.id} price does not match the launch catalog.`,
        lineItemId: input.lineItem.id,
        productId: input.product.id,
      });
    }

    return issues;
  }

  if (input.lineItem.quantity < 1) {
    issues.push({
      code: "invalid-quantity",
      message: `Product ${input.product.id} quantity must be at least 1.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  if (input.lineItem.variant) {
    const matchedVariant = input.product.variants.find(
      (variant) => variant.name === input.lineItem.variant?.name,
    );

    if (!matchedVariant) {
      issues.push({
        code: "variant-not-found",
        message: `Product ${input.product.id} no longer has the selected launch variant.`,
        lineItemId: input.lineItem.id,
        productId: input.product.id,
      });
      return issues;
    }

    const variantUnitAmountUsd = matchedVariant.priceUsd ?? input.product.priceUsd;

    if (input.lineItem.unitAmountUsd !== variantUnitAmountUsd) {
      issues.push({
        code: "price-mismatch",
        message: `Variant pricing for ${input.product.id} does not match the launch catalog.`,
        lineItemId: input.lineItem.id,
        productId: input.product.id,
      });
    }

    if (input.lineItem.quantity > matchedVariant.inventory) {
      issues.push({
        code: "insufficient-inventory",
        message: `Variant inventory for ${input.product.id} is lower than the requested quantity.`,
        lineItemId: input.lineItem.id,
        productId: input.product.id,
      });
    }

    return issues;
  }

  if (input.lineItem.unitAmountUsd !== expectedUnitAmountUsd) {
    issues.push({
      code: "price-mismatch",
      message: `Product ${input.product.id} price does not match the launch catalog.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  if (input.lineItem.quantity > input.product.inventory) {
    issues.push({
      code: "insufficient-inventory",
      message: `Product ${input.product.id} inventory is lower than the requested quantity.`,
      lineItemId: input.lineItem.id,
      productId: input.product.id,
    });
  }

  return issues;
}

function parseCheckoutOrderSnapshot(value: string): StripeCheckoutOrderSnapshot | null {
  try {
    return JSON.parse(value) as StripeCheckoutOrderSnapshot;
  } catch {
    return null;
  }
}

