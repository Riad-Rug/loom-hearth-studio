-- AlterTable
ALTER TABLE "OrderRecord" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "costsUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "otherCostUsd" DECIMAL(10,2),
ADD COLUMN     "packagingCostUsd" DECIMAL(10,2),
ADD COLUMN     "paymentFeeUsd" DECIMAL(10,2),
ADD COLUMN     "photosSentAt" TIMESTAMP(3),
ADD COLUMN     "productCostUsd" DECIMAL(10,2),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCostUsd" DECIMAL(10,2),
ADD COLUMN     "trackingNumber" TEXT;
