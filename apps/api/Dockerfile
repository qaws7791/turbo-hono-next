# =============================================================================
# Multi-stage Dockerfile for Hono API (ARM64 optimized)
# Following Turborepo official Docker guide: https://turbo.build/repo/docs/guides/docker
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 0: Base image with common dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 1: Prepare - Prune the monorepo for the api workspace
# -----------------------------------------------------------------------------
FROM base AS prepare

# Install turbo globally
RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

# Setup PNPM_HOME for global packages
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@^2

# Copy entire monorepo
COPY . .

# Generate a pruned monorepo with only api dependencies
# --docker flag separates json (for install) and full (for build)
RUN turbo prune api --docker

# -----------------------------------------------------------------------------
# Stage 2: Builder - Install dependencies and build
# -----------------------------------------------------------------------------
FROM base AS builder

RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

# Install build dependencies for native modules (if needed)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# First, copy only package.json files and pruned lockfile (for better caching)
# This layer is cached unless package.json or lockfile changes
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (--ignore-scripts to skip husky setup in Docker)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Now copy the full source code
COPY --from=prepare /app/out/full/ .

# Optional: Enable remote caching (uncomment to use)
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the api using turbo
RUN pnpm turbo run build --filter=api

# -----------------------------------------------------------------------------
# Stage 3: Production dependencies only (pruned)
# -----------------------------------------------------------------------------
FROM base AS prod-deps

RUN corepack enable && corepack prepare pnpm@10.2.1 --activate

WORKDIR /app

# Copy pruned package.json files and lockfile
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies only (--ignore-scripts to skip husky setup in Docker)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 4: Runner - Final minimal production image
# -----------------------------------------------------------------------------
FROM base AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

WORKDIR /app

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=hono:nodejs /app/packages ./packages

# Copy built application from builder stage
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=hono:nodejs /app/apps/api/package.json ./apps/api/

USER hono

WORKDIR /app/apps/api

# Environment variables (will be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),2000); const port=process.env.PORT||'3000'; fetch('http://127.0.0.1:'+port+'/health',{signal:ac.signal}).then(r=>{clearTimeout(t); process.exit(r.ok?0:1);}).catch(()=>{clearTimeout(t); process.exit(1);});"

CMD ["node", "dist/index.mjs"]
