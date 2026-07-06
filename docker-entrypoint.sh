#!/bin/sh
# VibeDrop production entrypoint
# Applies Prisma migrations (if prisma CLI is available), then starts the server.

set -e

echo "[entrypoint] Starting VibeDrop..."

# Try prisma migrate — skip if prisma CLI not in standalone bundle
if command -v prisma >/dev/null 2>&1; then
  echo "[entrypoint] Applying database migrations..."
  prisma migrate deploy 2>/dev/null || prisma db push --accept-data-loss 2>/dev/null || echo "[entrypoint] Migration skipped — continuing"
elif [ -f ./node_modules/.bin/prisma ]; then
  echo "[entrypoint] Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy 2>/dev/null || ./node_modules/.bin/prisma db push --accept-data-loss 2>/dev/null || echo "[entrypoint] Migration skipped — continuing"
else
  echo "[entrypoint] Prisma CLI not found — skipping migrations (run prisma db push separately if schema changed)"
fi

echo "[entrypoint] Starting Next.js server..."
exec node server.js
