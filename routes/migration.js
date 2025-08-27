// Migration API Routes - PostgreSQL Data Migration Endpoints
import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../src/utils/productionLogger.js';

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Database connection healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

/**
 * Get data counts from database
 */
router.get('/counts', async (req, res) => {
  try {
    const client = await pool.connect();
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const orderCount = await client.query('SELECT COUNT(*) FROM orders');
    
    client.release();
    
    res.json({
      success: true,
      users: parseInt(userCount.rows[0].count),
      customers: parseInt(customerCount.rows[0].count),
      products: parseInt(productCount.rows[0].count),
      orders: parseInt(orderCount.rows[0].count)
    });
  } catch (error) {
    logger.error('Failed to get data counts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get data counts',
      details: error.message
    });
  }
});

/**
 * Migrate user data
 */
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    const client = await pool.connect();
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );
    
    if (existingUser.rows.length > 0) {
      client.release();
      return res.json({ 
        success: true, 
        message: 'User already exists',
        userId: existingUser.rows[0].id
      });
    }
    
    // Insert new user
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, active, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        userData.username,
        userData.email,
        userData.password_hash,
        userData.full_name,
        userData.role || 'customer',
        userData.active !== false,
        userData.phone,
        userData.created_at || new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'User migrated successfully',
      userId: result.rows[0].id
    });
    
  } catch (error) {
    logger.error('User migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'User migration failed',
      details: error.message
    });
  }
});

/**
 * Check if user exists
 */
router.get('/users/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    client.release();
    
    res.json({ 
      exists: result.rows.length > 0,
      userId: result.rows.length > 0 ? result.rows[0].id : null
    });
    
  } catch (error) {
    logger.error('User check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'User check failed',
      details: error.message
    });
  }
});

/**
 * Migrate customer data
 */
router.post('/customers', async (req, res) => {
  try {
    const customerData = req.body;
    const client = await pool.connect();
    
    // Check if customer already exists
    const existingCustomer = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [customerData.email]
    );
    
    if (existingCustomer.rows.length > 0) {
      client.release();
      return res.json({ 
        success: true, 
        message: 'Customer already exists',
        customerId: existingCustomer.rows[0].id
      });
    }
    
    // Insert new customer
    const result = await client.query(
      `INSERT INTO customers (name, email, phone, address, city, district, postal_code, status, total_orders, total_spent, loyalty_points, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id`,
      [
        customerData.name,
        customerData.email,
        customerData.phone,
        customerData.address,
        customerData.city,
        customerData.district,
        customerData.postal_code,
        customerData.status || 'active',
        customerData.total_orders || 0,
        customerData.total_spent || 0,
        customerData.loyalty_points || 0,
        customerData.created_at || new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Customer migrated successfully',
      customerId: result.rows[0].id
    });
    
  } catch (error) {
    logger.error('Customer migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Customer migration failed',
      details: error.message
    });
  }
});

/**
 * Check if customer exists
 */
router.get('/customers/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );
    
    client.release();
    
    res.json({ 
      exists: result.rows.length > 0,
      customerId: result.rows.length > 0 ? result.rows[0].id : null
    });
    
  } catch (error) {
    logger.error('Customer check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Customer check failed',
      details: error.message
    });
  }
});

/**
 * Migrate product data
 */
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const client = await pool.connect();
    
    // Check if product already exists
    const existingProduct = await client.query(
      'SELECT id FROM products WHERE sku = $1',
      [productData.sku]
    );
    
    if (existingProduct.rows.length > 0) {
      client.release();
      return res.json({ 
        success: true, 
        message: 'Product already exists',
        productId: existingProduct.rows[0].id
      });
    }
    
    // Insert new product
    const result = await client.query(
      `INSERT INTO products (name, description, sku, category, price, cost_price, stock_quantity, min_stock_level, status, weight, dimensions, barcode, supplier, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [
        productData.name,
        productData.description,
        productData.sku,
        productData.category,
        productData.price,
        productData.cost_price,
        productData.stock_quantity,
        productData.min_stock_level,
        productData.status || 'active',
        productData.weight,
        productData.dimensions,
        productData.barcode,
        productData.supplier,
        productData.created_at || new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Product migrated successfully',
      productId: result.rows[0].id
    });
    
  } catch (error) {
    logger.error('Product migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Product migration failed',
      details: error.message
    });
  }
});

/**
 * Check if product exists
 */
router.get('/products/check/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id FROM products WHERE sku = $1',
      [sku]
    );
    
    client.release();
    
    res.json({ 
      exists: result.rows.length > 0,
      productId: result.rows.length > 0 ? result.rows[0].id : null
    });
    
  } catch (error) {
    logger.error('Product check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Product check failed',
      details: error.message
    });
  }
});

/**
 * Migrate order data
 */
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const client = await pool.connect();
    
    // Check if order already exists
    const existingOrder = await client.query(
      'SELECT id FROM orders WHERE order_number = $1',
      [orderData.order_number]
    );
    
    if (existingOrder.rows.length > 0) {
      client.release();
      return res.json({ 
        success: true, 
        message: 'Order already exists',
        orderId: existingOrder.rows[0].id
      });
    }
    
    // Insert new order
    const result = await client.query(
      `INSERT INTO orders (order_number, customer_email, status, total_amount, tax_amount, shipping_amount, discount_amount, payment_method, payment_status, shipping_address, billing_address, notes, items, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [
        orderData.order_number,
        orderData.customer_email,
        orderData.status || 'pending',
        orderData.total_amount,
        orderData.tax_amount,
        orderData.shipping_amount,
        orderData.discount_amount,
        orderData.payment_method || 'cash',
        orderData.payment_status || 'pending',
        orderData.shipping_address,
        orderData.billing_address,
        orderData.notes,
        JSON.stringify(orderData.items || []),
        orderData.created_at || new Date().toISOString(),
        new Date().toISOString()
      ]
    );
    
    client.release();
    
    res.json({ 
      success: true, 
      message: 'Order migrated successfully',
      orderId: result.rows[0].id
    });
    
  } catch (error) {
    logger.error('Order migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Order migration failed',
      details: error.message
    });
  }
});

