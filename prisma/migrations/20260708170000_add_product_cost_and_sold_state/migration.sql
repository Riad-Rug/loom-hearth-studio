-- Internal acquisition cost and sold lifecycle metadata.
ALTER TABLE "CatalogProduct"
ADD COLUMN "acquisitionCostMad" DECIMAL(12, 2),
ADD COLUMN "soldAt" TIMESTAMP(3);

CREATE INDEX "CatalogProduct_status_soldAt_idx" ON "CatalogProduct"("status", "soldAt");
