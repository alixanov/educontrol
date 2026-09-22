# ==============================================================================
# EduControl Unified Dockerfile for Koyeb (Single Cloud Host 24/7)
# Runs Next.js 14 Frontend + NestJS Backend + SQLite Database in a single container
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install required build packages (openssl for Prisma)
RUN apk add --no-cache openssl libc6-compat

# -------------------------------------------------------------
# 1. Build Backend (NestJS + Prisma)
# -------------------------------------------------------------
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY server ./
RUN npm run build

# -------------------------------------------------------------
# 2. Build Frontend (Next.js 14)
# -------------------------------------------------------------
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
# Build Next.js with production optimization
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# -------------------------------------------------------------
# 3. Lean Production Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma and networking
RUN apk add --no-cache openssl netcat-openbsd

ENV NODE_ENV=production
ENV PORT=8000
ENV DATABASE_URL="file:/app/server/prisma/dev.db"
ENV JWT_SECRET="educontrol-koyeb-production-secure-key-2026"
ENV CORS_ORIGIN="*"

# Copy backend files
WORKDIR /app/server
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/dist ./dist

# Copy frontend files
WORKDIR /app/client
COPY --from=builder /app/client/package*.json ./
COPY --from=builder /app/client/node_modules ./node_modules
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/next.config.mjs ./

# Copy entrypoint script
WORKDIR /app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Expose default HTTP port for Koyeb
EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
