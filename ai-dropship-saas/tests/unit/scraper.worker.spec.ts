import { eventBus } from '../../packages/event-bus/src/event-bus';

describe('scraper worker event bus', () => {
  it('subscribes and receives ProductSnapshotCreatedV1', async () => {
    const received: string[] = [];
    const unsubscribe = eventBus.subscribe('ProductSnapshotCreatedV1', async (event) => {
      received.push(event.type);
    });

    eventBus.publish({
      type: 'ProductSnapshotCreatedV1',
      metadata: {
        version: 'v1',
        correlationId: 'c2',
        traceId: 't2',
        tenantId: 'tenant-a',
        occurredAt: new Date().toISOString(),
      },
      payload: {
        snapshotId: 's1',
        externalId: 'ext-1',
        source: 'scraper',
      },
    });

    unsubscribe();
    expect(received).toContain('ProductSnapshotCreatedV1');
  });
});
