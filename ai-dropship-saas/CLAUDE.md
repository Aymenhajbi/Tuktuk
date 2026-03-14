# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered dropshipping SaaS platform. The primary development environment is Docker-based. All services run as containers communicating over the `tuktuk-network` bridge network.

## Commands

### Docker (primary dev workflow)
```bash
# Start all services
./scripts/docker-start.sh          # Linux/Mac
./scripts/docker-start.ps1         # Windows

# Or directly
docker compose up -d

# View service status
docker compose ps

# Tail logs for a specific service
docker compose logs -f tuktuk-backend
docker compose logs -f tuktuk-ai-engine
docker compose logs -f tuktuk-scraper
docker compose logs -f tuktuk-orchestrator

# Reset everything (clears volumes/data)
./scripts/docker-reset.sh
```

### Backend (NestJS) - run from repo root or apps/backend
```bash
npm run dev --workspace apps/backend          # Hot-reload dev server
npm run build --workspace apps/backend        # Compile TypeScript
npm run test --workspace apps/backend         # Run all tests
npm run test:unit --workspace apps/backend    # Unit tests with coverage
npm run test:integration --workspace apps/backend

# Prisma
npm run prisma:generate --workspace apps/backend   # Regenerate client after schema changes
npm run db:migrate --workspace apps/backend         # Run migrations
npm run db:seed --workspace apps/backend            # Seed database
```

### Database / Redis (via Docker exec)
```bash
docker compose exec tuktuk-postgres psql -U postgres -d dropship
docker compose exec tuktuk-redis redis-cli
```

### Swagger API Docs
Available at `http://localhost:3001/api/docs` when the backend is running.

## Architecture

### Monorepo (npm workspaces)
```
apps/backend          - NestJS REST API + BullMQ queue manager (port 3001)
apps/ai-engine        - BullMQ worker: ai-scoring-queue
apps/scraper-service  - BullMQ worker: scraper-jobs-queue
apps/orchestrator     - BullMQ worker: campaign-simulation-queue
apps/storefront       - Next.js customer marketplace (port 3000)
apps/admin            - Next.js admin dashboard (port 3002)
apps/data-pipeline    - ETL stub (not yet active)
packages/event-bus    - Versioned, type-safe event contracts
packages/shared-types - Common TypeScript interfaces
packages/ui           - Shared React components
```

### Request Flow
```
Storefront (:3000) / Admin (:3002)
        ↓ HTTP
Backend NestJS (:3001)
        ↓ BullMQ jobs (via Redis)
Workers: ai-engine / scraper-service / orchestrator
        ↓ Prisma
PostgreSQL (:5432)
```

Workers have no external ports — they only consume from Redis queues and write to PostgreSQL.

### Queue Architecture (BullMQ)
Three queues + corresponding dead-letter queues (DLQ):

| Queue | Worker | DLQ |
|-------|--------|-----|
| `ai-scoring-queue` | ai-engine | `ai-scoring-dlq` |
| `scraper-jobs-queue` | scraper-service | `scraper-jobs-dlq` |
| `campaign-simulation-queue` | orchestrator | `campaign-simulation-dlq` |

Jobs: 5 retry attempts, exponential backoff. Idempotency keys prevent duplicate processing. `QueueJobState` model tracks job status in PostgreSQL.

### Event Bus (`packages/event-bus`)
Versioned event contracts (V1) published after each worker completes:
- `TrendSignalCreatedV1`
- `WinningScoreCreatedV1`
- `CampaignSimulationCompletedV1`
- `ProductSnapshotCreatedV1`
- `CampaignReadyV1`

All events carry `correlationId`, `traceId`, `tenantId`, and `idempotencyKey` in metadata. Add new events in `packages/event-bus/src/contracts/events.ts` following the V1 naming pattern.

### Backend Module Layout (`apps/backend/src/modules/`)
- `winning-engine` — Core product scoring logic
- `ai-core` — OpenAI integration and ML scoring
- `competitor-intelligence` — Competitor analysis
- `tiktok-analyzer` — TikTok trend signals
- `auto-pricing` — Dynamic pricing algorithms
- `orchestrator` — Workflow decision making

### Database (Prisma schema at `apps/backend/prisma/schema.prisma`)
Key models: `ProductSnapshot`, `TrendSignal`, `WinningScore`, `OrchestratorDecision`, `CampaignTest`, `IdempotencyKey`, `QueueJobState`, `SystemEvent`.

All domain models include `tenantId` for multi-tenancy and `correlationId` for distributed tracing.

### Docker Service Names (internal network hostnames)
- `tuktuk-postgres` — PostgreSQL
- `tuktuk-redis` — Redis
- `tuktuk-backend` — Backend API

Use these hostnames in inter-service communication (e.g., `DATABASE_URL=postgresql://postgres:postgres@tuktuk-postgres:5432/dropship`).

## Sprint History
- **Sprint 1** — Prisma persistence layer, repository pattern, migrations
- **Sprint 1.5** — Transaction support, idempotency, DB constraint hardening
- **Sprint 2** — BullMQ workers, versioned event bus, DLQs, Prometheus metrics, JSON structured logging

Docs in `docs/sprints/`.
