import { Injectable } from '@nestjs/common';
import { ScoreProductDto } from './dto/score-product.dto';
import { WinningRepository } from './winning.repository';

@Injectable()
export class WinningEngineService {
  constructor(private readonly repository: WinningRepository) {}

  async calculateWinningScore(input: ScoreProductDto) {
    const score =
      input.trendVelocity * 0.25 +
      input.engagementRate * 0.15 +
      input.adFrequency * 0.15 +
      input.marginPotential * 0.15 +
      input.supplierScore * 0.1 +
      input.lowCompetitionFactor * 0.1 +
      input.sentimentScore * 0.1;

    const persisted = await this.repository.createTrendAndWinningScore({
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
      score: Number(score.toFixed(2)),
    });

    return {
      decision: score >= 70 ? 'IMPORT_SUGGESTED' : 'WATCHLIST',
      snapshot: persisted.snapshot,
      trendSignal: persisted.trendSignal,
      winningScore: persisted.winningScore,
    };
  }
}
