-- CreateTable
CREATE TABLE "LoginRateLimitAttempt" (
    "id" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginRateLimitAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginRateLimitAttempt_surface_identifierHash_attemptedAt_idx" ON "LoginRateLimitAttempt"("surface", "identifierHash", "attemptedAt");
