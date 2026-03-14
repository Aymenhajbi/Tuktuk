import { QueueService } from './queue.service';

jest.mock('bullmq', () => {
  const mockQueue = jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'job-mock-1' }),
    count: jest.fn().mockResolvedValue(0),
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }),
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  }));
  const mockQueueEvents = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  }));
  return { Queue: mockQueue, QueueEvents: mockQueueEvents };
});

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
