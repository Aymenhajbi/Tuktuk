import { Injectable } from '@nestjs/common';
import { ScoreProductDto } from './dto/score-product.dto';

@Injectable()
export class WinningEngineService {
  calculateWinningScore(input: ScoreProductDto) {
    const score =
      input.trendVelocity * 0.25 +
      input.engagementRate * 0.15 +
      input.adFrequency * 0.15 +
      input.marginPotential * 0.15 +
      input.supplierScore * 0.1 +
      input.lowCompetitionFactor * 0.1 +
      input.sentimentScore * 0.1;

    return {
      productId: input.productId,
      score: Number(score.toFixed(2)),
      decision: score >= 70 ? 'IMPORT_SUGGESTED' : 'WATCHLIST',
    };
  }
}
