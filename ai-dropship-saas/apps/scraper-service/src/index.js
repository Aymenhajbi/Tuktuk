class ProxyPool {
  constructor(proxies = []) {
    this.proxies = proxies.map((proxyUrl) => ({ proxyUrl, health: 100, failures: 0, latencyMs: 0 }));
    this.index = 0;
  }

  getNextProxy() {
    if (this.proxies.length === 0) return null;
    const sorted = [...this.proxies].sort((a, b) => b.health - a.health);
    const proxy = sorted[this.index % sorted.length];
    this.index += 1;
    return proxy;
  }

  report(proxyUrl, ok, latencyMs = 0) {
    const proxy = this.proxies.find((item) => item.proxyUrl === proxyUrl);
    if (!proxy) return;
    proxy.latencyMs = latencyMs;
    if (ok) proxy.health = Math.min(100, proxy.health + 1);
    else {
      proxy.failures += 1;
      proxy.health = Math.max(0, proxy.health - 15);
    }
  }
}

class ScrapingQueue {
  constructor() {
    this.jobs = [];
  }

  add(job) {
    this.jobs.push(job);
    this.jobs.sort((a, b) => b.priority - a.priority);
  }

  next() {
    return this.jobs.shift() ?? null;
  }
}

const antiBlockConfig = {
  fingerprintMasking: true,
  captchaStrategy: 'human-in-the-loop-fallback',
  rateAdaptation: { minDelayMs: 800, maxDelayMs: 5000, adaptive: true },
  userAgentRandomization: true,
  retry: { attempts: 5, backoff: 'exponential' },
};

function bootstrap() {
  const proxies = (process.env.PROXY_LIST ?? '').split(',').filter(Boolean);
  const proxyPool = new ProxyPool(proxies);
  const queue = new ScrapingQueue();

  queue.add({ id: 'job-tiktok-trends', priority: 100, source: 'tiktok' });
  queue.add({ id: 'job-meta-ads', priority: 80, source: 'meta' });
  queue.add({ id: 'job-shopify-footprints', priority: 70, source: 'shopify' });

  const nextJob = queue.next();
  const selectedProxy = proxyPool.getNextProxy();

  console.log('scraper-service online', {
    antiBlockConfig,
    selectedJob: nextJob,
    selectedProxy,
    healthCheckEnabled: true,
  });
}

bootstrap();
