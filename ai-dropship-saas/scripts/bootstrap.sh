#!/usr/bin/env bash
set -euo pipefail

cp -n .env.example .env || true
npm install
npm run prisma:generate --workspace apps/backend
