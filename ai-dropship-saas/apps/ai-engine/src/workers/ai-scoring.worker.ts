import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { eventBus, TrendSignalCreatedV1, WinningScoreCreatedV1 } from '../../../../packages/event-bus/src';
import { AiWorkerRepository } from '../repositories/ai.repository';

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const repository = new AiWorkerRepository(prisma);

function buildEmbedding(keyword: string): number[] {
  return Array.from({ length: 16 }, (_, i) => Number((((keyword.length + i) % 11) / 10).toFixed(2)));
}

export async function processor(job: Job) {
  const startedAt = Date.now();
  const envelope = job.data;
  const keyword = String(envelope.payload.keyword ?? 'unknown');
  const embedding = buildEmbedding(keyword);
  const score = Number((embedding.reduce((a, b) => a + b, 0) * 6).toFixed(2));

  const persisted = await repository.persistAiScoringResult({
    idempotencyKey: envelope.idempotencyKey,
    tenantId: envelope.tenantId,
    traceId: envelope.traceId,
    correlationId: envelope.correlationId,
    externalId: String(envelope.payload.productId ?? keyword),
    keyword,
    trendVelocity: Number(envelope.payload.trendVelocity ?? 0),
    score,
  });

  const metadata = {
    version: 'v1' as const,
    correlationId: envelope.correlationId,
    traceId: envelope.traceId,
    tenantId: envelope.tenantId,
    occurredAt: new Date().toISOString(),
    idempotencyKey: envelope.idempotencyKey,
  };

  const trendEvent: TrendSignalCreatedV1 = {
    type: 'TrendSignalCreatedV1',
    metadata,
    payload: {
      trendSignalId: persisted.trend.id,
      productSnapshotId: persisted.snapshot.id,
      keyword,
      trendVelocity: persisted.trend.trendVelocity,
    },
  };

  const winningEvent: WinningScoreCreatedV1 = {
    type: 'WinningScoreCreatedV1',
    metadata,
    payload: {
      winningScoreId: persisted.winning.id,
      trendSignalId: persisted.trend.id,
      score: persisted.winning.score,
    },
  };

  eventBus.publish(trendEvent);
  eventBus.publish(winningEvent);

  console.log(JSON.stringify({
    queue: 'ai-scoring-queue',
    jobId: job.id,
    processingTime: Date.now() - startedAt,
    retryCount: job.attemptsMade,
    failureCount: 0,
    status: 'completed',
  }));

  return { score, trendSignalId: persisted.trend.id, winningScoreId: persisted.winning.id };
}

export const aiScoringWorker = new Worker('ai-scoring-queue', processor, {
  connection: redis,
  concurrency: Number(process.env.AI_SCORING_CONCURRENCY ?? 10),
});

aiScoringWorker.on('failed', async (job, error) => {
  console.log(JSON.stringify({
    queue: 'ai-scoring-queue',
    jobId: job?.id,
    processingTime: 0,
    retryCount: job?.attemptsMade ?? 0,
    failureCount: 1,
    status: 'failed',
    error: error.message,
  }));
});
