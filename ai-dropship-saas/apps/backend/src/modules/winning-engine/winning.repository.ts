import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, TrendSignal, WinningScore } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class WinningRepository {
  constructor(private readonly prisma: PrismaService) {}

  private withClient(client?: DbClient): DbClient {
    return client ?? this.prisma;
  }

  createTrendAndWinningScore(
    payload: {
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
    },
    client?: DbClient,
  ): Promise<{ snapshot: ProductSnapshot; trendSignal: TrendSignal; winningScore: WinningScore }> {
    const db = this.withClient(client) as Prisma.TransactionClient;

    return (async () => {
      const snapshot = await db.productSnapshot.upsert({
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

      const trendSignal = await db.trendSignal.upsert({
        where: {
          source_keyword_productSnapshotId: {
            source: payload.source,
            keyword: payload.keyword,
            productSnapshotId: snapshot.id,
          },
        },
        create: {
          source: payload.source,
          keyword: payload.keyword,
          trendVelocity: payload.trendVelocity,
          engagementRate: payload.engagementRate,
          competitionLevel: payload.competitionLevel,
          productSnapshotId: snapshot.id,
        },
        update: {
          trendVelocity: payload.trendVelocity,
          engagementRate: payload.engagementRate,
          competitionLevel: payload.competitionLevel,
        },
      });

      const winningScore = await db.winningScore.upsert({
        where: { trendSignalId: trendSignal.id },
        create: {
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
        update: {
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
    })();
  }
}
