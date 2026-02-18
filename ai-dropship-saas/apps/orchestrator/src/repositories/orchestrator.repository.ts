import { PrismaClient } from '@prisma/client';

export class OrchestratorWorkerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async persistCampaignSimulation(input: {
    idempotencyKey: string;
    correlationId: string;
    traceId: string;
    tenantId: string;
    productRef: string;
    expectedCpa: number;
    expectedRoas: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.idempotencyKey.upsert({
        where: { key: input.idempotencyKey },
        create: { key: input.idempotencyKey, context: 'orchestrator-worker' },
        update: {},
      });

      const simulation = await tx.campaignSimulation.create({
        data: {
          productRef: input.productRef,
          expectedCpa: input.expectedCpa,
          expectedRoas: input.expectedRoas,
          expectedMargin: Number((input.expectedRoas - input.expectedCpa).toFixed(2)),
          budget: 100,
        },
      });

      await tx.queueJobState.upsert({
        where: { idempotencyKey: input.idempotencyKey },
        create: {
          queueName: 'campaign-simulation-queue',
          idempotencyKey: input.idempotencyKey,
          correlationId: input.correlationId,
          traceId: input.traceId,
          tenantId: input.tenantId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return simulation;
    });
  }
}
