# Stage 1: Base dependencies with full build environment
FROM node:18-alpine AS deps
WORKDIR /app
# Install build dependencies (updated package names for Alpine 3.21)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \  
    make \
    g++ \
    gcc \
    musl-dev \
    mesa-dev \
    libxi-dev

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm install --force --workspaces --include=dev && \
    npm cache clean --force

# Stage 2: Client build
FROM node:18-alpine AS client-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install --force && \
    npm cache clean --force
COPY client/ .
RUN npm run build

# Stage 3: Server build
FROM node:18-alpine AS server-build
WORKDIR /app
# Minimal build tools for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    mesa-dev
COPY --from=deps /app/node_modules ./node_modules
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --force --include=dev && \
    npm cache clean --force
COPY server/ .
RUN npm run build

# Final production image
FROM node:18-alpine
RUN apk add --no-cache bash
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --production --force && \
    npm cache clean --force

# Copy built artifacts
COPY --from=client-build /app/client/dist ./client/dist
COPY --from=server-build /app/server ./server

# Copy and prepare init script
COPY docker-init.sh ./
RUN chmod +x docker-init.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:3001/health || exit 1

ENTRYPOINT ["/bin/bash", "/app/docker-init.sh"]