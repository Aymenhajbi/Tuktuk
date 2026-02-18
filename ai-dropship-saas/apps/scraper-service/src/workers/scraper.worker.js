const { Worker } = require('bullmq');
const IORedis = require('ioredis');

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

new Worker('scraper-jobs-queue', async (job) => {
  const startedAt = Date.now();
  console.log(JSON.stringify({
    queue: 'scraper-jobs-queue',
    jobId: job.id,
    processingTime: Date.now() - startedAt,
    retryCount: job.attemptsMade,
    failureCount: 0,
    status: 'completed',
  }));
  return { ok: true };
}, { connection: redis });
