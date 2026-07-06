#!/bin/sh
# VibeDrop app container entrypoint
# Applies Prisma migrations, then starts the Next.js server.

set -e

echo "[entrypoint] Applying database migrations..."
npx prisma migrate deploy || {
  echo "[entrypoint] prisma migrate deploy failed — falling back to db push"
  npx prisma db push --accept-data-loss
}

echo "[entrypoint] Starting Next.js server..."
exec "$@"
