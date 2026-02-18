import { Injectable } from '@nestjs/common';
import { Prisma, TrendSignal, WinningScore } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WinningRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertProductSnapshot(data: Prisma.ProductSnapshotUpsertArgs) {
    return this.prisma.productSnapshot.upsert(data);
  }

  createTrendSignal(data: Prisma.TrendSignalCreateArgs): Promise<TrendSignal> {
    return this.prisma.trendSignal.create(data);
  }

  createWinningScore(data: Prisma.WinningScoreCreateArgs): Promise<WinningScore> {
    return this.prisma.winningScore.create(data);
  }

  createTrendAndWinningScore(payload: {
    productExternalId: string;
    productName: string;
    source: string;
    keyword: string;
    trendVelocity: number;
    engagementRate: number;
    competitionLevel: number;
    adFrequency: number;
    marginPotential: number;
    supplierScore: number;
    lowCompetitionFactor: number;
    sentimentScore: number;
    score: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const snapshot = await tx.productSnapshot.upsert({
        where: { externalId: payload.productExternalId },
        create: {
          externalId: payload.productExternalId,
          productName: payload.productName,
          source: payload.source,
        },
        update: {
          productName: payload.productName,
          source: payload.source,
        },
      });

      const trendSignal = await tx.trendSignal.create({
        data: {
          source: payload.source,
          keyword: payload.keyword,
          trendVelocity: payload.trendVelocity,
          engagementRate: payload.engagementRate,
          competitionLevel: payload.competitionLevel,
          productSnapshotId: snapshot.id,
        },
      });

      const winningScore = await tx.winningScore.create({
        data: {
          trendSignalId: trendSignal.id,
          trendVelocity: payload.trendVelocity,
          engagementRate: payload.engagementRate,
          adFrequency: payload.adFrequency,
          marginPotential: payload.marginPotential,
          supplierScore: payload.supplierScore,
          lowCompetitionFactor: payload.lowCompetitionFactor,
          sentimentScore: payload.sentimentScore,
          score: payload.score,
        },
      });

      return { snapshot, trendSignal, winningScore };
    });
  }
}
