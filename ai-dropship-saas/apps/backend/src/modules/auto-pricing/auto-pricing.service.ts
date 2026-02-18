import { Injectable } from '@nestjs/common';
import { PricingRepository } from './pricing.repository';

@Injectable()
export class AutoPricingService {
  constructor(private readonly repository: PricingRepository) {}

  async optimize(input: { cost: number; marketAverage: number; targetMarginPct: number; estimatedCpa: number }) {
    const floorPrice = input.cost / (1 - input.targetMarginPct / 100);
    const recommendedPrice = Number(Math.max(floorPrice, input.marketAverage * 0.98).toFixed(2));
    const grossMargin = Number((recommendedPrice - input.cost).toFixed(2));
    const simulatedRoas = Number((recommendedPrice / Math.max(input.estimatedCpa, 1)).toFixed(2));

    await this.repository.createCampaignSimulation({
      data: {
        productRef: 'auto-pricing',
        expectedCpa: input.estimatedCpa,
        expectedRoas: simulatedRoas,
        expectedMargin: grossMargin,
        budget: 100,
      },
    });

    return {
      recommendedPrice,
      grossMargin,
      simulatedRoas,
      alert: simulatedRoas < 1.5 ? 'UNDERPERFORMING_RISK' : null,
    };
  }
}
