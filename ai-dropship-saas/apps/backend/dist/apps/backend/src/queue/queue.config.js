"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueConfig = void 0;
exports.queueConfig = {
    attempts: Number(process.env.QUEUE_ATTEMPTS ?? 5),
    backoffDelay: Number(process.env.QUEUE_BACKOFF_DELAY_MS ?? 1000),
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
    },
};
