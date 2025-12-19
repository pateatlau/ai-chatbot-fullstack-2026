# ==========================================
# Chatbot Service - Production Dockerfile
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
COPY apps/chatbot-service/package*.json ./apps/chatbot-service/
COPY apps/chatbot-service/tsconfig*.json ./apps/chatbot-service/
COPY apps/chatbot-service/project.json ./apps/chatbot-service/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY apps/chatbot-service/src ./apps/chatbot-service/src
COPY apps/chatbot-service/prisma ./apps/chatbot-service/prisma

# Generate Prisma Client
WORKDIR /app/apps/chatbot-service
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npx nx build chatbot-service --prod

# Stage 2: Production
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist/apps/chatbot-service ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/chatbot-service/prisma ./prisma

# Copy .env.example as reference
COPY --from=builder --chown=nodejs:nodejs /app/apps/chatbot-service/.env.example ./.env.example

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "main.js"]
