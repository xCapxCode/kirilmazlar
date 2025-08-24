# ===========================================
# KIRIILMAZLAR PANEL - RAILWAY OPTIMIZED DOCKERFILE
# Production-ready React application for Railway deployment
# ===========================================

# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kirilmazlar -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R kirilmazlar:nodejs /app

# Switch to non-root user
USER kirilmazlar

# Expose port (Railway will set PORT environment variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "$PORT"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="1.0.0" \
  description="Kırılmazlar Panel - Production React Application for Railway" \
  org.opencontainers.image.source="https://github.com/Ofis-Net/kirilmazlar"