/**
 * Check if order exists
 */
router.get('/orders/check/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id FROM orders WHERE order_number = $1',
      [orderNumber]
    );
    
    client.release();
    
    res.json({ 
      exists: result.rows.length > 0,
      orderId: result.rows.length > 0 ? result.rows[0].id : null
    });
    
  } catch (error) {
    logger.error('Order check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Order check failed',
      details: error.message
    });
  }
});

/**
 * Batch migration endpoint
 */
router.post('/batch', async (req, res) => {
  try {
    const { users, customers, products, orders } = req.body;
    const results = {
      users: { success: 0, errors: 0, details: [] },
      customers: { success: 0, errors: 0, details: [] },
      products: { success: 0, errors: 0, details: [] },
      orders: { success: 0, errors: 0, details: [] }
    };
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Migrate users
      if (users && users.length > 0) {
        for (const user of users) {
          try {
            const existingUser = await client.query(
              'SELECT id FROM users WHERE email = $1',
              [user.email]
            );
            
            if (existingUser.rows.length === 0) {
              await client.query(
                `INSERT INTO users (username, email, password_hash, full_name, role, active, phone, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  user.username,
                  user.email,
                  user.password_hash,
                  user.full_name,
                  user.role || 'customer',
                  user.active !== false,
                  user.phone,
                  user.created_at || new Date().toISOString(),
                  new Date().toISOString()
                ]
              );
            }
            results.users.success++;
          } catch (error) {
            results.users.errors++;
            results.users.details.push(`${user.email}: ${error.message}`);
          }
        }
      }
      
      // Migrate customers
      if (customers && customers.length > 0) {
        for (const customer of customers) {
          try {
            const existingCustomer = await client.query(
              'SELECT id FROM customers WHERE email = $1',
              [customer.email]
            );
            
            if (existingCustomer.rows.length === 0) {
              await client.query(
                `INSERT INTO customers (name, email, phone, address, city, district, postal_code, status, total_orders, total_spent, loyalty_points, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                  customer.name,
                  customer.email,
                  customer.phone,
                  customer.address,
                  customer.city,
                  customer.district,
                  customer.postal_code,
                  customer.status || 'active',
                  customer.total_orders || 0,
                  customer.total_spent || 0,
                  customer.loyalty_points || 0,
                  customer.created_at || new Date().toISOString(),
                  new Date().toISOString()
                ]
              );
            }
            results.customers.success++;
          } catch (error) {
            results.customers.errors++;
            results.customers.details.push(`${customer.email}: ${error.message}`);
          }
        }
      }
      
      // Migrate products
      if (products && products.length > 0) {
        for (const product of products) {
          try {
            const existingProduct = await client.query(
              'SELECT id FROM products WHERE sku = $1',
              [product.sku]
            );
            
            if (existingProduct.rows.length === 0) {
              await client.query(
                `INSERT INTO products (name, description, sku, category, price, cost_price, stock_quantity, min_stock_level, status, weight, dimensions, barcode, supplier, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [
                  product.name,
                  product.description,
                  product.sku,
                  product.category,
                  product.price,
                  product.cost_price,
                  product.stock_quantity,
                  product.min_stock_level,
                  product.status || 'active',
                  product.weight,
                  product.dimensions,
                  product.barcode,
                  product.supplier,
                  product.created_at || new Date().toISOString(),
                  new Date().toISOString()
                ]
              );
            }
            results.products.success++;
          } catch (error) {
            results.products.errors++;
            results.products.details.push(`${product.sku}: ${error.message}`);
          }
        }
      }
      
      // Migrate orders
      if (orders && orders.length > 0) {
        for (const order of orders) {
          try {
            const existingOrder = await client.query(
              'SELECT id FROM orders WHERE order_number = $1',
              [order.order_number]
            );
            
            if (existingOrder.rows.length === 0) {
              await client.query(
                `INSERT INTO orders (order_number, customer_email, status, total_amount, tax_amount, shipping_amount, discount_amount, payment_method, payment_status, shipping_address, billing_address, notes, items, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [
                  order.order_number,
                  order.customer_email,
                  order.status || 'pending',
                  order.total_amount,
                  order.tax_amount,
                  order.shipping_amount,
                  order.discount_amount,
                  order.payment_method || 'cash',
                  order.payment_status || 'pending',
                  order.shipping_address,
                  order.billing_address,
                  order.notes,
                  JSON.stringify(order.items || []),
                  order.created_at || new Date().toISOString(),
                  new Date().toISOString()
                ]
              );
            }
            results.orders.success++;
          } catch (error) {
            results.orders.errors++;
            results.orders.details.push(`${order.order_number}: ${error.message}`);
          }
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        message: 'Batch migration completed',
        results
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    logger.error('Batch migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Batch migration failed',
      details: error.message
    });
  }
});

/**
 * Clear all migration data (for testing)
 */
router.delete('/clear', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Clear operation not allowed in production'
      });
    }
    
    const client = await pool.connect();
    
    await client.query('BEGIN');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM customers');
    await client.query('DELETE FROM users');
    await client.query('COMMIT');
    
    client.release();
    
    res.json({
      success: true,
      message: 'All migration data cleared'
    });
    
  } catch (error) {
    logger.error('Clear migration data failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Clear operation failed',
      details: error.message
    });
  }
});

