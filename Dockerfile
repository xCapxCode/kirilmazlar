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

# Production stage - use nginx for reliable static serving
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built application
COPY --from=builder /app/dist .

# Create nginx configuration template
RUN echo 'server {' > /etc/nginx/conf.d/default.conf.template && \
    echo '    listen ${PORT};' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    ' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    # Proper MIME types' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location ~* \.css$ {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Content-Type text/css;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    ' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location ~* \.js$ {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Content-Type application/javascript;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    ' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location ~* \.svg$ {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Content-Type image/svg+xml;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    ' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    # SPA fallback' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf.template && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf.template && \
    echo '    }' >> /etc/nginx/conf.d/default.conf.template && \
    echo '}' >> /etc/nginx/conf.d/default.conf.template

# Set default port
ENV PORT=80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Start script that substitutes PORT and starts nginx
CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

# Metadata
LABEL maintainer="GeniusCoder (Gen)" \
  version="5.1.0" \
  description="Kırılmazlar Panel - Ultra-reliable Railway Deployment (UBUNTU-BASED)" \
  org.opencontainers.image.source="https://github.com/xCapxCode/kirilmazlar"
