"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const orchestrator_service_1 = require("./orchestrator.service");
describe('OrchestratorService', () => {
    const winningEngine = { calculateWinningScore: jest.fn() };
    const aiCore = { generateMarketingAssets: jest.fn() };
    const autoPricing = { optimize: jest.fn() };
    const queue = { enqueueAiScoring: jest.fn() };
    const repository = {
        findIdempotencyKey: jest.fn(),
        createIdempotencyKey: jest.fn(),
        inTransaction: jest.fn(),
        buildActionType: jest.fn(),
        createCampaignTest: jest.fn(),
        createDecision: jest.fn(),
        createSystemEvent: jest.fn(),
        updateIdempotencyContext: jest.fn(),
        getDecisionById: jest.fn(),
    };
    const service = new orchestrator_service_1.OrchestratorService(winningEngine, aiCore, autoPricing, queue, repository);
    beforeEach(() => jest.clearAllMocks());
    const dto = {
        idempotencyKey: 'idem-1',
        productId: 'prod-1',
        keyword: 'kw',
        trendVelocity: 70,
        engagementRate: 70,
        adFrequency: 70,
        marginPotential: 70,
        supplierScore: 70,
        lowCompetitionFactor: 40,
        sentimentScore: 70,
        activeAdsCount: 20,
        competitorStoresCount: 20,
        priceCompression: 20,
    };
    it('returns existing decision for idempotent duplicate', async () => {
        repository.findIdempotencyKey.mockResolvedValue({ key: 'idem-1', context: 'decision:dec-1' });
        repository.getDecisionById.mockResolvedValue({ id: 'dec-1' });
        const result = await service.processTrendSignal(dto);
        expect(result).toEqual({ decision: { id: 'dec-1' }, idempotent: true });
    });
    it('creates decision in transaction path', async () => {
        repository.findIdempotencyKey.mockResolvedValue(null);
        repository.createIdempotencyKey.mockResolvedValue({ id: 'k1' });
        repository.buildActionType.mockReturnValue('TEST_CAMPAIGN');
        winningEngine.calculateWinningScore.mockResolvedValue({
            snapshot: { id: 'snap-1' },
            trendSignal: { id: 'ts-1' },
            winningScore: { score: 80 },
        });
        repository.createCampaignTest.mockResolvedValue({ id: 'ct-1' });
        repository.createDecision.mockResolvedValue({ id: 'd1' });
        repository.createSystemEvent.mockResolvedValue({ id: 'e1' });
        repository.inTransaction.mockImplementation(async (fn) => fn({}));
        autoPricing.optimize.mockResolvedValue({});
        aiCore.generateMarketingAssets.mockResolvedValue({});
        queue.enqueueAiScoring.mockResolvedValue({});
        const result = await service.processTrendSignal(dto);
        expect(result.decision.id).toBe('d1');
        expect(repository.inTransaction).toHaveBeenCalled();
    });
    it('throws on invalid confidence domain rule', async () => {
        jest.spyOn(service, 'predictSuccessProbability7d').mockReturnValue(150);
        repository.findIdempotencyKey.mockResolvedValue(null);
        repository.createIdempotencyKey.mockResolvedValue({ id: 'k1' });
        repository.buildActionType.mockReturnValue('SKIP');
        await expect(service.processTrendSignal(dto)).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    it('maps transaction failure', async () => {
        repository.findIdempotencyKey.mockResolvedValue(null);
        repository.createIdempotencyKey.mockResolvedValue({ id: 'k1' });
        repository.buildActionType.mockReturnValue('SKIP');
        repository.inTransaction.mockRejectedValue(new Error('boom'));
        await expect(service.processTrendSignal(dto)).rejects.toBeInstanceOf(common_1.InternalServerErrorException);
    });
    it('throws conflict when idempotency in progress', async () => {
        repository.findIdempotencyKey.mockResolvedValue({ key: 'idem-1', context: 'pending:prod-1' });
        await expect(service.processTrendSignal(dto)).rejects.toBeInstanceOf(common_1.ConflictException);
    });
});
