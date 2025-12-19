# ==========================================
# Shell App - Production Dockerfile
# Multi-stage build for optimal image size
# ==========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy all MFE configurations (needed for Module Federation)
COPY apps/shell/ ./apps/shell/
COPY apps/auth-mfe/ ./apps/auth-mfe/
COPY apps/chatbot-mfe/ ./apps/chatbot-mfe/
COPY apps/admin-mfe/ ./apps/admin-mfe/
COPY apps/profile-mfe/ ./apps/profile-mfe/

# Install dependencies
RUN npm ci && \
    npm cache clean --force

# Build all MFEs first (required for Module Federation)
RUN npx nx build auth-mfe --prod && \
    npx nx build chatbot-mfe --prod && \
    npx nx build admin-mfe --prod && \
    npx nx build profile-mfe --prod

# Build shell app
RUN npx nx build shell --prod

# Stage 2: Production with Nginx
FROM nginx:alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy Nginx configuration
COPY apps/shell/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist/apps/shell /usr/share/nginx/html/shell
COPY --from=builder /app/dist/apps/auth-mfe /usr/share/nginx/html/auth-mfe
COPY --from=builder /app/dist/apps/chatbot-mfe /usr/share/nginx/html/chatbot-mfe
COPY --from=builder /app/dist/apps/admin-mfe /usr/share/nginx/html/admin-mfe
COPY --from=builder /app/dist/apps/profile-mfe /usr/share/nginx/html/profile-mfe

# Create nginx user
RUN addgroup -g 101 -S nginx || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
