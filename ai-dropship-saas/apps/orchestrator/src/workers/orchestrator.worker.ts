import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { eventBus, CampaignSimulationCompletedV1 } from '../../../../packages/event-bus/src';
import { OrchestratorWorkerRepository } from '../repositories/orchestrator.repository';

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const repository = new OrchestratorWorkerRepository(prisma);

export async function processor(job: Job) {
  const startedAt = Date.now();
  const envelope = job.data;

  const expectedRoas = Number(envelope.payload.expectedRoas ?? 2);
  const expectedCpa = Number(envelope.payload.expectedCpa ?? 10);
  const simulation = await repository.persistCampaignSimulation({
    idempotencyKey: envelope.idempotencyKey,
    correlationId: envelope.correlationId,
    traceId: envelope.traceId,
    tenantId: envelope.tenantId,
    productRef: String(envelope.payload.productRef ?? 'unknown'),
    expectedCpa,
    expectedRoas,
  });

  const event: CampaignSimulationCompletedV1 = {
    type: 'CampaignSimulationCompletedV1',
    metadata: {
      version: 'v1',
      correlationId: envelope.correlationId,
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
      occurredAt: new Date().toISOString(),
      idempotencyKey: envelope.idempotencyKey,
    },
    payload: {
      campaignSimulationId: simulation.id,
      productRef: simulation.productRef,
      expectedRoas: simulation.expectedRoas,
      expectedCpa: simulation.expectedCpa,
    },
  };

  eventBus.publish(event);

  console.log(JSON.stringify({
    queue: 'campaign-simulation-queue',
    jobId: job.id,
    processingTime: Date.now() - startedAt,
    retryCount: job.attemptsMade,
    failureCount: 0,
    status: 'completed',
  }));

  return {
    decision: expectedRoas >= 1.5 ? 'TEST_CAMPAIGN' : 'SKIP',
    campaignSimulationId: simulation.id,
  };
}

export const orchestratorWorker = new Worker('campaign-simulation-queue', processor, {
  connection: redis,
  concurrency: Number(process.env.CAMPAIGN_SIMULATION_CONCURRENCY ?? 4),
});

orchestratorWorker.on('failed', async (job, error) => {
  console.log(JSON.stringify({
    queue: 'campaign-simulation-queue',
    jobId: job?.id,
    processingTime: 0,
    retryCount: job?.attemptsMade ?? 0,
    failureCount: 1,
    status: 'failed',
    error: error.message,
  }));
});
