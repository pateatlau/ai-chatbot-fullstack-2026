# ==========================================
# Auth Service - Production Dockerfile
# Multi-stage build for optimal image size
# ==========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace configuration
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY apps/auth-service/tsconfig*.json ./apps/auth-service/
COPY apps/auth-service/project.json ./apps/auth-service/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY apps/auth-service/src ./apps/auth-service/src
COPY apps/auth-service/prisma ./apps/auth-service/prisma

# Generate Prisma Client
WORKDIR /app/apps/auth-service
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npx nx build auth-service --prod

# Stage 2: Production
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist/apps/auth-service ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/auth-service/prisma ./prisma

# Copy .env.example as reference (actual .env should be provided at runtime)
COPY --from=builder --chown=nodejs:nodejs /app/apps/auth-service/.env.example ./.env.example

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "main.js"]
