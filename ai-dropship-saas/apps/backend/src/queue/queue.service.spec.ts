import { QueueService } from './queue.service';

describe('QueueService', () => {
  const queueStateRepository = {
    upsertPendingJob: jest.fn().mockResolvedValue({}),
  };

  const service = new QueueService(queueStateRepository as any);

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('accepts ai scoring envelope', async () => {
    const envelope = {
      idempotencyKey: 'k1',
      correlationId: 'c1',
      traceId: 't1',
      tenantId: 'tenant',
      payload: { keyword: 'x' },
    };

    await expect(service.enqueueAiScoring(envelope)).resolves.toBeDefined();
  });
});
