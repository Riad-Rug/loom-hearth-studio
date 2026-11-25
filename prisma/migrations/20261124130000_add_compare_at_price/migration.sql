-- Additive only: an optional "was" price for showing a piece as on sale.
-- Display only; checkout always charges priceUsd.
ALTER TABLE "CatalogProduct" ADD COLUMN "compareAtPriceUsd" DECIMAL(10,2);

-- A compare-at price must be above the price it is compared with.
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_compareAtPriceUsd_check"
  CHECK ("compareAtPriceUsd" IS NULL OR "compareAtPriceUsd" > "priceUsd");
