import { PrismaClient } from '@prisma/client';

export class ScraperRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async persistScrapeState(input: {
    idempotencyKey: string;
    tenantId: string;
    traceId: string;
    correlationId: string;
    externalId: string;
    source: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.idempotencyKey.upsert({
        where: { key: input.idempotencyKey },
        create: { key: input.idempotencyKey, context: 'scraper-worker' },
        update: {},
      });

      const snapshot = await tx.productSnapshot.upsert({
        where: { externalId: input.externalId },
        create: {
          externalId: input.externalId,
          productName: input.externalId,
          source: input.source,
        },
        update: { source: input.source },
      });

      await tx.queueJobState.upsert({
        where: { idempotencyKey: input.idempotencyKey },
        create: {
          queueName: 'scraper-jobs-queue',
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

      return snapshot;
    });
  }
}
