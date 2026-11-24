-- Additive only: new nullable columns on CatalogProduct and a new RugRegion table.
-- Existing columns (rugStyle, attributionRegion, ...) are untouched.

-- CreateTable
CREATE TABLE "RugRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RugRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RugRegion_name_key" ON "RugRegion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RugRegion_slug_key" ON "RugRegion"("slug");

-- AddForeignKey
ALTER TABLE "RugRegion" ADD CONSTRAINT "RugRegion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RugRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "CatalogProduct" ADD COLUMN "rugType" TEXT,
ADD COLUMN "pileHeight" TEXT,
ADD COLUMN "regionId" TEXT;

-- CreateIndex
CREATE INDEX "CatalogProduct_regionId_idx" ON "CatalogProduct"("regionId");

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RugRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed regions (exact spellings). Parents first. Glaoui and Ait Ougharda are
-- regions in the Taznakht area, so they sit under Taznakht and display as
-- "Glaoui, Taznakht". The Bejaâd slug stays "boujad" to match the existing
-- /shop/rugs/boujad collection.
INSERT INTO "RugRegion" ("id", "name", "slug", "parentId") VALUES
    ('region_morocco', 'Morocco', 'morocco', NULL),
    ('region_middle_atlas', 'Middle Atlas', 'middle-atlas', NULL),
    ('region_high_atlas', 'High Atlas', 'high-atlas', NULL),
    ('region_zemmour', 'Zemmour', 'zemmour', NULL),
    ('region_bejaad', 'Bejaâd', 'boujad', NULL),
    ('region_taznakht', 'Taznakht', 'taznakht', NULL),
    ('region_ait_ougharda', 'Ait Ougharda', 'ait-ougharda', 'region_taznakht'),
    ('region_glaoui', 'Glaoui', 'glaoui', 'region_taznakht'),
    ('region_tiflet', 'Tiflet', 'tiflet', 'region_zemmour'),
    ('region_khemisset', 'Khemisset', 'khemisset', 'region_zemmour'),
    ('region_azilal', 'Azilal', 'azilal', 'region_high_atlas'),
    ('region_beni_ourain', 'Beni Ourain', 'beni-ourain', 'region_middle_atlas'),
    ('region_beni_mguild', 'Beni M''Guild', 'beni-m-guild', 'region_middle_atlas')
ON CONFLICT DO NOTHING;
