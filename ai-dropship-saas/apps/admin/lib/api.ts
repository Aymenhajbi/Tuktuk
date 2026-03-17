const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Shared promise so concurrent 401s only trigger one refresh call
let refreshing: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const rt = typeof window !== 'undefined' ? localStorage.getItem('admin_refresh_token') : null;
  if (!rt) throw new Error('no refresh token');
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!res.ok) throw new Error('refresh failed');
  const { access_token, refresh_token } = await res.json() as { access_token: string; refresh_token: string };
  localStorage.setItem('admin_access_token', access_token);
  localStorage.setItem('admin_refresh_token', refresh_token);
}

async function req<T = unknown>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    try {
      if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
      await refreshing;
      return req<T>(method, path, body, false);
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

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
