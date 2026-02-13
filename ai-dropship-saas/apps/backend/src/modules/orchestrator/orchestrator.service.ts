import { Injectable } from '@nestjs/common';
import { AiCoreService } from '../ai-core/ai-core.service';
import { AutoPricingService } from '../auto-pricing/auto-pricing.service';
import { WinningEngineService } from '../winning-engine/winning-engine.service';
import { ProcessSignalDto } from './dto/process-signal.dto';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly winningEngine: WinningEngineService,
    private readonly aiCore: AiCoreService,
    private readonly autoPricing: AutoPricingService,
    private readonly queueService: QueueService,
  ) {}

  computeMarketSaturationIndex(activeAdsCount: number, competitorStoresCount: number, priceCompression: number) {
    return activeAdsCount * 0.4 + competitorStoresCount * 0.3 + priceCompression * 0.3;
  }

  computeSupplierRiskIndex(input: { deliveryDelayRate: number; disputeRate: number; reviewPenalty: number; stockVolatility: number }) {
    return Number((input.deliveryDelayRate * 0.35 + input.disputeRate * 0.3 + input.reviewPenalty * 0.2 + input.stockVolatility * 0.15).toFixed(2));
  }

  computeCreativeFatigueIndex(input: { engagementDrop: number; creativeRepetition: number; sentimentDowntrend: number }) {
    return Number((input.engagementDrop * 0.45 + input.creativeRepetition * 0.35 + input.sentimentDowntrend * 0.2).toFixed(2));
  }

  predictSuccessProbability7d(input: { trendVelocity: number; engagementRate: number; marginPotential: number; competitionDensity: number }) {
    const linear = input.trendVelocity * 0.28 + input.engagementRate * 0.24 + input.marginPotential * 0.24 + (100 - input.competitionDensity) * 0.24;
    const probability = 1 / (1 + Math.exp(-(linear - 50) / 10));
    return Number((probability * 100).toFixed(2));
  }

  async processTrendSignal(dto: ProcessSignalDto) {
    const winning = this.winningEngine.calculateWinningScore(dto);
    const saturationIndex = this.computeMarketSaturationIndex(dto.activeAdsCount, dto.competitorStoresCount, dto.priceCompression);
    const successProbability7d = this.predictSuccessProbability7d({
      trendVelocity: dto.trendVelocity,
      engagementRate: dto.engagementRate,
      marginPotential: dto.marginPotential,
      competitionDensity: dto.lowCompetitionFactor,
    });

    const shouldImport = winning.score >= 70 && saturationIndex < 65 && successProbability7d >= 65;

    await this.queueService.enqueueAiScoring({
      productId: dto.productId,
      keyword: dto.keyword,
      winningScore: winning.score,
      successProbability7d,
    });

    const pricingPlan = this.autoPricing.optimize({
      cost: 9.5,
      marketAverage: 29.99,
      targetMarginPct: 45,
      estimatedCpa: 11,
    });

    const assets = this.aiCore.generateMarketingAssets(dto.keyword);

    return {
      decision: shouldImport ? 'AUTO_IMPORT_AND_LAUNCH_TEST' : 'WATCHLIST',
      winning,
      saturationIndex: Number(saturationIndex.toFixed(2)),
      successProbability7d,
      pricingPlan,
      assets,
      actions: shouldImport
        ? ['IMPORT_PRODUCT', 'GENERATE_DESCRIPTION', 'CREATE_AB_TEST_CAMPAIGN', 'TRACK_ROAS']
        : ['STORE_SIGNAL', 'RECHECK_IN_6H'],
    };
  }
}
