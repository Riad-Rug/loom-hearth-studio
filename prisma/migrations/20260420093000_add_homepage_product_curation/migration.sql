ALTER TABLE "CatalogProduct"
ADD COLUMN "homepageFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "homepageRank" INTEGER;

CREATE INDEX "CatalogProduct_homepageFeatured_homepageRank_idx"
ON "CatalogProduct"("homepageFeatured", "homepageRank");
