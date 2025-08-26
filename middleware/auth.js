/**
 * JWT Authentication Middleware
 * Validates JWT tokens and sets user context
 */

const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Database connection (will be set from main server)
let pool;

const setPool = (dbPool) => {
  pool = dbPool;
};

/**
 * Authentication middleware
 * Validates JWT token and sets req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      `SELECT s.id, s.user_id, s.expires_at, s.active,
              u.id as user_id, u.username, u.email, u.full_name, u.role, u.active as user_active
       FROM user_sessions s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.active = true AND s.expires_at > NOW()`,
      [decoded.sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session' 
      });
    }

    const session = sessionResult.rows[0];
    
    // Check if user is active
    if (!session.user_active) {
      return res.status(401).json({ 
        success: false, 
        error: 'User account is deactivated' 
      });
    }

    // Update last activity
    await pool.query(
      'UPDATE user_sessions SET last_activity = NOW() WHERE id = $1',
      [session.id]
    );

    // Set user context
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email,
      full_name: session.full_name,
      role: session.role,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }

    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if token is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const sessionResult = await pool.query(
      `SELECT s.id, s.user_id, s.expires_at, s.active,
              u.id as user_id, u.username, u.email, u.full_name, u.role, u.active as user_active
       FROM user_sessions s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.active = true AND s.expires_at > NOW()`,
      [decoded.sessionId]
    );

    if (sessionResult.rows.length > 0 && sessionResult.rows[0].user_active) {
      const session = sessionResult.rows[0];
      
      // Update last activity
      await pool.query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE id = $1',
        [session.id]
      );

      req.user = {
        id: session.user_id,
        username: session.username,
        email: session.email,
        full_name: session.full_name,
        role: session.role,
        sessionId: decoded.sessionId
      };
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Role-based authorization middleware factory
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole('admin');

/**
 * Seller or Admin middleware
 */
const requireSellerOrAdmin = requireRole(['admin', 'seller']);

/**
 * Customer access middleware (customer can only access their own data)
 * @param {Function} getResourceUserId - Function to extract user ID from resource
 */
const requireOwnershipOrRole = (getResourceUserId, allowedRoles = ['admin', 'seller']) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Admin and sellers can access any resource
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // For customers, check ownership
    try {
      const resourceUserId = await getResourceUserId(req, pool);
      
      if (resourceUserId === req.user.id) {
        return next();
      }
      
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Authorization failed' 
      });
    }
  };
};

/**
 * Rate limiting helper
 * Tracks requests per user/IP
 */
const createRateLimiter = (windowMs, maxRequests, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ 
        success: false, 
        error: message || 'Too many requests' 
      });
    }
    
    userRequests.push(now);
    next();
  };
};

/**
 * Session cleanup utility
 * Removes expired sessions
 */
const cleanupExpiredSessions = async () => {
  try {
    if (!pool) return;
    
    const result = await pool.query(
      'DELETE FROM user_sessions WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL \'30 days\')'
    );
    
    if (result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired sessions`);
    }
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

/**
 * Validate session utility
 * Checks if a session is valid without middleware overhead
 */
const validateSession = async (token) => {
  try {
    if (!token || !pool) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const sessionResult = await pool.query(
      `SELECT s.id, s.user_id, s.expires_at, s.active,
              u.id as user_id, u.username, u.email, u.full_name, u.role, u.active as user_active
       FROM user_sessions s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.active = true AND s.expires_at > NOW()`,
      [decoded.sessionId]
    );

    if (sessionResult.rows.length === 0 || !sessionResult.rows[0].user_active) {
      return null;
    }

    const session = sessionResult.rows[0];
    
    return {
      id: session.user_id,
      username: session.username,
      email: session.email,
      full_name: session.full_name,
      role: session.role,
      sessionId: decoded.sessionId
    };
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSellerOrAdmin,
  requireOwnershipOrRole,
  createRateLimiter,
  cleanupExpiredSessions,
  validateSession,
  setPool
};