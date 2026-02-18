import { BadRequestException, Injectable } from '@nestjs/common';
import { ScoreProductDto } from './dto/score-product.dto';
import { WinningRepository } from './winning.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class WinningEngineService {
  constructor(private readonly repository: WinningRepository) {}

  private assertScoreRange(score: number) {
    if (score < 0 || score > 100) {
      throw new BadRequestException('WinningScore.score must be between 0 and 100');
    }
  }

  buildWinningPayload(input: ScoreProductDto) {
    const score =
      input.trendVelocity * 0.25 +
      input.engagementRate * 0.15 +
      input.adFrequency * 0.15 +
      input.marginPotential * 0.15 +
      input.supplierScore * 0.1 +
      input.lowCompetitionFactor * 0.1 +
      input.sentimentScore * 0.1;

    const normalizedScore = Number(score.toFixed(2));
    this.assertScoreRange(normalizedScore);

    return {
      productExternalId: input.productId,
      productName: input.productName ?? input.productId,
      source: input.source ?? 'unknown',
      keyword: input.keyword ?? input.productId,
      trendVelocity: input.trendVelocity,
      engagementRate: input.engagementRate,
      competitionLevel: 100 - input.lowCompetitionFactor,
      adFrequency: input.adFrequency,
      marginPotential: input.marginPotential,
      supplierScore: input.supplierScore,
      lowCompetitionFactor: input.lowCompetitionFactor,
      sentimentScore: input.sentimentScore,
      score: normalizedScore,
      decision: normalizedScore >= 70 ? 'IMPORT_SUGGESTED' : 'WATCHLIST',
    };
  }

  async calculateWinningScore(input: ScoreProductDto, client?: Prisma.TransactionClient) {
    const payload = this.buildWinningPayload(input);
    const persisted = await this.repository.createTrendAndWinningScore(payload, client);

    return {
      decision: payload.decision,
      snapshot: persisted.snapshot,
      trendSignal: persisted.trendSignal,
      winningScore: persisted.winningScore,
    };
  }
}
