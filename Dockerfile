# ===========================================
# KIRIILMAZLAR PANEL - MULTI-STAGE DOCKERFILE
# Production-ready React application containerization
# ===========================================

# Stage 1: Build Environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Stage 2: Production Environment with Nginx
FROM nginx:alpine AS production

# Install security updates and required tools
RUN apk update && apk upgrade && apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S kirilmazlar -u 1001

# Copy custom nginx configuration if exists, otherwise create basic config
RUN mkdir -p /etc/nginx/conf.d
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="1.0.0" \
  description="Kırılmazlar Panel - Production React Application" \
  org.opencontainers.image.source="https://github.com/kirilmazlar/panel"
