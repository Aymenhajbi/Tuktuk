CREATE TABLE "IdempotencyKey" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "context" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

ALTER TABLE "SystemEvent"
  ADD COLUMN "actionType" TEXT,
  ADD COLUMN "correlationId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "executionDurationMs" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "failure" BOOLEAN NOT NULL DEFAULT false;
