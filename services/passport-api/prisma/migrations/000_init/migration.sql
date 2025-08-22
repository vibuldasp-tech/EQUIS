-- CreateTable
CREATE TABLE "DppItem" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "identifierGtin" VARCHAR(14),
    "identifierSku" TEXT,
    "digitalLinkUri" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "visibility" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "diff" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "dppItemId" TEXT NOT NULL,
    CONSTRAINT "Version_dppItemId_fkey" FOREIGN KEY ("dppItemId") REFERENCES "DppItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT PRIMARY KEY,
    "dppItemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Evidence_dppItemId_fkey" FOREIGN KEY ("dppItemId") REFERENCES "DppItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "DppItem_gtin_idx" ON "DppItem" ("identifierGtin");
CREATE INDEX "DppItem_sku_idx" ON "DppItem" ("identifierSku");