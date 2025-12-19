# Multi-stage build for GraphQL Gateway

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./

# Copy source
COPY apps/graphql-gateway apps/graphql-gateway

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build graphql-gateway

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist/apps/graphql-gateway ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

# Start application
CMD ["node", "dist/main.js"]
