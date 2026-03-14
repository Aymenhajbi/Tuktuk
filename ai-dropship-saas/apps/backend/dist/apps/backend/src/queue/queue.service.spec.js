"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_service_1 = require("./queue.service");
describe('QueueService', () => {
    const queueStateRepository = {
        upsertPendingJob: jest.fn().mockResolvedValue({}),
    };
    const service = new queue_service_1.QueueService(queueStateRepository);
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
