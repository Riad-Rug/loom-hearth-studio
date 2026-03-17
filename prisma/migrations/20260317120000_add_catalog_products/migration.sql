-- Persisted catalog products for admin-managed launch catalog.
CREATE TYPE "ProductCategory" AS ENUM ('rugs', 'poufs', 'pillows', 'decor', 'vintage');

CREATE TABLE "CatalogProduct" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ProductCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "priceUsd" DECIMAL(10,2) NOT NULL,
  "origin" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "images" JSONB NOT NULL,
  "materials" JSONB NOT NULL,
  "seoTitle" TEXT NOT NULL,
  "seoDescription" TEXT NOT NULL,
  "rugStyle" TEXT,
  "dimensionsCm" JSONB,
  "weightKg" DECIMAL(10,2),
  "fixedQuantity" INTEGER,
  "inventory" INTEGER,
  "lowStockThreshold" INTEGER,
  "variants" JSONB,
  "notifyMeEnabled" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CatalogProduct_slug_category_key" ON "CatalogProduct"("slug", "category");
CREATE INDEX "CatalogProduct_status_idx" ON "CatalogProduct"("status");
CREATE INDEX "CatalogProduct_category_status_idx" ON "CatalogProduct"("category", "status");
CREATE INDEX "CatalogProduct_type_status_idx" ON "CatalogProduct"("type", "status");
