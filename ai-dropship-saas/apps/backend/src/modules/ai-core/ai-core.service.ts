import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';

@Injectable()
export class AiCoreService {
  constructor(private readonly repository: AiRepository) {}

  async generateMarketingAssets(productName: string) {
    const assets = {
      seoDescription: `${productName} améliore le quotidien avec un design innovant et une livraison rapide.`,
      tiktokHook: `Ce produit à moins de 30€ explose les ventes en ce moment 👀`,
      adAngles: ['Problem/Solution', 'UGC Demo', 'Before/After'],
      emailSubject: `${productName}: tendance e-commerce à surveiller`,
    };

    await this.repository.createAdCreative({
      data: {
        platform: 'tiktok',
        productRef: productName,
        hook: assets.tiktokHook,
        script: `${assets.tiktokHook}\n${assets.seoDescription}`,
      },
    });

    return assets;
  }

  predictTrend(signal: { trendVelocity: number; competitionDensity: number }) {
    const score = signal.trendVelocity * 0.7 + (100 - signal.competitionDensity) * 0.3;
    return { predictedDemandScore: Number(score.toFixed(2)), horizonDays: 14 };
  }
}
