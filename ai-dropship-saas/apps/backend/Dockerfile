# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Build context is the repo root (one level above ai-dropship-saas/)
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl openssl-dev libc6-compat

# Install dependencies first (better layer caching)
COPY ai-dropship-saas/package*.json ./
COPY ai-dropship-saas/apps/backend/package.json ./apps/backend/
COPY ai-dropship-saas/packages ./packages
RUN npm ci

# Copy source and build
COPY ai-dropship-saas/apps/backend/src ./apps/backend/src
COPY ai-dropship-saas/apps/backend/tsconfig.json ./apps/backend/
COPY ai-dropship-saas/apps/backend/nest-cli.json ./apps/backend/
COPY ai-dropship-saas/apps/backend/prisma ./apps/backend/prisma

RUN npm run prisma:generate --workspace apps/backend
RUN npm run build --workspace apps/backend

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init openssl openssl-dev libc6-compat

ENV NODE_ENV=production

# Install production dependencies only
COPY ai-dropship-saas/package*.json ./
COPY ai-dropship-saas/apps/backend/package.json ./apps/backend/
COPY ai-dropship-saas/packages ./packages
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma engine binaries and generated client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy compiled app and prisma schema/migrations
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]

# Run migrations then start the server
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/apps/backend/src/main.js"]
