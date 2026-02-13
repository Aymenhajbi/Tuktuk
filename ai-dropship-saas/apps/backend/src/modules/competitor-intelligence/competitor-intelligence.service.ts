import { Injectable } from '@nestjs/common';

export interface CompetitorSnapshot {
  storeUrl: string;
  bestSellers: string[];
  newProducts: string[];
  priceChanges: Array<{ product: string; oldPrice: number; newPrice: number }>;
}

@Injectable()
export class CompetitorIntelligenceService {
  async collectSnapshot(storeUrl: string): Promise<CompetitorSnapshot> {
    return {
      storeUrl,
      bestSellers: ['Portable Blender', 'Posture Corrector'],
      newProducts: ['Mini Sealer'],
      priceChanges: [{ product: 'Portable Blender', oldPrice: 29.99, newPrice: 24.99 }],
    };
  }

  async indexToElasticsearch(snapshot: CompetitorSnapshot) {
    return {
      index: 'competitor_signals',
      documentId: `${snapshot.storeUrl}-${Date.now()}`,
      status: 'indexed',
    };
  }
}
