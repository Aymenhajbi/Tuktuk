-- AlterTable
ALTER TABLE "SystemEvent" ALTER COLUMN "correlationId" DROP DEFAULT,
ALTER COLUMN "executionDurationMs" DROP DEFAULT;

-- CreateTable
CREATE TABLE "CompetitorStore" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'shopify',
    "estimatedTraffic" INTEGER,
    "trustpilotScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViralProduct" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "tiktokViews24h" INTEGER NOT NULL,
    "hashtag" TEXT,
    "viralScore" DOUBLE PRECISION NOT NULL,
    "sentimentScore" DOUBLE PRECISION,
    "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViralProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "competitorStoreId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "oldPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementMetric" (
    "id" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "conversionRate" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCreative" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "ctr" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdCreative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSimulation" (
    "id" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "expectedCpa" DOUBLE PRECISION NOT NULL,
    "expectedRoas" DOUBLE PRECISION NOT NULL,
    "expectedMargin" DOUBLE PRECISION NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "simulatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapingJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProxyPool" (
    "id" TEXT NOT NULL,
    "proxyUrl" TEXT NOT NULL,
    "healthScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "ProxyPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSaturationMetric" (
    "id" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "activeAdsCount" INTEGER NOT NULL,
    "competitorStoresCount" INTEGER NOT NULL,
    "priceCompression" DOUBLE PRECISION NOT NULL,
    "saturationIndex" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSaturationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeFatigueMetric" (
    "id" TEXT NOT NULL,
    "adCreativeId" TEXT NOT NULL,
    "engagementDrop" DOUBLE PRECISION NOT NULL,
    "repetitionRate" DOUBLE PRECISION NOT NULL,
    "sentimentDowntrend" DOUBLE PRECISION NOT NULL,
    "fatigueIndex" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeFatigueMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierRiskMetric" (
    "id" TEXT NOT NULL,
    "supplierRef" TEXT NOT NULL,
    "deliveryDelayRate" DOUBLE PRECISION NOT NULL,
    "disputeRate" DOUBLE PRECISION NOT NULL,
    "reviewPenalty" DOUBLE PRECISION NOT NULL,
    "stockVolatility" DOUBLE PRECISION NOT NULL,
    "riskIndex" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierRiskMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTestExperiment" (
    "id" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "budgetPerHook" DOUBLE PRECISION NOT NULL,
    "hooksJson" JSONB NOT NULL,
    "winnerHook" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ABTestExperiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorStore_domain_key" ON "CompetitorStore"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "ProxyPool_proxyUrl_key" ON "ProxyPool"("proxyUrl");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_competitorStoreId_fkey" FOREIGN KEY ("competitorStoreId") REFERENCES "CompetitorStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
