# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY package*.json ./
COPY apps/storefront/package.json ./apps/storefront/
COPY packages ./packages
RUN npm ci

# Copy source and build
COPY apps/storefront ./apps/storefront

RUN npm run build --workspace apps/storefront

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the standalone server bundle
COPY --from=builder /app/apps/storefront/.next/standalone ./
# Copy static assets into the standalone directory (required by Next.js standalone)
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# Next.js standalone server — entry point mirrors the monorepo path
CMD ["node", "apps/storefront/server.js"]
