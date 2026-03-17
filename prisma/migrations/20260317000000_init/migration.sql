-- Launch commerce foundation: orders plus line items.
CREATE TYPE "CheckoutMode" AS ENUM ('guest');
CREATE TYPE "OrderStatus" AS ENUM (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);
CREATE TYPE "PaymentStatus" AS ENUM (
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded'
);

CREATE TABLE "OrderRecord" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "checkoutMode" "CheckoutMode" NOT NULL,
  "checkoutSessionId" TEXT NOT NULL,
  "paymentIntentId" TEXT,
  "status" "OrderStatus" NOT NULL,
  "paymentStatus" "PaymentStatus" NOT NULL,
  "customerEmail" TEXT,
  "shippingAddress" JSONB NOT NULL,
  "subtotalUsd" DECIMAL(10,2) NOT NULL,
  "shippingUsd" DECIMAL(10,2) NOT NULL,
  "taxUsd" DECIMAL(10,2) NOT NULL,
  "totalUsd" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "stripeEventType" TEXT NOT NULL,
  "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderLineItemRecord" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitAmountUsd" DECIMAL(10,2),

  CONSTRAINT "OrderLineItemRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderRecord_orderNumber_key" ON "OrderRecord"("orderNumber");
CREATE UNIQUE INDEX "OrderRecord_checkoutSessionId_key" ON "OrderRecord"("checkoutSessionId");
CREATE UNIQUE INDEX "OrderRecord_paymentIntentId_key" ON "OrderRecord"("paymentIntentId");
CREATE INDEX "OrderRecord_customerEmail_idx" ON "OrderRecord"("customerEmail");
CREATE INDEX "OrderRecord_placedAt_idx" ON "OrderRecord"("placedAt");
CREATE INDEX "OrderLineItemRecord_orderId_idx" ON "OrderLineItemRecord"("orderId");

ALTER TABLE "OrderLineItemRecord"
ADD CONSTRAINT "OrderLineItemRecord_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "OrderRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
