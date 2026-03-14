CREATE TABLE "QueueJobState" (
  "id" TEXT NOT NULL,
  "queueName" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "traceId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QueueJobState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QueueJobState_idempotencyKey_key" ON "QueueJobState"("idempotencyKey");
CREATE INDEX "QueueJobState_queueName_status_idx" ON "QueueJobState"("queueName", "status");
