-- CreateEnum
CREATE TYPE "public"."PromoType" AS ENUM ('percent', 'fixed');

-- CreateEnum
CREATE TYPE "public"."PromoScopeType" AS ENUM ('all', 'category', 'product');

-- AlterTable
ALTER TABLE "public"."OrderRecord" ADD COLUMN     "discountUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT;

-- CreateTable
CREATE TABLE "public"."SeoSetting" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityKey" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "canonicalUrl" TEXT,
    "robotsIndex" BOOLEAN,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsletterSubscriberRecord" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mailchimpAudienceId" TEXT,
    "mailchimpMemberId" TEXT,
    "tags" JSONB NOT NULL,
    "consentedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriberRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoRecord" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."PromoType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "minimumSubtotalUsd" DECIMAL(10,2),
    "scopeType" "public"."PromoScopeType" NOT NULL DEFAULT 'all',
    "scopeCategory" "public"."ProductCategory",
    "scopeProductIds" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoRedemptionRecord" (
    "id" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerEmail" TEXT,
    "code" TEXT NOT NULL,
    "discountUsd" DECIMAL(10,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoRedemptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoSetting_entityType_idx" ON "public"."SeoSetting"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "SeoSetting_entityType_entityKey_key" ON "public"."SeoSetting"("entityType", "entityKey");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriberRecord_email_key" ON "public"."NewsletterSubscriberRecord"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriberRecord_status_idx" ON "public"."NewsletterSubscriberRecord"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubscriberRecord_createdAt_idx" ON "public"."NewsletterSubscriberRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromoRecord_code_key" ON "public"."PromoRecord"("code");

-- CreateIndex
CREATE INDEX "PromoRecord_active_code_idx" ON "public"."PromoRecord"("active", "code");

-- CreateIndex
CREATE INDEX "PromoRedemptionRecord_promoId_redeemedAt_idx" ON "public"."PromoRedemptionRecord"("promoId", "redeemedAt");

-- CreateIndex
CREATE INDEX "PromoRedemptionRecord_orderId_idx" ON "public"."PromoRedemptionRecord"("orderId");

-- AddForeignKey
ALTER TABLE "public"."PromoRedemptionRecord" ADD CONSTRAINT "PromoRedemptionRecord_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "public"."PromoRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoRedemptionRecord" ADD CONSTRAINT "PromoRedemptionRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."OrderRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

