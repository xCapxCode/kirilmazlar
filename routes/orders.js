/**
 * Orders Routes
 * Order management endpoints
 */

const express = require('express');
const { authenticateToken, requireRole, requireSellerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Database connection will be set from server.js
let pool;

// Function to set database pool
const setPool = (dbPool) => {
  pool = dbPool;
};

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      customer_id, 
      date_from, 
      date_to, 
      page = 1, 
      limit = 50, 
      search, 
      sort = 'created_at', 
      order = 'DESC' 
    } = req.query;
    
    let query = `
      SELECT o.id, o.order_number, o.customer_id, o.total_amount, o.status, 
             o.payment_method, o.payment_status, o.shipping_address, o.notes,
             o.created_at, o.updated_at,
             c.phone as customer_phone,
             u.full_name as customer_name, u.email as customer_email,
             COUNT(oi.id) as item_count
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];
    
    // Customer role can only see their own orders
    if (req.user.role === 'customer') {
      const customerResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (customerResult.rows.length > 0) {
        params.push(customerResult.rows[0].id);
        query += ` AND o.customer_id = $${params.length}`;
      } else {
        return res.json({ success: true, orders: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } });
      }
    }
    
    // Add filters
    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }
    
    if (customer_id && req.user.role !== 'customer') {
      params.push(customer_id);
      query += ` AND o.customer_id = $${params.length}`;
    }
    
    if (date_from) {
      params.push(date_from);
      query += ` AND o.created_at >= $${params.length}`;
    }
    
    if (date_to) {
      params.push(date_to + ' 23:59:59');
      query += ` AND o.created_at <= $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (o.order_number ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    
    // Group by for COUNT
    query += ` GROUP BY o.id, o.order_number, o.customer_id, o.total_amount, o.status, 
               o.payment_method, o.payment_status, o.shipping_address, o.notes,
               o.created_at, o.updated_at, c.phone, u.full_name, u.email`;
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'total_amount', 'order_number', 'status'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY o.${sortField} ${sortOrder}`;
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT o.id) 
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      INNER JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    
    // Apply same filters for count
    if (req.user.role === 'customer') {
      const customerResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (customerResult.rows.length > 0) {
        countParams.push(customerResult.rows[0].id);
        countQuery += ` AND o.customer_id = $${countParams.length}`;
      }
    }
    
    if (status) {
      countParams.push(status);
      countQuery += ` AND o.status = $${countParams.length}`;
    }
    
    if (customer_id && req.user.role !== 'customer') {
      countParams.push(customer_id);
      countQuery += ` AND o.customer_id = $${countParams.length}`;
    }
    
    if (date_from) {
      countParams.push(date_from);
      countQuery += ` AND o.created_at >= $${countParams.length}`;
    }
    
    if (date_to) {
      countParams.push(date_to + ' 23:59:59');
      countQuery += ` AND o.created_at <= $${countParams.length}`;
    }
    
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (o.order_number ILIKE $${countParams.length} OR u.full_name ILIKE $${countParams.length} OR u.email ILIKE $${countParams.length})`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT o.id, o.order_number, o.customer_id, o.total_amount, o.status, 
             o.payment_method, o.payment_status, o.shipping_address, o.notes,
             o.created_at, o.updated_at,
             c.phone as customer_phone, c.address as customer_address,
             c.city as customer_city, c.postal_code as customer_postal_code,
             u.full_name as customer_name, u.email as customer_email
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      INNER JOIN users u ON c.user_id = u.id
      WHERE o.id = $1
    `;
    
    // Customer role can only see their own orders
    if (req.user.role === 'customer') {
      const customerResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (customerResult.rows.length > 0) {
        query += ` AND o.customer_id = $2`;
        var result = await pool.query(query, [id, customerResult.rows[0].id]);
      } else {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
    } else {
      var result = await pool.query(query, [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const order = result.rows[0];
    
    // Get order items
    const itemsQuery = `
      SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, oi.total_price,
             p.name as product_name, p.sku as product_sku, p.image_url as product_image
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `;
    
    const itemsResult = await pool.query(itemsQuery, [id]);
    
    // Get order status history
    const historyQuery = `
      SELECT id, status, notes, created_at, created_by
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at DESC
    `;
    
    const historyResult = await pool.query(historyQuery, [id]);
    
    res.json({
      success: true,
      order: {
        ...order,
        items: itemsResult.rows,
        status_history: historyResult.rows
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer_id, items, payment_method, shipping_address, notes } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Order items are required' 
      });
    }

    // For customer role, use their own customer_id
    let finalCustomerId = customer_id;
    if (req.user.role === 'customer') {
      const customerResult = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
      if (customerResult.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Customer profile not found' });
      }
      finalCustomerId = customerResult.rows[0].id;
    } else if (!customer_id) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }

    // Validate customer exists
    const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [finalCustomerId]);
    if (customerCheck.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Customer not found' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Each item must have product_id and valid quantity' 
        });
      }
      
      // Get product details
      const productResult = await pool.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND active = true',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: `Product with ID ${item.product_id} not found or inactive` 
        });
      }
      
      const product = productResult.rows[0];
      
      // Check stock
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          success: false,
          error: `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}` 
        });
      }
      
      const unitPrice = parseFloat(product.price);
      const totalPrice = unitPrice * item.quantity;
      
      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });
      
      totalAmount += totalPrice;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const insertOrderQuery = `
        INSERT INTO orders (customer_id, total_amount, status, payment_method, payment_status, 
                           shipping_address, notes, created_at, updated_at)
        VALUES ($1, $2, 'pending', $3, 'pending', $4, $5, NOW(), NOW())
        RETURNING *
      `;

      const orderResult = await client.query(insertOrderQuery, [
        finalCustomerId,
        totalAmount,
        payment_method || 'cash',
        shipping_address,
        notes
      ]);

      const newOrder = orderResult.rows[0];

      // Insert order items and update stock
      for (const item of validatedItems) {
        // Insert order item
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [newOrder.id, item.product_id, item.quantity, item.unit_price, item.total_price]
        );
        
        // Update product stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.product_id]
        );
        
        // Record inventory movement
        await client.query(
          `INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, created_at)
           VALUES ($1, 'out', $2, 'order', $3, 'Order sale', NOW())`,
          [item.product_id, item.quantity, newOrder.id]
        );
      }

      // Insert initial status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, 'pending', 'Order created', $2, NOW())`,
        [newOrder.id, req.user.id]
      );

      await client.query('COMMIT');

      // Get complete order data
      const completeOrder = await pool.query(`
        SELECT o.*, c.phone as customer_phone, u.full_name as customer_name, u.email as customer_email
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE o.id = $1
      `, [newOrder.id]);

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.broadcastOrderUpdate(completeOrder.rows[0], 'order-created');
      }

      res.status(201).json({
        success: true,
        order: completeOrder.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid status is required. Allowed: ' + allowedStatuses.join(', ') 
      });
    }

    // Check if order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    
    // Prevent status regression (optional business rule)
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    
    if (status !== 'cancelled' && currentIndex >= 0 && newIndex >= 0 && newIndex < currentIndex) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot move order to a previous status' 
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, id]
      );

      // Insert status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [id, status, notes || `Status changed to ${status}`, req.user.id]
      );

      // If cancelled, restore stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        const orderItems = await client.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [id]
        );
        
        for (const item of orderItems.rows) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = NOW() WHERE id = $2',
            [item.quantity, item.product_id]
          );
          
          // Record inventory movement
          await client.query(
            `INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, created_at)
             VALUES ($1, 'in', $2, 'order_cancel', $3, 'Order cancellation - stock restored', NOW())`,
            [item.product_id, item.quantity, id]
          );
        }
      }

      await client.query('COMMIT');

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        const updatedOrder = await pool.query(`
          SELECT o.*, c.phone as customer_phone, u.full_name as customer_name, u.email as customer_email
          FROM orders o
          INNER JOIN customers c ON o.customer_id = c.id
          INNER JOIN users u ON c.user_id = u.id
          WHERE o.id = $1
        `, [id]);
        
        if (updatedOrder.rows.length > 0) {
          socketManager.broadcastOrderUpdate(updatedOrder.rows[0], 'order-status-updated');
        }
      }

      res.json({
        success: true,
        message: `Order status updated to ${status}`
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update payment status
router.put('/:id/payment', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;
    
    const allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!payment_status || !allowedPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid payment status is required. Allowed: ' + allowedPaymentStatuses.join(', ') 
      });
    }

    // Check if order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Update payment status
    const updateFields = ['payment_status = $1', 'updated_at = NOW()'];
    const updateValues = [payment_status];
    
    if (payment_method) {
      updateFields.push('payment_method = $2');
      updateValues.push(payment_method);
      updateValues.push(id);
    } else {
      updateValues.push(id);
    }
    
    const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`;
    
    await pool.query(updateQuery, updateValues);

    // Broadcast real-time update
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      const updatedOrder = await pool.query(`
        SELECT o.*, c.phone as customer_phone, u.full_name as customer_name, u.email as customer_email
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE o.id = $1
      `, [id]);
      
      if (updatedOrder.rows.length > 0) {
        socketManager.broadcastOrderUpdate(updatedOrder.rows[0], 'order-payment-updated');
      }
    }

    res.json({
      success: true,
      message: `Payment status updated to ${payment_status}`
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get order statistics
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (date_from) {
      params.push(date_from);
      dateFilter += ` AND created_at >= $${params.length}`;
    }
    
    if (date_to) {
      params.push(date_to + ' 23:59:59');
      dateFilter += ` AND created_at <= $${params.length}`;
    }

    // Overall statistics
    const overallStats = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments,
        ROUND(SUM(total_amount), 2) as total_revenue,
        ROUND(AVG(total_amount), 2) as avg_order_value,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as orders_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as orders_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as orders_30d
      FROM orders
      WHERE 1=1 ${dateFilter}
    `, params);

    // Daily revenue for the last 30 days
    const dailyRevenue = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        ROUND(SUM(total_amount), 2) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Top products by quantity sold
    const topProducts = await pool.query(`
      SELECT 
        p.id, p.name, p.sku,
        SUM(oi.quantity) as total_sold,
        ROUND(SUM(oi.total_price), 2) as total_revenue
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateFilter.replace('created_at', 'o.created_at')}
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sold DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      stats: {
        overview: overallStats.rows[0],
        daily_revenue: dailyRevenue.rows,
        top_products: topProducts.rows
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = { router, setPool };