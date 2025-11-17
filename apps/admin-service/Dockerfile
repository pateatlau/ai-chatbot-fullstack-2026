# ==========================================
# Admin Service - Production Dockerfile
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
COPY apps/admin-service/package*.json ./apps/admin-service/
COPY apps/admin-service/tsconfig*.json ./apps/admin-service/
COPY apps/admin-service/project.json ./apps/admin-service/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY apps/admin-service/src ./apps/admin-service/src

# Build the application
RUN npx nx build admin-service --prod

# Stage 2: Production
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist/apps/admin-service ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy .env.example as reference
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin-service/.env.example ./.env.example

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "main.js"]
