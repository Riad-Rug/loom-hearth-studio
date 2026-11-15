-- CreateEnum
CREATE TYPE "InventoryHold" AS ENUM ('held', 'sold', 'released');

-- AlterTable
ALTER TABLE "OrderRecord" ADD COLUMN     "inventoryHold" "InventoryHold";