/**
 * Clean database and deploy fresh schema
 */
router.post('/deploy-clean', async (req, res) => {
  try {
    const client = await pool.connect();
    
    await client.query('BEGIN');
    
    // Drop existing tables
    const dropQueries = [
      'DROP TABLE IF EXISTS orders CASCADE;',
      'DROP TABLE IF EXISTS products CASCADE;',
      'DROP TABLE IF EXISTS customers CASCADE;',
      'DROP TABLE IF EXISTS categories CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;'
    ];
    
    for (const query of dropQueries) {
      await client.query(query);
    }
    
    // Create fresh tables with sample data
    const createQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );`,
      
      `CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id VARCHAR(255) REFERENCES categories(id),
        stock_quantity INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) REFERENCES customers(id),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];
    
    for (const query of createQueries) {
      await client.query(query);
    }
    
    // Insert sample data
    const insertQueries = [
      `INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) 
       VALUES ('1', 'admin@kirilmazlar.com', 'hashed_password_123', 'admin', 'Admin User', '2024-01-01T00:00:00.000Z', NOW(), true) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) 
       VALUES ('2', 'user@kirilmazlar.com', 'hashed_password_456', 'user', 'Test User', '2024-01-02T00:00:00.000Z', NOW(), true) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO categories (id, name, description, is_active, created_at, updated_at) 
       VALUES ('1', 'Kategori 1', 'İlk kategori', true, '2024-01-01T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO categories (id, name, description, is_active, created_at, updated_at) 
       VALUES ('2', 'Kategori 2', 'İkinci kategori', true, '2024-01-01T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) 
       VALUES ('1', 'Test Ürün 1', 'Test ürün açıklaması', 100.5, '1', 50, true, '2024-01-01T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) 
       VALUES ('2', 'Test Ürün 2', 'İkinci test ürün', 250.75, '2', 25, true, '2024-01-02T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) 
       VALUES ('1', 'Müşteri 1', 'musteri1@example.com', '+90 555 123 4567', 'Test Adres 1', '2024-01-01T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`,
       
      `INSERT INTO orders (id, customer_id, total_amount, status, items, notes, created_at, updated_at) 
       VALUES ('1', '1', 351.25, 'completed', '[{"productId":"1","quantity":2,"price":100.5},{"productId":"2","quantity":1,"price":250.75}]', 'Test sipariş', '2024-01-03T00:00:00.000Z', NOW()) 
       ON CONFLICT (id) DO NOTHING;`
    ];
    
    for (const query of insertQueries) {
      await client.query(query);
    }
    
    await client.query('COMMIT');
    
    // Get table counts
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const orderCount = await client.query('SELECT COUNT(*) FROM orders');
    
    client.release();
    
    res.json({
      success: true,
      message: 'Database cleaned and fresh schema deployed successfully',
      counts: {
        users: parseInt(userCount.rows[0].count),
        categories: parseInt(categoryCount.rows[0].count),
        products: parseInt(productCount.rows[0].count),
        customers: parseInt(customerCount.rows[0].count),
        orders: parseInt(orderCount.rows[0].count)
      }
    });
    
  } catch (error) {
    logger.error('Deploy clean failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Deploy clean operation failed',
      details: error.message
    });
  }
});

export default router;