"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auto_pricing_service_1 = require("./auto-pricing.service");
describe('AutoPricingService', () => {
    const repository = {
        createCampaignSimulation: jest.fn(),
    };
    const service = new auto_pricing_service_1.AutoPricingService(repository);
    beforeEach(() => jest.clearAllMocks());
    it('optimizes and persists simulation', async () => {
        repository.createCampaignSimulation.mockResolvedValue({ id: 'sim-1' });
        const result = await service.optimize({
            cost: 10,
            marketAverage: 30,
            targetMarginPct: 40,
            estimatedCpa: 12,
        });
        expect(result.recommendedPrice).toBeGreaterThan(0);
        expect(repository.createCampaignSimulation).toHaveBeenCalled();
    });
});
