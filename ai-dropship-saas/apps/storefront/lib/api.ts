const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function req<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  scoreProduct: (body: {
    productId: string; productName?: string; source?: string; keyword?: string;
    trendVelocity: number; engagementRate: number; adFrequency: number;
    marginPotential: number; supplierScore: number; lowCompetitionFactor: number; sentimentScore: number;
  }) => req('POST', '/modules/winning-engine/score', body),

  generateAssets: (productName: string) =>
    req('POST', '/modules/ai-core/generate-assets', { productName }),

  scoreViral: (body: { views24h: number; comments: number; shares: number }) =>
    req('POST', '/modules/tiktok-analyzer/score-viral', body),

  optimizePrice: (body: { cost: number; marketAverage: number; targetMarginPct: number; estimatedCpa: number }) =>
    req('POST', '/modules/auto-pricing/optimize', body),

  scanCompetitor: (storeUrl: string) =>
    req('GET', `/modules/competitor-intelligence/scan?storeUrl=${encodeURIComponent(storeUrl)}`),

  getQueueStatus: () =>
    req<{ queues: Array<{ name: string; waiting: number; active: number; completed: number; failed: number }> }>(
      'GET', '/modules/queues/status'
    ),
};
