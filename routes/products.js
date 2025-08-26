/**
 * Products Routes
 * Product management endpoints
 */

import express from 'express';
import { authenticateToken, requireRole, requireSellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Database connection will be set from server.js
let pool;

// Function to set database pool
const setPool = (dbPool) => {
  pool = dbPool;
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const { 
      category_id, 
      active, 
      in_stock, 
      page = 1, 
      limit = 50, 
      search, 
      sort = 'created_at', 
      order = 'DESC',
      min_price,
      max_price
    } = req.query;
    
    let query = `
      SELECT p.id, p.name, p.description, p.sku, p.price, p.cost_price, 
             p.stock_quantity, p.min_stock_level, p.active, p.image_url,
             p.created_at, p.updated_at,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    // Add filters
    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    
    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND p.active = $${params.length}`;
    }
    
    if (in_stock === 'true') {
      query += ` AND p.stock_quantity > 0`;
    } else if (in_stock === 'false') {
      query += ` AND p.stock_quantity <= 0`;
    }
    
    if (min_price) {
      params.push(parseFloat(min_price));
      query += ` AND p.price >= $${params.length}`;
    }
    
    if (max_price) {
      params.push(parseFloat(max_price));
      query += ` AND p.price <= $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'name', 'price', 'stock_quantity', 'sku'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY p.${sortField} ${sortOrder}`;
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE 1=1';
    const countParams = [];
    
    // Apply same filters for count
    if (category_id) {
      countParams.push(category_id);
      countQuery += ` AND p.category_id = $${countParams.length}`;
    }
    
    if (active !== undefined) {
      countParams.push(active === 'true');
      countQuery += ` AND p.active = $${countParams.length}`;
    }
    
    if (in_stock === 'true') {
      countQuery += ` AND p.stock_quantity > 0`;
    } else if (in_stock === 'false') {
      countQuery += ` AND p.stock_quantity <= 0`;
    }
    
    if (min_price) {
      countParams.push(parseFloat(min_price));
      countQuery += ` AND p.price >= $${countParams.length}`;
    }
    
    if (max_price) {
      countParams.push(parseFloat(max_price));
      countQuery += ` AND p.price <= $${countParams.length}`;
    }
    
    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (p.name ILIKE $${countParams.length} OR p.description ILIKE $${countParams.length} OR p.sku ILIKE $${countParams.length})`;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT p.id, p.name, p.description, p.sku, p.price, p.cost_price, 
             p.stock_quantity, p.min_stock_level, p.active, p.image_url,
             p.created_at, p.updated_at,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Get recent inventory movements
    const movementsQuery = `
      SELECT id, movement_type, quantity, reference_type, reference_id, notes, created_at
      FROM inventory_movements 
      WHERE product_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const movementsResult = await pool.query(movementsQuery, [id]);
    
    res.json({
      success: true,
      product: {
        ...result.rows[0],
        recent_movements: movementsResult.rows
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create new product
router.post('/', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      sku, 
      price, 
      cost_price, 
      category_id, 
      stock_quantity = 0, 
      min_stock_level = 0, 
      image_url,
      active = true 
    } = req.body;

    // Validation
    if (!name || !sku || !price) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, SKU, and price are required' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Price must be greater than 0' 
      });
    }

    // Check if SKU already exists
    const existingSku = await pool.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existingSku.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'SKU already exists' 
      });
    }

    // Validate category if provided
    if (category_id) {
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Category not found' });
      }
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert new product
      const insertProductQuery = `
        INSERT INTO products (name, description, sku, price, cost_price, category_id, 
                             stock_quantity, min_stock_level, active, image_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `;

      const productResult = await client.query(insertProductQuery, [
        name,
        description,
        sku,
        parseFloat(price),
        cost_price ? parseFloat(cost_price) : null,
        category_id || null,
        parseInt(stock_quantity),
        parseInt(min_stock_level),
        active,
        image_url
      ]);

      const newProduct = productResult.rows[0];

      // Record initial stock if any
      if (stock_quantity > 0) {
        await client.query(
          `INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, created_at)
           VALUES ($1, 'in', $2, 'initial_stock', 'Initial stock entry', NOW())`,
          [newProduct.id, stock_quantity]
        );
      }

      await client.query('COMMIT');

      // Get complete product data with category
      const completeProduct = await pool.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [newProduct.id]);

      const productData = completeProduct.rows[0];

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.broadcastProductUpdate(productData, 'product-created');
      }

      res.status(201).json({
        success: true,
        product: productData
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      sku, 
      price, 
      cost_price, 
      category_id, 
      min_stock_level, 
      image_url,
      active 
    } = req.body;

    // Check if product exists
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check for duplicate SKU (excluding current product)
    if (sku) {
      const duplicateSku = await pool.query(
        'SELECT id FROM products WHERE sku = $1 AND id != $2',
        [sku, id]
      );
      
      if (duplicateSku.rows.length > 0) {
        return res.status(409).json({ 
          success: false,
          error: 'SKU already exists' 
        });
      }
    }

    // Validate category if provided
    if (category_id) {
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Category not found' });
      }
    }

    // Validate price
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Price must be greater than 0' 
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (name !== undefined) {
      updateFields.push(`name = $${++paramCount}`);
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${++paramCount}`);
      updateValues.push(description);
    }
    if (sku !== undefined) {
      updateFields.push(`sku = $${++paramCount}`);
      updateValues.push(sku);
    }
    if (price !== undefined) {
      updateFields.push(`price = $${++paramCount}`);
      updateValues.push(parseFloat(price));
    }
    if (cost_price !== undefined) {
      updateFields.push(`cost_price = $${++paramCount}`);
      updateValues.push(cost_price ? parseFloat(cost_price) : null);
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${++paramCount}`);
      updateValues.push(category_id || null);
    }
    if (min_stock_level !== undefined) {
      updateFields.push(`min_stock_level = $${++paramCount}`);
      updateValues.push(parseInt(min_stock_level));
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${++paramCount}`);
      updateValues.push(image_url);
    }
    if (active !== undefined) {
      updateFields.push(`active = $${++paramCount}`);
      updateValues.push(active);
    }

    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: 'No changes made'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE products SET ${updateFields.join(', ')} 
      WHERE id = $${++paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);

    // Get complete product data with category
    const completeProduct = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    const updatedProduct = completeProduct.rows[0];

    // Broadcast real-time update
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      socketManager.broadcastProductUpdate(updatedProduct, 'product-updated');
    }

    res.json({
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update stock quantity
router.put('/:id/stock', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, movement_type, notes } = req.body;

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });
    }

    if (!movement_type || !['in', 'out', 'adjustment'].includes(movement_type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid movement_type is required (in, out, adjustment)' 
      });
    }

    // Check if product exists
    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = productCheck.rows[0];
    let newQuantity;

    // Calculate new quantity based on movement type
    switch (movement_type) {
      case 'in':
        newQuantity = product.stock_quantity + Math.abs(quantity);
        break;
      case 'out':
        newQuantity = product.stock_quantity - Math.abs(quantity);
        if (newQuantity < 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Insufficient stock. Current stock: ' + product.stock_quantity 
          });
        }
        break;
      case 'adjustment':
        newQuantity = Math.abs(quantity);
        break;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update product stock
      await client.query(
        'UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, id]
      );

      // Record inventory movement
      const actualQuantity = movement_type === 'adjustment' 
        ? (newQuantity - product.stock_quantity)
        : (movement_type === 'in' ? Math.abs(quantity) : -Math.abs(quantity));

      await client.query(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, created_at)
         VALUES ($1, $2, $3, 'manual', $4, NOW())`,
        [id, movement_type, Math.abs(actualQuantity), notes || `Manual ${movement_type} adjustment`]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Stock updated successfully`,
        old_quantity: product.stock_quantity,
        new_quantity: newQuantity,
        change: actualQuantity
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if product has orders
    const ordersCheck = await pool.query('SELECT COUNT(*) FROM order_items WHERE product_id = $1', [id]);
    const orderCount = parseInt(ordersCheck.rows[0].count);

    if (orderCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete product with ${orderCount} order items. Consider deactivating instead.` 
      });
    }

    const deletedProduct = productResult.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete inventory movements
      await client.query('DELETE FROM inventory_movements WHERE product_id = $1', [id]);
      
      // Delete product
      await client.query('DELETE FROM products WHERE id = $1', [id]);

      await client.query('COMMIT');

      // Broadcast real-time update
      const socketManager = req.app.get('socketManager');
      if (socketManager) {
        socketManager.broadcastProductUpdate(deletedProduct, 'product-deleted');
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get product statistics
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE active = true) as active_products,
        COUNT(*) FILTER (WHERE active = false) as inactive_products,
        COUNT(*) FILTER (WHERE stock_quantity <= 0) as out_of_stock,
        COUNT(*) FILTER (WHERE stock_quantity <= min_stock_level AND stock_quantity > 0) as low_stock,
        ROUND(AVG(price), 2) as avg_price,
        ROUND(SUM(stock_quantity * price), 2) as total_inventory_value,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_products_30d
      FROM products
    `);

    // Top selling products
    const topSelling = await pool.query(`
      SELECT 
        p.id, p.name, p.sku, p.price,
        SUM(oi.quantity) as total_sold,
        ROUND(SUM(oi.total_price), 2) as total_revenue
      FROM products p
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.sku, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Low stock products
    const lowStock = await pool.query(`
      SELECT id, name, sku, stock_quantity, min_stock_level
      FROM products
      WHERE stock_quantity <= min_stock_level AND active = true
      ORDER BY stock_quantity ASC
      LIMIT 20
    `);

    // Products by category
    const byCategory = await pool.query(`
      SELECT 
        c.name as category_name,
        COUNT(p.id) as product_count,
        ROUND(AVG(p.price), 2) as avg_price
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = true
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);

    res.json({
      success: true,
      stats: {
        overview: stats.rows[0],
        top_selling: topSelling.rows,
        low_stock: lowStock.rows,
        by_category: byCategory.rows
      }
    });

  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, c.active, c.created_at,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = true
      WHERE c.active = true
      GROUP BY c.id, c.name, c.description, c.active, c.created_at
      ORDER BY c.name
    `);

    res.json({
      success: true,
      categories: result.rows
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default { router, setPool };