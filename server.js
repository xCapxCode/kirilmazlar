/**
 * KIRIILMAZLAR PANEL - EXPRESS.JS BACKEND SERVER
 * Production-ready API server with PostgreSQL integration
 * Railway deployment optimized
 * 
 * @author GeniusCoder (Gen)
 * @version 1.0.0
 * @date 2025-01-31
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import socketManager from './websocket/socketManager.js';
import { initializeDatabase } from './src/utils/dbMigration.js';
import dotenv from 'dotenv';

// Environment configuration
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Import routes and middleware
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import customersRoutes from './routes/customers.js';
import ordersRoutes from './routes/orders.js';
import productsRoutes from './routes/products.js';
import authMiddleware from './middleware/auth.js';

// Set database pool for routes and middleware
authRoutes.setPool(pool);
usersRoutes.setPool(pool);
customersRoutes.setPool(pool);
ordersRoutes.setPool(pool);
productsRoutes.setPool(pool);
authMiddleware.setPool(pool);

// Initialize database with migrations
initializeDatabase().then((result) => {
  if (result.success) {
    console.log('✅ Database initialized successfully');
  } else {
    console.log(`⚠️  Running in ${result.mode} mode:`, result.error || 'No database connection');
  }
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kirilmazlar.railway.app', 'https://kirilmazlar-panel.railway.app']
    : ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'kirilmazlar-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes.router);
app.use('/api/users', usersRoutes.router);
app.use('/api/customers', customersRoutes.router);
app.use('/api/orders', ordersRoutes.router);
app.use('/api/products', productsRoutes.router);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Static files with aggressive cache busting
  app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: 0, // No cache for static files
    etag: false, // Disable etag
    lastModified: false, // Disable last-modified
    setHeaders: (res, path) => {
      // Force no-cache for all files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  
  app.get('*', (req, res) => {
    // Force no-cache for index.html
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Session cleanup interval (every hour)
setInterval(() => {
  authMiddleware.cleanupExpiredSessions();
  // Cleanup WebSocket connections
  socketManager.cleanupConnections();
}, 60 * 60 * 1000);

// Export socketManager for use in routes
app.set('socketManager', socketManager);

// Initialize WebSocket
socketManager.initialize(server);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kırılmazlar Panel Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server initialized`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Static files: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled (API only)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

export default app;