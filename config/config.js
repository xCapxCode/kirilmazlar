// Configuration file for Kirilmazlar application

export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:bLtKirilmazlar2024@junction.proxy.rlwy.net:31543/railway',
    ssl: {
      rejectUnauthorized: false
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'kirilmazlar-secret-key-2024',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: 12
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Socket.IO configuration
  socket: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  },

  // Security configuration
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // limit each IP to 100 requests per windowMs
    sessionSecret: process.env.SESSION_SECRET || 'kirilmazlar-session-secret-2024'
  },

  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadPath: './public/uploads'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

export default config;