/**
 * Users Routes
 * User management endpoints
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireRole, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Database connection will be set from server.js
let pool;

// Function to set database pool
const setPool = (dbPool) => {
  pool = dbPool;
};



// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, active, page = 1, limit = 50, search } = req.query;
    
    let query = `
      SELECT u.id, u.username, u.email, u.full_name, u.role, u.active, 
             u.last_login, u.created_at, u.updated_at,
             c.id as customer_id, c.phone, c.total_orders, c.total_spent
      FROM users u 
      LEFT JOIN customers c ON u.id = c.user_id 
      WHERE 1=1
    `;
    const params = [];
    
    // Add filters
    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }
    
    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND u.active = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.username ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`;
    }
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    query += ` ORDER BY u.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM users u WHERE 1=1';
    const countParams = [];
    
    if (role) {
      countParams.push(role);
      countQuery += ` AND u.role = $${countParams.length}`;
    }
    
    if (active !== undefined) {
      countParams.push(active === 'true');
      countQuery += ` AND u.active = $${countParams.length}`;
    }
    
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (u.username ILIKE $${countParams.length} OR u.email ILIKE $${countParams.length} OR u.full_name ILIKE $${countParams.length})`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const query = `
      SELECT u.id, u.username, u.email, u.full_name, u.role, u.active, 
             u.last_login, u.created_at, u.updated_at,
             c.id as customer_id, c.phone, c.address, c.city, c.postal_code,
             c.total_orders, c.total_spent, c.loyalty_points
      FROM users u 
      LEFT JOIN customers c ON u.id = c.user_id 
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { username, password, email, full_name, role = 'customer', phone, address } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Username, password, and email are required' 
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
      if (role === 'customer') {
        await client.query(
          `INSERT INTO customers (user_id, phone, address, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'active', NOW(), NOW())`,
          [newUser.id, phone || null, address || null]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        user: newUser
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, phone, address, active } = req.body;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    // Non-admin users cannot change active status
    if (req.user.role !== 'admin' && active !== undefined) {
      return res.status(403).json({ success: false, error: 'Cannot change active status' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check for duplicate username/email (excluding current user)
    if (username || email) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username || '', email || '', id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({ 
          success: false,
          error: 'Username or email already exists' 
        });
      }
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update user
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      if (username) {
        updateFields.push(`username = $${++paramCount}`);
        updateValues.push(username);
      }
      if (email) {
        updateFields.push(`email = $${++paramCount}`);
        updateValues.push(email);
      }
      if (full_name !== undefined) {
        updateFields.push(`full_name = $${++paramCount}`);
        updateValues.push(full_name);
      }
      if (active !== undefined && req.user.role === 'admin') {
        updateFields.push(`active = $${++paramCount}`);
        updateValues.push(active);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(id);
        
        const updateUserQuery = `
          UPDATE users SET ${updateFields.join(', ')} 
          WHERE id = $${++paramCount}
          RETURNING id, username, email, full_name, role, active, updated_at
        `;
        
        const userResult = await client.query(updateUserQuery, updateValues);
        
        // Update customer data if provided
        if ((phone !== undefined || address !== undefined) && existingUser.rows[0].role === 'customer') {
          const customerUpdateFields = [];
          const customerUpdateValues = [];
          let customerParamCount = 0;

          if (phone !== undefined) {
            customerUpdateFields.push(`phone = $${++customerParamCount}`);
            customerUpdateValues.push(phone);
          }
          if (address !== undefined) {
            customerUpdateFields.push(`address = $${++customerParamCount}`);
            customerUpdateValues.push(address);
          }

          if (customerUpdateFields.length > 0) {
            customerUpdateFields.push(`updated_at = NOW()`);
            customerUpdateValues.push(id);
            
            const updateCustomerQuery = `
              UPDATE customers SET ${customerUpdateFields.join(', ')} 
              WHERE user_id = $${++customerParamCount}
            `;
            
            await client.query(updateCustomerQuery, customerUpdateValues);
          }
        }

        await client.query('COMMIT');

        res.json({
          success: true,
          user: userResult.rows[0]
        });
      } else {
        await client.query('ROLLBACK');
        res.json({
          success: true,
          message: 'No changes made'
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    if (!newPassword) {
      return res.status(400).json({ success: false, error: 'New password is required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    // Get current user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password (unless admin changing someone else's password)
    if (req.user.role !== 'admin' || req.user.id === id) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );

    // Invalidate all sessions for this user
    await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [id]);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cannot delete self
    if (req.user.id === id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete user sessions
      await client.query('DELETE FROM user_sessions WHERE user_id = $1', [id]);
      
      // Delete customer record if exists
      await client.query('DELETE FROM customers WHERE user_id = $1', [id]);
      
      // Delete user
      await client.query('DELETE FROM users WHERE id = $1', [id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE active = true) as active_users,
        COUNT(*) FILTER (WHERE role = 'customer') as customers,
        COUNT(*) FILTER (WHERE role = 'seller') as sellers,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
        COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL '7 days') as active_users_7d
      FROM users
    `);

    res.json({
      success: true,
      stats: stats.rows[0]
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = { router, setPool };