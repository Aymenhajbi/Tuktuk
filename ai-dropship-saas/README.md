# AI Dropship SaaS V2

Plateforme SaaS headless API-first pour détection de winning products, intelligence concurrentielle, scoring IA et orchestration semi-autonome.

## Architecture V2
```
ai-dropship-saas
  /apps
    /frontend
    /backend
    /scraper-service
    /ai-engine
    /data-pipeline
    /orchestrator
  /packages
    /ui
    /shared-types
    /event-bus
  /infrastructure
    /k8s
    /terraform
```

## Sprint 2 hardening livré
- BullMQ queues: `ai-scoring-queue`, `scraper-jobs-queue`, `campaign-simulation-queue`
- DLQ dédiées pour chaque queue
- Idempotency + queue state persistence (`QueueJobState`)
- Event bus versionné et type-safe (V1 contracts + validation)
- Workers dédiés:
  - `apps/ai-engine/src/workers/ai-scoring.worker.ts`
  - `apps/scraper-service/src/workers/scraper.worker.ts`
  - `apps/orchestrator/src/workers/orchestrator.worker.ts`
- Logging JSON + métriques Prometheus (`queue_length`, `queue_processing_time_ms`)

## Local setup
```bash
cp .env.example .env
./scripts/bootstrap.sh
```

## Run queues and workers
```bash
npm run queues:start
npm run workers:start
```

## Backend docs
- Swagger: `/api/docs`
- Global Prisma error filter activé
