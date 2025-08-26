/**
 * Customers Routes
 * Customer management endpoints
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireRole, requireAdmin, requireSellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Database connection will be set from server.js
let pool;

// Function to set database pool
const setPool = (dbPool) => {
  pool = dbPool;
};

// Get all customers
router.get('/', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { status, city, page = 1, limit = 50, search, sort = 'created_at', order = 'DESC' } = req.query;
    
    let query = `
      SELECT c.id, c.user_id, c.phone, c.address, c.city, c.postal_code, c.status,
             c.total_orders, c.total_spent, c.loyalty_points, c.created_at, c.updated_at,
             u.username, u.email, u.full_name, u.active as user_active, u.last_login
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    // Add filters
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    
    if (city) {
      params.push(city);
      query += ` AND c.city = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.username ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'total_orders', 'total_spent', 'username', 'email', 'full_name'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    if (sortField.includes('username') || sortField.includes('email') || sortField.includes('full_name')) {
      query += ` ORDER BY u.${sortField} ${sortOrder}`;
    } else {
      query += ` ORDER BY c.${sortField} ${sortOrder}`;
    }
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM customers c INNER JOIN users u ON c.user_id = u.id WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countParams.push(status);
      countQuery += ` AND c.status = $${countParams.length}`;
    }
    
    if (city) {
      countParams.push(city);
      countQuery += ` AND c.city = $${countParams.length}`;
    }
    
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (u.username ILIKE $${countParams.length} OR u.email ILIKE $${countParams.length} OR u.full_name ILIKE $${countParams.length} OR c.phone ILIKE $${countParams.length})`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      customers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions - customers can only view their own data
    if (req.user.role === 'customer') {
      const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1 AND user_id = $2', [id, req.user.id]);
      if (customerCheck.rows.length === 0) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }
    
    const query = `
      SELECT c.id, c.user_id, c.phone, c.address, c.city, c.postal_code, c.status,
             c.total_orders, c.total_spent, c.loyalty_points, c.created_at, c.updated_at,
             u.username, u.email, u.full_name, u.active as user_active, u.last_login
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    // Get recent orders for this customer
    const ordersQuery = `
      SELECT id, order_number, total_amount, status, created_at
      FROM orders 
      WHERE customer_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const ordersResult = await pool.query(ordersQuery, [id]);
    
    res.json({
      success: true,
      customer: {
        ...result.rows[0],
        recent_orders: ordersResult.rows
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create new customer (admin/seller only)
router.post('/', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { username, password, email, full_name, phone, address, city, postal_code } = req.body;

    // Validation
    if (!username || !password || !email || !phone) {
      return res.status(400).json({ 
        success: false,
        error: 'Username, password, email, and phone are required' 
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
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (username, password, email, full_name, role, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'customer', true, NOW(), NOW())
        RETURNING id, username, email, full_name, role, active, created_at
      `;

      const userResult = await client.query(insertUserQuery, [
        username,
        hashedPassword,
        email,
        full_name
      ]);

      const newUser = userResult.rows[0];

      // Insert customer record
      const insertCustomerQuery = `
        INSERT INTO customers (user_id, phone, address, city, postal_code, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
        RETURNING *
      `;

      const customerResult = await client.query(insertCustomerQuery, [
        newUser.id,
        phone,
        address || null,
        city || null,
        postal_code || null
      ]);

      await client.query('COMMIT');

      const newCustomer = {
        ...customerResult.rows[0],
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        user_active: newUser.active
      };

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.broadcastNotification({
          type: 'customer-created',
          data: newCustomer,
          message: `Yeni müşteri eklendi: ${newCustomer.full_name}`
        });
      }

      res.status(201).json({
        success: true,
        customer: newCustomer
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, city, postal_code, status, full_name, email } = req.body;
    
    // Check permissions
    if (req.user.role === 'customer') {
      const customerCheck = await pool.query('SELECT user_id FROM customers WHERE id = $1', [id]);
      if (customerCheck.rows.length === 0 || customerCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      // Customers cannot change their status
      if (status !== undefined) {
        return res.status(403).json({ success: false, error: 'Cannot change status' });
      }
    }

    // Check if customer exists
    const existingCustomer = await pool.query(
      'SELECT c.*, u.id as user_id FROM customers c INNER JOIN users u ON c.user_id = u.id WHERE c.id = $1',
      [id]
    );
    
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const customer = existingCustomer.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update customer data
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
      if (city !== undefined) {
        customerUpdateFields.push(`city = $${++customerParamCount}`);
        customerUpdateValues.push(city);
      }
      if (postal_code !== undefined) {
        customerUpdateFields.push(`postal_code = $${++customerParamCount}`);
        customerUpdateValues.push(postal_code);
      }
      if (status !== undefined && req.user.role !== 'customer') {
        customerUpdateFields.push(`status = $${++customerParamCount}`);
        customerUpdateValues.push(status);
      }

      if (customerUpdateFields.length > 0) {
        customerUpdateFields.push(`updated_at = NOW()`);
        customerUpdateValues.push(id);
        
        const updateCustomerQuery = `
          UPDATE customers SET ${customerUpdateFields.join(', ')} 
          WHERE id = $${++customerParamCount}
        `;
        
        await client.query(updateCustomerQuery, customerUpdateValues);
      }

      // Update user data if provided
      if (full_name !== undefined || email !== undefined) {
        const userUpdateFields = [];
        const userUpdateValues = [];
        let userParamCount = 0;

        if (full_name !== undefined) {
          userUpdateFields.push(`full_name = $${++userParamCount}`);
          userUpdateValues.push(full_name);
        }
        if (email !== undefined) {
          // Check for duplicate email
          const duplicateEmail = await client.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, customer.user_id]
          );
          
          if (duplicateEmail.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
              success: false,
              error: 'Email already exists' 
            });
          }
          
          userUpdateFields.push(`email = $${++userParamCount}`);
          userUpdateValues.push(email);
        }

        if (userUpdateFields.length > 0) {
          userUpdateFields.push(`updated_at = NOW()`);
          userUpdateValues.push(customer.user_id);
          
          const updateUserQuery = `
            UPDATE users SET ${userUpdateFields.join(', ')} 
            WHERE id = $${++userParamCount}
          `;
          
          await client.query(updateUserQuery, userUpdateValues);
        }
      }

      await client.query('COMMIT');

      // Get updated customer data
      const updatedCustomer = await pool.query(`
        SELECT c.id, c.user_id, c.phone, c.address, c.city, c.postal_code, c.status,
               c.total_orders, c.total_spent, c.loyalty_points, c.created_at, c.updated_at,
               u.username, u.email, u.full_name, u.active as user_active
        FROM customers c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `, [id]);

      const customerData = updatedCustomer.rows[0];

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.broadcastNotification({
          type: 'customer-updated',
          data: customerData,
          message: `Müşteri güncellendi: ${customerData.full_name}`
        });
      }

      res.json({
        success: true,
        customer: customerData
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete customer (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customerResult = await pool.query(
      'SELECT c.user_id FROM customers c WHERE c.id = $1',
      [id]
    );
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const userId = customerResult.rows[0].user_id;

    // Check if customer has orders
    const ordersCheck = await pool.query('SELECT COUNT(*) FROM orders WHERE customer_id = $1', [id]);
    const orderCount = parseInt(ordersCheck.rows[0].count);

    if (orderCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete customer with ${orderCount} orders. Consider deactivating instead.` 
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete customer record
      await client.query('DELETE FROM customers WHERE id = $1', [id]);
      
      // Delete user sessions
      await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
      
      // Delete user record
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get customer statistics
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(*) FILTER (WHERE status = 'active') as active_customers,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_customers,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_customers_30d,
        ROUND(AVG(total_spent), 2) as avg_spent,
        ROUND(AVG(total_orders), 2) as avg_orders,
        SUM(total_spent) as total_revenue,
        SUM(total_orders) as total_orders_count
      FROM customers
    `);

    // Get top customers by spending
    const topCustomers = await pool.query(`
      SELECT c.id, u.full_name, u.email, c.total_spent, c.total_orders
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.status = 'active'
      ORDER BY c.total_spent DESC
      LIMIT 10
    `);

    // Get customers by city
    const customersByCity = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM customers
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        overview: stats.rows[0],
        top_customers: topCustomers.rows,
        customers_by_city: customersByCity.rows
      }
    });

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add loyalty points (admin/seller only)
router.post('/:id/loyalty', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    if (!points || typeof points !== 'number') {
      return res.status(400).json({ success: false, error: 'Valid points amount is required' });
    }

    // Check if customer exists
    const customerCheck = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Update loyalty points
    const result = await pool.query(
      'UPDATE customers SET loyalty_points = loyalty_points + $1, updated_at = NOW() WHERE id = $2 RETURNING loyalty_points',
      [points, id]
    );

    res.json({
      success: true,
      message: `${points > 0 ? 'Added' : 'Deducted'} ${Math.abs(points)} loyalty points`,
      new_balance: result.rows[0].loyalty_points,
      reason: reason || 'Manual adjustment'
    });

  } catch (error) {
    console.error('Update loyalty points error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default { router, setPool };