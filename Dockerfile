# ===========================================
# KIRIILMAZLAR PANEL - RAILWAY OPTIMIZED DOCKERFILE
# Production-ready React application for Railway deployment
# ===========================================

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kirilmazlar -u 1001 -G nodejs

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership of the app directory
RUN chown -R kirilmazlar:nodejs /app

# Switch to non-root user
USER kirilmazlar

# Expose port (Railway will set PORT environment variable)
EXPOSE $PORT

# Health check (using wget which is available in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/ || exit 1

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "$PORT"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="1.0.0" \
  description="Kırılmazlar Panel - Production React Application for Railway" \
  org.opencontainers.image.source="https://github.com/Ofis-Net/kirilmazlar"
