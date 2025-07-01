# Multi-stage build for ZHD AI Onboarding System
FROM node:18-alpine AS base

# Install system dependencies including Python for AI training
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Build stage for client
FROM base AS client-build
WORKDIR /app/client
COPY client/ .
RUN npm ci
RUN npm run build

# Build stage for server
FROM base AS server-build
WORKDIR /app/server
COPY server/ .
RUN npm ci

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies including Python for AI models
RUN apk add --no-cache \
    python3 \
    py3-pip \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype \
    curl \
    bash

WORKDIR /app

# Copy built applications
COPY --from=client-build /app/client/dist ./client/dist
COPY --from=server-build /app/server ./server
COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./

# Copy scripts and models directories
COPY scripts/ ./scripts/
COPY server/scripts/ ./server/scripts/

# Create necessary directories
RUN mkdir -p ./models ./logs

# Copy the initialization script
COPY docker-init.sh ./docker-init.sh
RUN chmod +x ./docker-init.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Use initialization script as entrypoint
ENTRYPOINT ["./docker-init.sh"]