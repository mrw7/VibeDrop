# ─────────────────────────────────────────────────────────────
# VibeDrop Multi-Stage Dockerfile
#
# Builds two production images from one source:
#   - app-runner:    slim Next.js standalone server (~200MB)
#   - worker-runner: build-farm image with tsx + git + npm
#
# Usage (see docker-compose.yml and docker-compose.prod.yml):
#   docker compose -f docker-compose.prod.yml build
#   docker compose -f docker-compose.prod.yml up -d
# ─────────────────────────────────────────────────────────────

# ── Stage 1: dependencies ────────────────────────────────────
# Full install (incl. devDeps) + cached Prisma client generation.
# prisma generate runs here so binaries download once and are
# cached until package.json/prisma schema changes.
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Prisma schema needed for generate
COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 2: builder ─────────────────────────────────────────
# Next.js standalone build. Prisma client is already generated
# in the deps stage.
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js standalone build
# Dummy env values for build-time module evaluation (env.ts etc.)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    NEXTAUTH_URL="http://localhost:3000" \
    NEXTAUTH_SECRET="build-time-placeholder-32chars!!" \
    GITHUB_CLIENT_ID="build" \
    GITHUB_CLIENT_SECRET="build" \
    OSS_REGION="oss-build" \
    OSS_BUCKET="build" \
    OSS_ACCESS_KEY_ID="build" \
    OSS_ACCESS_KEY_SECRET="build" \
    ENCRYPTION_KEY="build-time-placeholder-key-32-chars!!"

RUN npm run build

# ── Stage 3: app-runner (production Next.js server) ──────────
# Slim image using Next.js standalone output.
FROM node:20-alpine AS app-runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXTAUTH_URL="http://localhost:3000"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema + generated client for runtime migrate
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Entrypoint that applies migrations before starting
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]

# ── Stage 4: worker-runner (build farm) ──────────────────────
# Runs the build-worker. Needs tsx (now a runtime dep), git, npm
# to clone and build user-supplied projects.
FROM node:20-alpine AS worker-runner
WORKDIR /app

ENV NODE_ENV=production

# Build tools for cloning + building user projects
# (Expo/Flutter/Android SDKs NOT included — see docs/deployment.md)
RUN apk add --no-cache git python3 make g++ bash

# Install all deps (tsx is now in dependencies)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

# Prisma client (pre-generated in deps, minimal copy for worker)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Worker source + lib
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/tsconfig.json ./tsconfig.json

CMD ["npx", "tsx", "scripts/build-worker.ts"]
