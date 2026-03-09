"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const src_1 = require("../../../../packages/event-bus/src");
const queue_config_1 = require("./queue.config");
const queue_constants_1 = require("./queue.constants");
const prom_client_1 = require("prom-client");
const queue_state_repository_1 = require("./queue-state.repository");
let QueueService = QueueService_1 = class QueueService {
    constructor(queueStateRepository) {
        this.queueStateRepository = queueStateRepository;
        this.logger = new common_1.Logger(QueueService_1.name);
        // 🔥 BullMQ gère Redis directement via config
        this.aiQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.AI_SCORING, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.aiDlq = new bullmq_1.Queue(queue_constants_1.QUEUES.AI_SCORING_DLQ, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.scraperQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.SCRAPER_JOBS, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.scraperDlq = new bullmq_1.Queue(queue_constants_1.QUEUES.SCRAPER_JOBS_DLQ, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.campaignQueue = new bullmq_1.Queue(queue_constants_1.QUEUES.CAMPAIGN_SIMULATION, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.campaignDlq = new bullmq_1.Queue(queue_constants_1.QUEUES.CAMPAIGN_SIMULATION_DLQ, {
            connection: queue_config_1.queueConfig.redis,
        });
        this.queueEvents = {
            [queue_constants_1.QUEUES.AI_SCORING]: new bullmq_1.QueueEvents(queue_constants_1.QUEUES.AI_SCORING, {
                connection: queue_config_1.queueConfig.redis,
            }),
            [queue_constants_1.QUEUES.SCRAPER_JOBS]: new bullmq_1.QueueEvents(queue_constants_1.QUEUES.SCRAPER_JOBS, {
                connection: queue_config_1.queueConfig.redis,
            }),
            [queue_constants_1.QUEUES.CAMPAIGN_SIMULATION]: new bullmq_1.QueueEvents(queue_constants_1.QUEUES.CAMPAIGN_SIMULATION, { connection: queue_config_1.queueConfig.redis }),
        };
        this.queueLengthGauge = new prom_client_1.Gauge({
            name: 'queue_length',
            help: 'Current queue length',
            labelNames: ['queue'],
        });
        this.avgProcessingTime = new prom_client_1.Histogram({
            name: 'queue_processing_time_ms',
            help: 'Queue processing time in milliseconds',
            labelNames: ['queue'],
            buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000],
        });
        this.failureRateGauge = new prom_client_1.Gauge({
            name: 'queue_failure_rate',
            help: 'Failure rate by queue',
            labelNames: ['queue'],
        });
        for (const [queueName, events] of Object.entries(this.queueEvents)) {
            events.on('completed', ({ jobId }) => this.logMetric(queueName, jobId ?? '', 'completed', 0, 0, 0));
            events.on('failed', ({ jobId }) => this.logMetric(queueName, jobId ?? '', 'failed', 0, 0, 1));
            events.on('stalled', ({ jobId }) => this.logMetric(queueName, jobId ?? '', 'stalled', 0, 0, 1));
        }
    }
    defaultOptions(opts) {
        return {
            attempts: queue_config_1.queueConfig.attempts,
            backoff: { type: 'exponential', delay: queue_config_1.queueConfig.backoffDelay },
            removeOnComplete: 500,
            removeOnFail: 1000,
            ...opts,
        };
    }
    publishQueueAcceptedEvent(queueName, envelope) {
        const meta = {
            version: 'v1',
            correlationId: envelope.correlationId,
            traceId: envelope.traceId,
            tenantId: envelope.tenantId,
            occurredAt: new Date().toISOString(),
            idempotencyKey: envelope.idempotencyKey,
        };
        if (queueName === queue_constants_1.QUEUES.AI_SCORING) {
            const evt = {
                type: 'TrendSignalCreatedV1',
                metadata: meta,
                payload: {
                    trendSignalId: String(envelope.payload.trendSignalId ?? 'pending'),
                    productSnapshotId: String(envelope.payload.productSnapshotId ?? 'pending'),
                    keyword: String(envelope.payload.keyword ?? 'unknown'),
                    trendVelocity: Number(envelope.payload.trendVelocity ?? 0),
                },
            };
            src_1.eventBus.publish(evt);
        }
        if (queueName === queue_constants_1.QUEUES.CAMPAIGN_SIMULATION) {
            const evt = {
                type: 'CampaignSimulationCompletedV1',
                metadata: meta,
                payload: {
                    campaignSimulationId: String(envelope.payload.campaignSimulationId ?? 'pending'),
                    productRef: String(envelope.payload.productRef ?? 'unknown'),
                    expectedRoas: Number(envelope.payload.expectedRoas ?? 0),
                    expectedCpa: Number(envelope.payload.expectedCpa ?? 0),
                },
            };
            src_1.eventBus.publish(evt);
        }
    }
    logMetric(queue, jobId, status, processingTime, retryCount, failureCount) {
        const metric = {
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
    async enqueueAiScoring(envelope, opts) {
        await this.queueStateRepository.upsertPendingJob({
            queueName: queue_constants_1.QUEUES.AI_SCORING,
            idempotencyKey: envelope.idempotencyKey,
            correlationId: envelope.correlationId,
            traceId: envelope.traceId,
            tenantId: envelope.tenantId,
        });
        this.publishQueueAcceptedEvent(queue_constants_1.QUEUES.AI_SCORING, envelope);
        const job = await this.aiQueue.add('score-product', envelope, this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }));
        this.queueLengthGauge
            .labels(queue_constants_1.QUEUES.AI_SCORING)
            .set(await this.aiQueue.count());
        return job;
    }
    async enqueueScraperJob(envelope, opts) {
        await this.queueStateRepository.upsertPendingJob({
            queueName: queue_constants_1.QUEUES.SCRAPER_JOBS,
            idempotencyKey: envelope.idempotencyKey,
            correlationId: envelope.correlationId,
            traceId: envelope.traceId,
            tenantId: envelope.tenantId,
        });
        const job = await this.scraperQueue.add('scrape-source', envelope, this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }));
        this.queueLengthGauge
            .labels(queue_constants_1.QUEUES.SCRAPER_JOBS)
            .set(await this.scraperQueue.count());
        return job;
    }
    async enqueueCampaignSimulation(envelope, opts) {
        await this.queueStateRepository.upsertPendingJob({
            queueName: queue_constants_1.QUEUES.CAMPAIGN_SIMULATION,
            idempotencyKey: envelope.idempotencyKey,
            correlationId: envelope.correlationId,
            traceId: envelope.traceId,
            tenantId: envelope.tenantId,
        });
        this.publishQueueAcceptedEvent(queue_constants_1.QUEUES.CAMPAIGN_SIMULATION, envelope);
        const job = await this.campaignQueue.add('simulate-campaign', envelope, this.defaultOptions({ jobId: envelope.idempotencyKey, ...opts }));
        this.queueLengthGauge
            .labels(queue_constants_1.QUEUES.CAMPAIGN_SIMULATION)
            .set(await this.campaignQueue.count());
        return job;
    }
    async moveToDlq(queue, envelope, reason) {
        const data = { ...envelope, reason };
        if (queue === 'ai')
            return this.aiDlq.add('failed-ai-score', data, this.defaultOptions());
        if (queue === 'scraper')
            return this.scraperDlq.add('failed-scrape-job', data, this.defaultOptions());
        return this.campaignDlq.add('failed-campaign-job', data, this.defaultOptions());
    }
    async onModuleDestroy() {
        await Promise.all(Object.values(this.queueEvents).map((event) => event.close()));
        await this.aiQueue.close();
        await this.aiDlq.close();
        await this.scraperQueue.close();
        await this.scraperDlq.close();
        await this.campaignQueue.close();
        await this.campaignDlq.close();
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_state_repository_1.QueueStateRepository])
], QueueService);
