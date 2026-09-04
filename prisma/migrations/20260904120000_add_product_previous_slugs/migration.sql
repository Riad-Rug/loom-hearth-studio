-- AlterTable
ALTER TABLE "CatalogProduct" ADD COLUMN     "previousSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
