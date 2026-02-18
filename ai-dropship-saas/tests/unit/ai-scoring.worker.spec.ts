import { validateEvent } from '../../packages/event-bus/src/validator';

describe('ai-scoring worker contracts', () => {
  it('validates WinningScoreCreatedV1 contract', () => {
    expect(() =>
      validateEvent({
        type: 'WinningScoreCreatedV1',
        metadata: {
          version: 'v1',
          correlationId: 'c1',
          traceId: 't1',
          tenantId: 'tenant',
          occurredAt: new Date().toISOString(),
        },
        payload: {
          winningScoreId: 'ws1',
          trendSignalId: 'ts1',
          score: 88,
        },
      }),
    ).not.toThrow();
  });
});
