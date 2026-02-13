import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from './queue.constants';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
  private readonly aiQueue = new Queue(QUEUES.AI_SCORING, { connection: this.connection });
  private readonly aiDlq = new Queue(QUEUES.AI_SCORING_DLQ, { connection: this.connection });

  async enqueueAiScoring(payload: Record<string, unknown>, opts?: JobsOptions) {
    return this.aiQueue.add('score-product', payload, {
      attempts: 4,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 500,
      ...opts,
    });
  }

  async moveToDlq(payload: Record<string, unknown>) {
    return this.aiDlq.add('failed-ai-score', payload, { removeOnComplete: 1000 });
  }

  async onModuleDestroy() {
    await this.aiQueue.close();
    await this.aiDlq.close();
    await this.connection.quit();
  }
}
