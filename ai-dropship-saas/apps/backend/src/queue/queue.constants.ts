export const QUEUES = {
  AI_SCORING: 'ai-scoring-queue',
  AI_SCORING_DLQ: 'ai-scoring-queue-dlq',
  SCRAPER_JOBS: 'scraper-jobs-queue',
  SCRAPER_JOBS_DLQ: 'scraper-jobs-queue-dlq',
  CAMPAIGN_SIMULATION: 'campaign-simulation-queue',
  CAMPAIGN_SIMULATION_DLQ: 'campaign-simulation-queue-dlq',
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];
