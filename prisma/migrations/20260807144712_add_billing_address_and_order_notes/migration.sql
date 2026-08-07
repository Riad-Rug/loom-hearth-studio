-- AlterTable
ALTER TABLE "OrderRecord" ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "customerNotes" TEXT,
ADD COLUMN     "customerNotesSubmittedAt" TIMESTAMP(3),
ALTER COLUMN "checkoutSessionId" DROP NOT NULL;
