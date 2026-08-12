-- CreateTable
CREATE TABLE "BlogPostEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyFormat" TEXT,
    "publishedAt" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "targetKeyword" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostEntry_status_idx" ON "BlogPostEntry"("status");

-- CreateIndex
CREATE INDEX "BlogPostEntry_status_updatedAt_idx" ON "BlogPostEntry"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostEntry_slug_categorySlug_key" ON "BlogPostEntry"("slug", "categorySlug");
