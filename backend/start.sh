#!/bin/sh
set -e

# Ensure the volume mount directory exists
mkdir -p /app/prisma

# Fallback to local SQLite database path inside the persistent volume if not configured
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/dev.db"
fi

# Sync schema and migrations from the build staging folder to the volume mount
echo "Syncing Prisma files to volume..."
cp -r /app/prisma-src/schema.prisma /app/prisma/schema.prisma
if [ -d "/app/prisma-src/migrations" ]; then
  cp -r /app/prisma-src/migrations /app/prisma/
fi

# Run migrations
npx prisma migrate deploy

# Run seed script (idempotent - safe to run on startup)
echo "Running database seed script..."
npm run seed

# Start the server
exec node dist/server.js
