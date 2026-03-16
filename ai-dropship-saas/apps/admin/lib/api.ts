const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function req<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface ScoreProductBody {
  productId: string;
  productName?: string;
  source?: string;
  keyword?: string;
  trendVelocity: number;
  engagementRate: number;
  adFrequency: number;
  marginPotential: number;
  supplierScore: number;
  lowCompetitionFactor: number;
  sentimentScore: number;
}

export interface QueueCounts {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused?: number;
}

export interface QueueStatusResult {
  queues: Array<{ name: string } & QueueCounts>;
  dlqs: Array<{ name: string } & QueueCounts>;
  timestamp: string;
}

export const api = {
  scoreProduct: (body: ScoreProductBody) =>
    req('POST', '/modules/winning-engine/score', body),

  generateAssets: (productName: string) =>
    req('POST', '/modules/ai-core/generate-assets', { productName }),

  predictTrend: (body: { trendVelocity: number; competitionDensity: number }) =>
    req('POST', '/modules/ai-core/predict-trend', body),

  scanCompetitor: (storeUrl: string) =>
    req('GET', `/modules/competitor-intelligence/scan?storeUrl=${encodeURIComponent(storeUrl)}`),

  scoreViral: (body: { views24h: number; comments: number; shares: number }) =>
    req('POST', '/modules/tiktok-analyzer/score-viral', body),

  optimizePrice: (body: { cost: number; marketAverage: number; targetMarginPct: number; estimatedCpa: number }) =>
    req('POST', '/modules/auto-pricing/optimize', body),

  processSignal: (body: unknown) =>
    req('POST', '/modules/orchestrator/process-signal', body),

  getQueueStatus: () =>
    req<QueueStatusResult>('GET', '/modules/queues/status'),
};
