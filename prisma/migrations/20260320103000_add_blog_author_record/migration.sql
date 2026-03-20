CREATE TABLE "BlogAuthorRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogAuthorRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogAuthorRecord_key_key" ON "BlogAuthorRecord"("key");
