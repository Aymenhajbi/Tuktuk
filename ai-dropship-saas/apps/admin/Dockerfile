# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Build context is the repo root (one level above ai-dropship-saas/)
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY ai-dropship-saas/package*.json ./
COPY ai-dropship-saas/apps/admin/package.json ./apps/admin/
COPY ai-dropship-saas/packages ./packages
RUN npm ci

# Copy source and build
COPY ai-dropship-saas/apps/admin ./apps/admin

# Ensure public/ exists (Next.js standalone requires it even if empty)
RUN mkdir -p apps/admin/public

RUN npm run build --workspace apps/admin

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

# Copy the standalone server bundle
COPY --from=builder /app/apps/admin/.next/standalone ./
# Copy static assets (required by Next.js standalone)
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/admin/server.js"]
