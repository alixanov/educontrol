#!/bin/sh
set -e

echo "=========================================================="
echo " Starting EduControl Autonomous Suite (24/7 Cloud Engine)"
echo "=========================================================="

# 1. Initialize SQLite Database & Seed Data
echo "==> Ensuring Database Schema..."
cd /app/server
npx prisma db push --skip-generate --accept-data-loss

echo "==> Seeding Demo Staff & Admin Account (admin@educontrol.com)..."
node dist/prisma/seed.js || npx ts-node prisma/seed.ts || echo "Seed completed or skipped"

# 2. Start Backend NestJS Server (Internal Port 5000)
echo "==> Launching EduControl Backend on port 5000..."
PORT=5000 node dist/src/main.js &
BACKEND_PID=$!

# Wait for backend to be healthy
echo "==> Waiting for Backend to be ready..."
for i in $(seq 1 30); do
  if nc -z 127.0.0.1 5000 2>/dev/null || (echo > /dev/tcp/127.0.0.1/5000) 2>/dev/null; then
    echo "==> Backend is online and ready!"
    break
  fi
  sleep 1
done

# 3. Start Frontend Next.js Server on Koyeb's public PORT
TARGET_PORT=${PORT:-8000}
echo "==> Launching EduControl Frontend on public port ${TARGET_PORT}..."
cd /app/client
export INTERNAL_API_URL="http://127.0.0.1:5000"
export PORT=${TARGET_PORT}
export NODE_ENV=production

exec npm start -- -p ${TARGET_PORT}
