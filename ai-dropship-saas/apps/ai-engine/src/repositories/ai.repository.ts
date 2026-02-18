import { PrismaClient } from '@prisma/client';

export class AiWorkerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async persistAiScoringResult(input: {
    idempotencyKey: string;
    tenantId: string;
    traceId: string;
    correlationId: string;
    externalId: string;
    keyword: string;
    trendVelocity: number;
    score: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const idem = await tx.idempotencyKey.upsert({
        where: { key: input.idempotencyKey },
        create: { key: input.idempotencyKey, context: 'ai-scoring' },
        update: {},
      });

      const snapshot = await tx.productSnapshot.upsert({
        where: { externalId: input.externalId },
        create: { externalId: input.externalId, productName: input.keyword, source: 'ai-worker' },
        update: { productName: input.keyword },
      });

      const trend = await tx.trendSignal.upsert({
        where: {
          source_keyword_productSnapshotId: {
            source: 'ai-worker',
            keyword: input.keyword,
            productSnapshotId: snapshot.id,
          },
        },
        create: {
          source: 'ai-worker',
          keyword: input.keyword,
          trendVelocity: input.trendVelocity,
          engagementRate: null,
          competitionLevel: null,
          productSnapshotId: snapshot.id,
        },
        update: { trendVelocity: input.trendVelocity },
      });

      const winning = await tx.winningScore.upsert({
        where: { trendSignalId: trend.id },
        create: {
          trendSignalId: trend.id,
          trendVelocity: input.trendVelocity,
          engagementRate: 0,
          adFrequency: 0,
          marginPotential: 0,
          supplierScore: 0,
          lowCompetitionFactor: 0,
          sentimentScore: 0,
          score: input.score,
        },
        update: {
          trendVelocity: input.trendVelocity,
          score: input.score,
        },
      });

      await tx.queueJobState.upsert({
        where: { idempotencyKey: input.idempotencyKey },
        create: {
          queueName: 'ai-scoring-queue',
          idempotencyKey: input.idempotencyKey,
          correlationId: input.correlationId,
          traceId: input.traceId,
          tenantId: input.tenantId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        update: { status: 'COMPLETED', completedAt: new Date() },
      });

      return { idem, snapshot, trend, winning };
    });
  }
}
