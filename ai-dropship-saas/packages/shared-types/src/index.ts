export interface WinningProductSignal {
  productId: string;
  winningScore: number;
  predictedDemandScore: number;
}

export interface PricingOptimizationResult {
  recommendedPrice: number;
  grossMargin: number;
  simulatedRoas: number;
}
