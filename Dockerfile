# ===========================================
# KIRIILMAZLAR PANEL - RAILWAY OPTIMIZED DOCKERFILE v4.0
# Ultra-reliable React application for Railway deployment
# Complete cache invalidation and Alpine elimination
# ===========================================

# Use Node.js LTS Debian-based image (NO ALPINE)
FROM node:18-bullseye-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    curl \
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
    npm install --verbose --no-audit --no-fund --prefer-offline=false

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - use Debian-based image (NO ALPINE)
FROM node:18-bullseye-slim AS production

# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.1

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs kirilmazlar

# Copy built application
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R kirilmazlar:nodejs /app

# Switch to non-root user
USER kirilmazlar

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "$PORT"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="4.0.0" \
  description="Kırılmazlar Panel - Ultra-reliable Railway Deployment (NO ALPINE)" \
  org.opencontainers.image.source="https://github.com/xCapxCode/kirilmazlar"
