#!/bin/sh
set -e

# Ensure the volume mount directory exists
mkdir -p /app/prisma

# Sync schema and migrations from the build staging folder to the volume mount
echo "Syncing Prisma files to volume..."
cp -r /app/prisma-src/schema.prisma /app/prisma/schema.prisma
if [ -d "/app/prisma-src/migrations" ]; then
  cp -r /app/prisma-src/migrations /app/prisma/
fi

# Run migrations
npx prisma migrate deploy

# Start the server
exec node dist/server.js
