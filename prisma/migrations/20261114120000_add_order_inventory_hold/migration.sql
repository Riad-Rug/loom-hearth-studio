-- CreateEnum
CREATE TYPE "InventoryHold" AS ENUM ('held', 'sold', 'released', 'conflict');

-- AlterTable
ALTER TABLE "CatalogProduct" ADD COLUMN     "reservedByOrderId" TEXT;

-- AlterTable
ALTER TABLE "OrderRecord" ADD COLUMN     "holdExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inventoryHold" "InventoryHold";

