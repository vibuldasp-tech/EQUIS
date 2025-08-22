-- CreateTable
CREATE TABLE "EpcisEvent" (
    "id" TEXT PRIMARY KEY,
    "epc" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "EpcisEvent_epc_idx" ON "EpcisEvent" ("epc");