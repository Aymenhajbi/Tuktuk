const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const dlq = new Queue('ai-scoring-dlq', { connection });

const embeddingCache = new Map();

function fakeEmbedding(text) {
  if (embeddingCache.has(text)) return embeddingCache.get(text);
  const vector = Array.from({ length: 8 }, (_, i) => Number((((text.length + i) % 10) / 10).toFixed(2)));
  embeddingCache.set(text, vector);
  return vector;
}

new Worker(
  'ai-scoring',
  async (job) => {
    const { productId, keyword, winningScore, successProbability7d } = job.data;
    const embedding = fakeEmbedding(keyword);
    const aiScore = Number((winningScore * 0.6 + successProbability7d * 0.4).toFixed(2));

    return {
      productId,
      embedding,
      aiScore,
      decision: aiScore >= 70 ? 'LAUNCH_TEST_CAMPAIGN' : 'DEFER',
    };
  },
  {
    connection,
    concurrency: 10,
    settings: { backoffStrategy: () => 1000 },
  },
)
  .on('completed', (job, result) => {
    console.log('ai-engine completed', { id: job.id, result });
  })
  .on('failed', async (job, err) => {
    console.error('ai-engine failed', { id: job?.id, err: err.message });
    if (job) {
      await dlq.add('failed-ai-score', { jobId: job.id, payload: job.data, error: err.message });
    }
  });

console.log('ai-engine worker started', { redisUrl, cache: 'in-memory embedding cache' });
