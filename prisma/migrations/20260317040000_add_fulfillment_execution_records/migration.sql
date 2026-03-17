-- CreateTable
CREATE TABLE "FulfillmentExecutionRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "orderStatus" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "resultLabel" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentExecutionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FulfillmentExecutionRecord_orderId_trigger_orderStatus_key" ON "FulfillmentExecutionRecord"("orderId", "trigger", "orderStatus");

-- CreateIndex
CREATE INDEX "FulfillmentExecutionRecord_orderId_createdAt_idx" ON "FulfillmentExecutionRecord"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "FulfillmentExecutionRecord" ADD CONSTRAINT "FulfillmentExecutionRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
