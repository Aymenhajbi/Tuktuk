# Sprint 2 — Event-driven queues/workers

Scope verrouillé:
- BullMQ queues + DLQ
- Versioned event bus contracts
- Workers (ai-engine/scraper/orchestrator)
- Queue job state persistence
- Prometheus metrics + JSON logs

Fichiers de référence inclus:
- `apps/backend/src/queue/*`
- `packages/event-bus/src/*`
- `apps/ai-engine/src/workers/*`
- `apps/scraper-service/src/workers/*`
- `apps/orchestrator/src/workers/*`
- `apps/backend/prisma/migrations/202602180003_queue_job_state/migration.sql`
