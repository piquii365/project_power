# Multi-stage build for ZHD AI Onboarding System
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
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

# Install runtime dependencies
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype

WORKDIR /app

# Copy built applications
COPY --from=client-build /app/client/dist ./client/dist
COPY --from=server-build /app/server ./server
COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./

# Create models directory
RUN mkdir -p ./models

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/scripts/health-check.js

# Start application
CMD ["npm", "start"]