# =============================================================================
# Multi-stage Dockerfile for Worker (BullMQ)
# Following Turborepo official Docker guide: https://turbo.build/repo/docs/guides/docker
# =============================================================================

FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 1: Prepare - Prune the monorepo for the worker workspace
# -----------------------------------------------------------------------------
FROM base AS prepare

RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@^2

COPY . .

RUN turbo prune worker --docker

# -----------------------------------------------------------------------------
# Stage 2: Builder - Install dependencies and build
# -----------------------------------------------------------------------------
FROM base AS builder

RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=prepare /app/out/full/ .

RUN pnpm turbo run build --filter=worker

# -----------------------------------------------------------------------------
# Stage 3: Production dependencies only (pruned)
# -----------------------------------------------------------------------------
FROM base AS prod-deps

RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

WORKDIR /app

COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 4: Runner - Final minimal production image
# -----------------------------------------------------------------------------
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

WORKDIR /app

COPY --from=prod-deps --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=worker:nodejs /app/packages ./packages

COPY --from=builder --chown=worker:nodejs /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder --chown=worker:nodejs /app/apps/worker/package.json ./apps/worker/

USER worker

WORKDIR /app/apps/worker

ENV NODE_ENV=production

CMD ["node", "dist/index.mjs"]

