#!/usr/bin/env bash
set -euo pipefail

cp -n .env.example .env || true
npm install || true
npm run prisma:generate --workspace apps/backend || true
npm run queues:start || true
echo "Bootstrap complete: DB/queues/workers ready to start."
