import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
import {
  eventBus,
  TrendSignalCreatedV1,
  CampaignSimulationCompletedV1,
} from '../../../../packages/event-bus/src';
import { queueConfig } from './queue.config';
import { QUEUES } from './queue.constants';
import { QueueEnvelope, QueueMetricLog } from './queue.types';
import { Gauge, Histogram } from 'prom-client';
import { QueueStateRepository } from './queue-state.repository';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);

  // 🔥 BullMQ gère Redis directement via config
  private readonly aiQueue = new Queue(QUEUES.AI_SCORING, {
    connection: queueConfig.redis,
  });

  private readonly aiDlq = new Queue(QUEUES.AI_SCORING_DLQ, {
    connection: queueConfig.redis,
  });

  private readonly scraperQueue = new Queue(QUEUES.SCRAPER_JOBS, {
    connection: queueConfig.redis,
  });

  private readonly scraperDlq = new Queue(QUEUES.SCRAPER_JOBS_DLQ, {
    connection: queueConfig.redis,
  });

  private readonly campaignQueue = new Queue(QUEUES.CAMPAIGN_SIMULATION, {
    connection: queueConfig.redis,
  });

  private readonly campaignDlq = new Queue(QUEUES.CAMPAIGN_SIMULATION_DLQ, {
    connection: queueConfig.redis,
  });

  private readonly queueEvents = {
    [QUEUES.AI_SCORING]: new QueueEvents(QUEUES.AI_SCORING, {
      connection: queueConfig.redis,
    }),
    [QUEUES.SCRAPER_JOBS]: new QueueEvents(QUEUES.SCRAPER_JOBS, {
      connection: queueConfig.redis,
    }),
    [QUEUES.CAMPAIGN_SIMULATION]: new QueueEvents(
      QUEUES.CAMPAIGN_SIMULATION,
      { connection: queueConfig.redis },
    ),
  } as const;

  private readonly queueLengthGauge = new Gauge({
    name: 'queue_length',
    help: 'Current queue length',
    labelNames: ['queue'],
  });

  private readonly avgProcessingTime = new Histogram({
    name: 'queue_processing_time_ms',
    help: 'Queue processing time in milliseconds',
    labelNames: ['queue'],
    buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000],
  });

  private readonly failureRateGauge = new Gauge({
    name: 'queue_failure_rate',
    help: 'Failure rate by queue',
    labelNames: ['queue'],
  });

  constructor(private readonly queueStateRepository: QueueStateRepository) {
    for (const [queueName, events] of Object.entries(this.queueEvents)) {
      events.on('completed', ({ jobId }) =>
        this.logMetric(queueName, jobId ?? '', 'completed', 0, 0, 0),
      );
      events.on('failed', ({ jobId }) =>
        this.logMetric(queueName, jobId ?? '', 'failed', 0, 0, 1),
      );
      events.on('stalled', ({ jobId }) =>
        this.logMetric(queueName, jobId ?? '', 'stalled', 0, 0, 1),
      );
    }
  }

  private defaultOptions(opts?: JobsOptions): JobsOptions {
    return {
      attempts: queueConfig.attempts,
      backoff: { type: 'exponential', delay: queueConfig.backoffDelay },
      removeOnComplete: 500,
      removeOnFail: 1000,
      ...opts,
    };
  }

  private publishQueueAcceptedEvent(
    queueName: string,
    envelope: QueueEnvelope,
  ): void {
    const meta = {
      version: 'v1' as const,
      correlationId: envelope.correlationId,
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
      occurredAt: new Date().toISOString(),
      idempotencyKey: envelope.idempotencyKey,
    };

    if (queueName === QUEUES.AI_SCORING) {
      const evt: TrendSignalCreatedV1 = {
        type: 'TrendSignalCreatedV1',
        metadata: meta,
        payload: {
          trendSignalId: String(
            (envelope.payload as any).trendSignalId ?? 'pending',
          ),
          productSnapshotId: String(
            (envelope.payload as any).productSnapshotId ?? 'pending',
          ),
          keyword: String((envelope.payload as any).keyword ?? 'unknown'),
          trendVelocity: Number(
            (envelope.payload as any).trendVelocity ?? 0,
          ),
        },
      };
      eventBus.publish(evt);
    }

    if (queueName === QUEUES.CAMPAIGN_SIMULATION) {
      const evt: CampaignSimulationCompletedV1 = {
        type: 'CampaignSimulationCompletedV1',
        metadata: meta,
        payload: {
          campaignSimulationId: String(
            (envelope.payload as any).campaignSimulationId ?? 'pending',
          ),
          productRef: String(
            (envelope.payload as any).productRef ?? 'unknown',
          ),
          expectedRoas: Number(
            (envelope.payload as any).expectedRoas ?? 0,
          ),
          expectedCpa: Number(
            (envelope.payload as any).expectedCpa ?? 0,
          ),
        },
      };
      eventBus.publish(evt);
    }
  }

  private logMetric(
    queue: string,
    jobId: string,
    status: QueueMetricLog['status'],
    processingTime: number,
    retryCount: number,
    failureCount: number,
  ) {
    const metric: QueueMetricLog = {
      queue,
      jobId,
      status,
      processingTime,
      retryCount,
      failureCount,
    };

    this.avgProcessingTime.labels(queue).observe(processingTime);

    const denom = Math.max(retryCount + 1, 1);
    this.failureRateGauge.labels(queue).set(failureCount / denom);

    this.logger.log(JSON.stringify(metric));
  }

  async enqueueAiScoring(envelope: QueueEnvelope, opts?: JobsOptions) {
    await this.queueStateRepository.upsertPendingJob({
      queueName: QUEUES.AI_SCORING,
      idempotencyKey: envelope.idempotencyKey,
      correlationId: envelope.correlationId,
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
    });

    this.publishQueueAcceptedEvent(QUEUES.AI_SCORING, envelope);

    const job = await this.aiQueue.add(
      'score-product',
      envelope,
      this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }),
    );

    this.queueLengthGauge
      .labels(QUEUES.AI_SCORING)
      .set(await this.aiQueue.count());

    return job;
  }

  async enqueueScraperJob(envelope: QueueEnvelope, opts?: JobsOptions) {
    await this.queueStateRepository.upsertPendingJob({
      queueName: QUEUES.SCRAPER_JOBS,
      idempotencyKey: envelope.idempotencyKey,
      correlationId: envelope.correlationId,
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
    });

    const job = await this.scraperQueue.add(
      'scrape-source',
      envelope,
      this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }),
    );

    this.queueLengthGauge
      .labels(QUEUES.SCRAPER_JOBS)
      .set(await this.scraperQueue.count());

    return job;
  }

  async enqueueCampaignSimulation(
    envelope: QueueEnvelope,
    opts?: JobsOptions,
  ) {
    await this.queueStateRepository.upsertPendingJob({
      queueName: QUEUES.CAMPAIGN_SIMULATION,
      idempotencyKey: envelope.idempotencyKey,
      correlationId: envelope.correlationId,
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
    });

    this.publishQueueAcceptedEvent(
      QUEUES.CAMPAIGN_SIMULATION,
      envelope,
    );

    const job = await this.campaignQueue.add(
      'simulate-campaign',
      envelope,
      this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }),
    );

    this.queueLengthGauge
      .labels(QUEUES.CAMPAIGN_SIMULATION)
      .set(await this.campaignQueue.count());

    return job;
  }

  async moveToDlq(
    queue: 'ai' | 'scraper' | 'campaign',
    envelope: QueueEnvelope,
    reason: string,
  ) {
    const data = { ...envelope, reason };

    if (queue === 'ai')
      return this.aiDlq.add(
        'failed-ai-score',
        data,
        this.defaultOptions(),
      );

    if (queue === 'scraper')
      return this.scraperDlq.add(
        'failed-scrape-job',
        data,
        this.defaultOptions(),
      );

    return this.campaignDlq.add(
      'failed-campaign-job',
      data,
      this.defaultOptions(),
    );
  }

  async getQueueStatus() {
    const [ai, scraper, campaign, aiDlq, scraperDlq, campaignDlq] = await Promise.all([
      this.aiQueue.getJobCounts(),
      this.scraperQueue.getJobCounts(),
      this.campaignQueue.getJobCounts(),
      this.aiDlq.getJobCounts(),
      this.scraperDlq.getJobCounts(),
      this.campaignDlq.getJobCounts(),
    ]);

    return {
      queues: [
        { name: QUEUES.AI_SCORING, ...ai },
        { name: QUEUES.SCRAPER_JOBS, ...scraper },
        { name: QUEUES.CAMPAIGN_SIMULATION, ...campaign },
      ],
      dlqs: [
        { name: QUEUES.AI_SCORING_DLQ, ...aiDlq },
        { name: QUEUES.SCRAPER_JOBS_DLQ, ...scraperDlq },
        { name: QUEUES.CAMPAIGN_SIMULATION_DLQ, ...campaignDlq },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.queueEvents).map((event) => event.close()),
    );

    await this.aiQueue.close();
    await this.aiDlq.close();
    await this.scraperQueue.close();
    await this.scraperDlq.close();
    await this.campaignQueue.close();
    await this.campaignDlq.close();
  }
}
