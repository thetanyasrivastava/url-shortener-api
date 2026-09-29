CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "longUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShortUrl_code_key" ON "ShortUrl"("code");
CREATE INDEX "ShortUrl_createdAt_idx" ON "ShortUrl"("createdAt");
CREATE INDEX "ShortUrl_expiresAt_idx" ON "ShortUrl"("expiresAt");
