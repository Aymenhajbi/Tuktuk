-- Sprint 1 persistence foundation
CREATE TYPE "OrchestratorActionType" AS ENUM ('IMPORT', 'SKIP', 'TEST_CAMPAIGN');
CREATE TYPE "CampaignTestStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED');

CREATE TABLE "ProductSnapshot" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductSnapshot_externalId_key" ON "ProductSnapshot"("externalId");

CREATE TABLE "TrendSignal" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "keyword" TEXT NOT NULL,
  "trendVelocity" DOUBLE PRECISION NOT NULL,
  "engagementRate" DOUBLE PRECISION,
  "competitionLevel" DOUBLE PRECISION,
  "productSnapshotId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrendSignal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TrendSignal_createdAt_idx" ON "TrendSignal"("createdAt");
CREATE UNIQUE INDEX "TrendSignal_source_keyword_productSnapshotId_key" ON "TrendSignal"("source", "keyword", "productSnapshotId");
ALTER TABLE "TrendSignal" ADD CONSTRAINT "TrendSignal_productSnapshotId_fkey" FOREIGN KEY ("productSnapshotId") REFERENCES "ProductSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "WinningScore" (
  "id" TEXT NOT NULL,
  "trendSignalId" TEXT NOT NULL,
  "trendVelocity" DOUBLE PRECISION NOT NULL,
  "engagementRate" DOUBLE PRECISION NOT NULL,
  "adFrequency" DOUBLE PRECISION NOT NULL,
  "marginPotential" DOUBLE PRECISION NOT NULL,
  "supplierScore" DOUBLE PRECISION NOT NULL,
  "lowCompetitionFactor" DOUBLE PRECISION NOT NULL,
  "sentimentScore" DOUBLE PRECISION NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WinningScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WinningScore_trendSignalId_key" ON "WinningScore"("trendSignalId");
CREATE INDEX "WinningScore_score_idx" ON "WinningScore"("score");
ALTER TABLE "WinningScore" ADD CONSTRAINT "WinningScore_trendSignalId_fkey" FOREIGN KEY ("trendSignalId") REFERENCES "TrendSignal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "OrchestratorDecision" (
  "id" TEXT NOT NULL,
  "trendSignalId" TEXT NOT NULL,
  "actionType" "OrchestratorActionType" NOT NULL,
  "confidenceScore" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrchestratorDecision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrchestratorDecision_trendSignalId_createdAt_idx" ON "OrchestratorDecision"("trendSignalId", "createdAt");
ALTER TABLE "OrchestratorDecision" ADD CONSTRAINT "OrchestratorDecision_trendSignalId_fkey" FOREIGN KEY ("trendSignalId") REFERENCES "TrendSignal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "CampaignTest" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "budget" DOUBLE PRECISION NOT NULL,
  "variantCount" INTEGER NOT NULL,
  "predictedCPA" DOUBLE PRECISION NOT NULL,
  "status" "CampaignTestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignTest_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CampaignTest" ADD CONSTRAINT "CampaignTest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SystemEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);
