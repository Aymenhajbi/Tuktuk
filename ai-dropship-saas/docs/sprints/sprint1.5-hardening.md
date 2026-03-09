# Sprint 1.5 — Hardening

Scope verrouillé:
- Transactions et rollback sur writes critiques
- Idempotency protection
- SystemEvent enrichi
- Tests unitaires + intégration backend

Fichiers de référence inclus:
- `apps/backend/src/modules/orchestrator/orchestrator.service.ts`
- `apps/backend/src/common/filters/prisma-exception.filter.ts`
- `apps/backend/prisma/migrations/202602180002_reliability_hardening/migration.sql`
- `apps/backend/src/modules/*/*.spec.ts`
- `apps/backend/test/integration/orchestrator.int.spec.ts`
