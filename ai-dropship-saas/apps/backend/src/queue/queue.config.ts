// Railway injects REDIS_URL as a full connection string; parse it if present.
function parseRedisUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port) || 6379,
      username: u.username || undefined,
      password: u.password || undefined,
      tls: u.protocol === 'rediss:' ? ({} as object) : undefined,
    };
  } catch {
    return null;
  }
}

const fromUrl = process.env.REDIS_URL ? parseRedisUrl(process.env.REDIS_URL) : null;

export const queueConfig = {
  attempts: Number(process.env.QUEUE_ATTEMPTS ?? 5),
  backoffDelay: Number(process.env.QUEUE_BACKOFF_DELAY_MS ?? 1000),
  redis: {
    host: fromUrl?.host ?? process.env.REDIS_HOST ?? 'localhost',
    port: fromUrl?.port ?? Number(process.env.REDIS_PORT ?? 6379),
    username: fromUrl?.username ?? process.env.REDIS_USERNAME,
    password: fromUrl?.password ?? process.env.REDIS_PASSWORD,
    tls: fromUrl?.tls ?? (process.env.REDIS_TLS === 'true' ? {} : undefined),
    maxRetriesPerRequest: null as null,
    // false = don't throw on startup if Redis isn't instantly reachable
    enableReadyCheck: false,
  },
};
