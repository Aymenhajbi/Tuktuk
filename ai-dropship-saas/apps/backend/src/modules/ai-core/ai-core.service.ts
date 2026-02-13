import { Injectable } from '@nestjs/common';

@Injectable()
export class AiCoreService {
  generateMarketingAssets(productName: string) {
    return {
      seoDescription: `${productName} améliore le quotidien avec un design innovant et une livraison rapide.`,
      tiktokHook: `Ce produit à moins de 30€ explose les ventes en ce moment 👀`,
      adAngles: ['Problem/Solution', 'UGC Demo', 'Before/After'],
      emailSubject: `${productName}: tendance e-commerce à surveiller`,
    };
  }

  predictTrend(signal: { trendVelocity: number; competitionDensity: number }) {
    const score = signal.trendVelocity * 0.7 + (100 - signal.competitionDensity) * 0.3;
    return { predictedDemandScore: Number(score.toFixed(2)), horizonDays: 14 };
  }
}
