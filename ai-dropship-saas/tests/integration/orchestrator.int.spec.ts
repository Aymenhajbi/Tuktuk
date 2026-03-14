import { eventBus } from '../../packages/event-bus/src/event-bus';

describe('orchestrator integration event flow', () => {
  it('publishes CampaignSimulationCompletedV1', async () => {
    let captured = false;
    const unsubscribe = eventBus.subscribe('CampaignSimulationCompletedV1', async () => {
      captured = true;
    });

    eventBus.publish({
      type: 'CampaignSimulationCompletedV1',
      metadata: {
        version: 'v1',
        correlationId: 'c3',
        traceId: 't3',
        tenantId: 'tenant-z',
        occurredAt: new Date().toISOString(),
      },
      payload: {
        campaignSimulationId: 'cs-1',
        productRef: 'p-1',
        expectedRoas: 2.1,
        expectedCpa: 10,
      },
    });

    unsubscribe();
    expect(captured).toBe(true);
  });
});
