# ===========================================
# KIRIILMAZLAR PANEL - RAILWAY OPTIMIZED DOCKERFILE v5.1
# Ultra-reliable React application for Railway deployment
# Complete Ubuntu-based rebuild for cache invalidation
# FORCE REBUILD: 2025-01-26T14:35:00Z
# ===========================================

# Use Ubuntu-based Node.js image (COMPLETE ALPINE ELIMINATION)
FROM ubuntu:22.04 AS builder

# Install Node.js 20 and system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    git \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set npm configuration for better reliability
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies with maximum reliability
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --verbose --no-audit --no-fund --prefer-offline=false && \
    npm rebuild

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - use Node.js to serve both frontend and backend
FROM ubuntu:22.04 AS production

# Install Node.js 20 and system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and server files
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY routes ./routes
COPY middleware ./middleware
COPY websocket ./websocket
COPY database ./database
COPY src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Start the Node.js server
CMD ["node", "server.js"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="5.1.0" \
  description="Kırılmazlar Panel - Ultra-reliable Railway Deployment (UBUNTU-BASED)" \
  org.opencontainers.image.source="https://github.com/xCapxCode/kirilmazlar"
