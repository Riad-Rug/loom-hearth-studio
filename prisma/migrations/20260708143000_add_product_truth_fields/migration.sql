-- Product truth fields required by the July 2026 catalog strategy.
ALTER TABLE "CatalogProduct"
ADD COLUMN "catalogNumber" TEXT,
ADD COLUMN "attributionRegion" TEXT,
ADD COLUMN "attributionConfidence" TEXT,
ADD COLUMN "provenanceNote" TEXT,
ADD COLUMN "sourcingNote" TEXT,
ADD COLUMN "conditionNote" TEXT,
ADD COLUMN "ageClass" TEXT,
ADD COLUMN "ageBasis" TEXT,
ADD COLUMN "verificationNotes" JSONB,
ADD COLUMN "shippingNotes" JSONB,
ADD COLUMN "careNote" TEXT;

CREATE UNIQUE INDEX "CatalogProduct_catalogNumber_key" ON "CatalogProduct"("catalogNumber");
