import { AutoPricingService } from './auto-pricing.service';

describe('AutoPricingService', () => {
  const repository = {
    createCampaignSimulation: jest.fn(),
  };
  const service = new AutoPricingService(repository as any);

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
