const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

const queues = [
  'ai-scoring-queue',
  'ai-scoring-queue-dlq',
  'scraper-jobs-queue',
  'scraper-jobs-queue-dlq',
  'campaign-simulation-queue',
  'campaign-simulation-queue-dlq',
];

(async () => {
  for (const q of queues) {
    const queue = new Queue(q, { connection: redis });
    await queue.waitUntilReady();
    console.log(JSON.stringify({ queue: q, status: 'ready' }));
    await queue.close();
  }
  await redis.quit();
})();
