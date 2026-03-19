CREATE TABLE "HomepageContentRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContentRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageContentRecord_key_key" ON "HomepageContentRecord"("key");
