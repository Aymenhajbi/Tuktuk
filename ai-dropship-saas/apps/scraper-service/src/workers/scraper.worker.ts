import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { eventBus, CampaignReadyV1, ProductSnapshotCreatedV1 } from '../../../../packages/event-bus/src';
import { ScraperRepository } from '../repositories/scraper.repository';

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const repository = new ScraperRepository(prisma);

export async function processor(job: Job) {
  const startedAt = Date.now();
  const envelope = job.data;
  const tenantId = envelope.tenantId;

  const snapshot = await repository.persistScrapeState({
    idempotencyKey: envelope.idempotencyKey,
    tenantId,
    traceId: envelope.traceId,
    correlationId: envelope.correlationId,
    externalId: String(envelope.payload.externalId ?? `scraped-${job.id}`),
    source: String(envelope.payload.source ?? 'scraper'),
  });

  const metadata = {
    version: 'v1' as const,
    correlationId: envelope.correlationId,
    traceId: envelope.traceId,
    tenantId,
    occurredAt: new Date().toISOString(),
    idempotencyKey: envelope.idempotencyKey,
  };

  const snapshotEvent: ProductSnapshotCreatedV1 = {
    type: 'ProductSnapshotCreatedV1',
    metadata,
    payload: {
      snapshotId: snapshot.id,
      externalId: snapshot.externalId,
      source: snapshot.source ?? 'scraper',
    },
  };

  const campaignReady: CampaignReadyV1 = {
    type: 'CampaignReadyV1',
    metadata,
    payload: {
      snapshotId: snapshot.id,
      readinessScore: 75,
    },
  };

  eventBus.publish(snapshotEvent);
  eventBus.publish(campaignReady);

  console.log(JSON.stringify({
    queue: 'scraper-jobs-queue',
    jobId: job.id,
    processingTime: Date.now() - startedAt,
    retryCount: job.attemptsMade,
    failureCount: 0,
    status: 'completed',
  }));

  return { snapshotId: snapshot.id, tenantId };
}

export const scraperWorker = new Worker('scraper-jobs-queue', processor, {
  connection: redis,
  concurrency: Number(process.env.SCRAPER_CONCURRENCY ?? 5),
});

scraperWorker.on('failed', async (job, error) => {
  console.log(JSON.stringify({
    queue: 'scraper-jobs-queue',
    jobId: job?.id,
    processingTime: 0,
    retryCount: job?.attemptsMade ?? 0,
    failureCount: 1,
    status: 'failed',
    error: error.message,
  }));
});
