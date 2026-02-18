import { BadRequestException } from '@nestjs/common';
import { WinningEngineService } from './winning-engine.service';

describe('WinningEngineService', () => {
  const repository = {
    createTrendAndWinningScore: jest.fn(),
  };

  const service = new WinningEngineService(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('calculates and persists valid score', async () => {
    repository.createTrendAndWinningScore.mockResolvedValue({
      snapshot: { id: 'snap-1' },
      trendSignal: { id: 'trend-1' },
      winningScore: { id: 'ws-1', score: 80 },
    });

    const result = await service.calculateWinningScore({
      productId: 'p1',
      trendVelocity: 80,
      engagementRate: 80,
      adFrequency: 80,
      marginPotential: 80,
      supplierScore: 80,
      lowCompetitionFactor: 80,
      sentimentScore: 80,
    });

    expect(repository.createTrendAndWinningScore).toHaveBeenCalled();
    expect(result.decision).toBe('IMPORT_SUGGESTED');
  });

  it('throws for invalid score range', async () => {
    await expect(
      service.calculateWinningScore({
        productId: 'p2',
        trendVelocity: 200,
        engagementRate: 200,
        adFrequency: 200,
        marginPotential: 200,
        supplierScore: 200,
        lowCompetitionFactor: 200,
        sentimentScore: 200,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
