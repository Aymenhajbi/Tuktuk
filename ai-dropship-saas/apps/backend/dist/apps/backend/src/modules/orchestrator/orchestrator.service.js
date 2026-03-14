"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ai_core_service_1 = require("../ai-core/ai-core.service");
const auto_pricing_service_1 = require("../auto-pricing/auto-pricing.service");
const winning_engine_service_1 = require("../winning-engine/winning-engine.service");
const queue_service_1 = require("../../queue/queue.service");
const orchestrator_repository_1 = require("./orchestrator.repository");
let OrchestratorService = class OrchestratorService {
    constructor(winningEngine, aiCore, autoPricing, queueService, repository) {
        this.winningEngine = winningEngine;
        this.aiCore = aiCore;
        this.autoPricing = autoPricing;
        this.queueService = queueService;
        this.repository = repository;
    }
    computeMarketSaturationIndex(activeAdsCount, competitorStoresCount, priceCompression) {
        return activeAdsCount * 0.4 + competitorStoresCount * 0.3 + priceCompression * 0.3;
    }
    computeSupplierRiskIndex(input) {
        return Number((input.deliveryDelayRate * 0.35 + input.disputeRate * 0.3 + input.reviewPenalty * 0.2 + input.stockVolatility * 0.15).toFixed(2));
    }
    computeCreativeFatigueIndex(input) {
        return Number((input.engagementDrop * 0.45 + input.creativeRepetition * 0.35 + input.sentimentDowntrend * 0.2).toFixed(2));
    }
    predictSuccessProbability7d(input) {
        const linear = input.trendVelocity * 0.28 + input.engagementRate * 0.24 + input.marginPotential * 0.24 + (100 - input.competitionDensity) * 0.24;
        const probability = 1 / (1 + Math.exp(-(linear - 50) / 10));
        return Number((probability * 100).toFixed(2));
    }
    validateDomainRules(confidenceScore, budget, variantCount) {
        if (confidenceScore < 0 || confidenceScore > 1) {
            throw new common_1.BadRequestException('confidenceScore must be between 0 and 1');
        }
        if (budget <= 0) {
            throw new common_1.BadRequestException('budget must be positive');
        }
        if (variantCount < 1) {
            throw new common_1.BadRequestException('variantCount must be >= 1');
        }
    }
    async resolveExistingIdempotentResult(key) {
        const idempotency = await this.repository.findIdempotencyKey(key);
        if (!idempotency)
            return null;
        if (idempotency.context.startsWith('decision:')) {
            const decisionId = idempotency.context.replace('decision:', '');
            const decision = await this.repository.getDecisionById(decisionId);
            if (decision) {
                return { decision, idempotent: true };
            }
        }
        throw new common_1.ConflictException('Idempotency key is in progress');
    }
    async processTrendSignal(dto) {
        const startedAt = Date.now();
        const existing = await this.resolveExistingIdempotentResult(dto.idempotencyKey);
        if (existing) {
            return existing;
        }
        try {
            await this.repository.createIdempotencyKey(dto.idempotencyKey, `pending:${dto.productId}`);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                const replay = await this.resolveExistingIdempotentResult(dto.idempotencyKey);
                if (replay)
                    return replay;
            }
            throw error;
        }
        const saturationIndex = this.computeMarketSaturationIndex(dto.activeAdsCount, dto.competitorStoresCount, dto.priceCompression);
        const successProbability7d = this.predictSuccessProbability7d({
            trendVelocity: dto.trendVelocity,
            engagementRate: dto.engagementRate,
            marginPotential: dto.marginPotential,
            competitionDensity: dto.lowCompetitionFactor,
        });
        const confidenceScore = Number((successProbability7d / 100).toFixed(4));
        const shouldImport = successProbability7d >= 65 && saturationIndex < 65;
        const actionType = this.repository.buildActionType(shouldImport);
        const budget = 20;
        const variantCount = 5;
        this.validateDomainRules(confidenceScore, budget, variantCount);
        try {
            const result = await this.repository.inTransaction(async (tx) => {
                const winning = await this.winningEngine.calculateWinningScore({
                    ...dto,
                    keyword: dto.keyword,
                    source: dto.source ?? 'orchestrator',
                    productName: dto.productName ?? dto.keyword,
                }, tx);
                let campaignTest = null;
                if (actionType === 'TEST_CAMPAIGN') {
                    campaignTest = await this.repository.createCampaignTest({
                        data: {
                            productId: winning.snapshot.id,
                            budget,
                            variantCount,
                            predictedCPA: 11,
                            status: 'PENDING',
                        },
                    }, tx);
                }
                const reason = shouldImport
                    ? 'Winning score and probability are high, saturation acceptable.'
                    : 'Score/probability/saturation below threshold.';
                const persistedDecision = await this.repository.createDecision({
                    data: {
                        trendSignalId: winning.trendSignal.id,
                        actionType,
                        confidenceScore,
                        reason,
                    },
                }, tx);
                await this.repository.createSystemEvent({
                    data: {
                        type: `orchestrator.${actionType.toLowerCase()}`,
                        actionType,
                        correlationId: dto.idempotencyKey,
                        executionDurationMs: Date.now() - startedAt,
                        failure: false,
                        payload: {
                            productId: dto.productId,
                            trendSignalId: winning.trendSignal.id,
                            decisionId: persistedDecision.id,
                            successProbability7d,
                            saturationIndex: Number(saturationIndex.toFixed(2)),
                        },
                    },
                }, tx);
                return {
                    decision: persistedDecision,
                    winning,
                    saturationIndex: Number(saturationIndex.toFixed(2)),
                    successProbability7d,
                    campaignTest,
                    actions: shouldImport
                        ? ['IMPORT_PRODUCT', 'GENERATE_DESCRIPTION', 'CREATE_AB_TEST_CAMPAIGN', 'TRACK_ROAS']
                        : ['STORE_SIGNAL', 'RECHECK_IN_6H'],
                };
            });
            await this.repository.updateIdempotencyContext(dto.idempotencyKey, `decision:${result.decision.id}`);
            const pricingPlan = await this.autoPricing.optimize({
                cost: 9.5,
                marketAverage: 29.99,
                targetMarginPct: 45,
                estimatedCpa: 11,
            });
            const assets = await this.aiCore.generateMarketingAssets(dto.keyword);
            await this.queueService.enqueueAiScoring({
                idempotencyKey: `${dto.idempotencyKey}:ai`,
                correlationId: dto.idempotencyKey,
                traceId: dto.idempotencyKey,
                tenantId: 'default-tenant',
                payload: {
                    productId: dto.productId,
                    keyword: dto.keyword,
                    trendSignalId: result.winning.trendSignal.id,
                    productSnapshotId: result.winning.snapshot.id,
                    trendVelocity: dto.trendVelocity,
                    winningScore: result.winning.winningScore.score,
                    successProbability7d,
                },
            });
            await this.queueService.enqueueCampaignSimulation({
                idempotencyKey: `${dto.idempotencyKey}:campaign`,
                correlationId: dto.idempotencyKey,
                traceId: dto.idempotencyKey,
                tenantId: 'default-tenant',
                payload: {
                    campaignSimulationId: result.decision.id,
                    productRef: dto.productId,
                    expectedRoas: pricingPlan.simulatedRoas,
                    expectedCpa: 11,
                },
            });
            return { ...result, pricingPlan, assets };
        }
        catch (error) {
            await this.repository.updateIdempotencyContext(dto.idempotencyKey, `failed:${dto.productId}`);
            await this.repository.createSystemEvent({
                data: {
                    type: 'orchestrator.failed',
                    actionType: 'SKIP',
                    correlationId: dto.idempotencyKey,
                    executionDurationMs: Date.now() - startedAt,
                    failure: true,
                    payload: { productId: dto.productId, message: 'transaction_failed' },
                },
            });
            throw new common_1.InternalServerErrorException('Orchestrator transaction failed');
        }
    }
};
exports.OrchestratorService = OrchestratorService;
exports.OrchestratorService = OrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [winning_engine_service_1.WinningEngineService,
        ai_core_service_1.AiCoreService,
        auto_pricing_service_1.AutoPricingService,
        queue_service_1.QueueService,
        orchestrator_repository_1.OrchestratorRepository])
], OrchestratorService);
