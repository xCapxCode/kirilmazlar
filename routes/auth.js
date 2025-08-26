/**
 * Authentication Routes
 * JWT-based authentication system
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

const router = express.Router();

// Database connection will be set from server.js
let pool;

// Function to set database pool
const setPool = (dbPool) => {
  pool = dbPool;
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || 'kirilmazlar-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Helper function to validate password strength
const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
    }

    // Get user from database
    const userQuery = `
      SELECT u.*, c.id as customer_id, c.phone, c.address 
      FROM users u 
      LEFT JOIN customers c ON u.id = c.user_id 
      WHERE u.username = $1 AND u.active = true
    `;
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user);

    // Store session in database
    await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at) 
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')`,
      [
        user.id,
        jwt.sign({ token }, process.env.JWT_SECRET || 'kirilmazlar-secret-key'),
        req.ip,
        req.get('User-Agent') || 'Unknown'
      ]
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        customer_id: user.customer_id,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, full_name, phone, address, role = 'customer' } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Username, password, and email are required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.message 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (username, password, email, full_name, role, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, username, email, full_name, role, active, created_at
      `;

      const userResult = await client.query(insertUserQuery, [
        username,
        hashedPassword,
        email,
        full_name,
        role
      ]);

      const newUser = userResult.rows[0];

      // If role is customer, create customer record
      let customerData = null;
      if (role === 'customer') {
        const insertCustomerQuery = `
          INSERT INTO customers (user_id, phone, address, status, created_at, updated_at)
          VALUES ($1, $2, $3, 'active', NOW(), NOW())
          RETURNING id, phone, address
        `;

        const customerResult = await client.query(insertCustomerQuery, [
          newUser.id,
          phone || null,
          address || null
        ]);

        customerData = customerResult.rows[0];
      }

      await client.query('COMMIT');

      // Generate JWT token
      const token = generateToken(newUser);

      // Store session in database
      await pool.query(
        `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at) 
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')`,
        [
          newUser.id,
          jwt.sign({ token }, process.env.JWT_SECRET || 'kirilmazlar-secret-key'),
          req.ip,
          req.get('User-Agent') || 'Unknown'
        ]
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          ...newUser,
          customer_id: customerData?.id,
          phone: customerData?.phone,
          address: customerData?.address
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Token validation endpoint
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kirilmazlar-secret-key');

    // Check if session exists and is valid
    const sessionQuery = `
      SELECT s.*, u.username, u.email, u.role, u.active 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 AND s.expires_at > NOW() AND u.active = true
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    const sessionResult = await pool.query(sessionQuery, [decoded.id]);

    if (sessionResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired session' 
      });
    }

    const session = sessionResult.rows[0];

    res.json({
      success: true,
      user: {
        id: decoded.id,
        username: session.username,
        email: session.email,
        role: session.role,
        active: session.active
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(403).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kirilmazlar-secret-key');
      
      // Remove session from database
      await pool.query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [decoded.id]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // Verify current token (even if expired)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'kirilmazlar-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
      } else {
        throw error;
      }
    }

    // Get user data
    const userQuery = 'SELECT * FROM users WHERE id = $1 AND active = true';
    const userResult = await pool.query(userQuery, [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'User not found or inactive' 
      });
    }

    const user = userResult.rows[0];

    // Generate new token
    const newToken = generateToken(user);

    // Update session in database
    await pool.query(
      `UPDATE user_sessions 
       SET token_hash = $1, expires_at = NOW() + INTERVAL '24 hours', created_at = NOW()
       WHERE user_id = $2`,
      [
        jwt.sign({ token: newToken }, process.env.JWT_SECRET || 'kirilmazlar-secret-key'),
        user.id
      ]
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token: newToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
});

export default { router, setPool };