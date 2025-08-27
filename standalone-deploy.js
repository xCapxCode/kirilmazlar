// Standalone PostgreSQL Database Deploy Script
// No dependencies required - uses only Node.js built-in modules

import { Pool } from 'pg';
import process from 'process';

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('💡 Run this script with: railway run node standalone-deploy.js');
  process.exit(1);
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function deployCleanDatabase() {
  try {
    console.log('🚀 Starting database clean deployment...');
    
    const client = await pool.connect();
    
    await client.query('BEGIN');
    
    console.log('🗑️  Dropping existing tables...');
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
      console.log(`   ✅ ${query}`);
    }
    
    console.log('🏗️  Creating fresh tables...');
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
      console.log(`   ✅ Created table`);
    }
    
    console.log('📊 Inserting sample data...');
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
      console.log(`   ✅ Inserted sample data`);
    }
    
    await client.query('COMMIT');
    
    console.log('📈 Getting table counts...');
    // Get table counts
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const orderCount = await client.query('SELECT COUNT(*) FROM orders');
    
    client.release();
    
    console.log('\n🎉 Database deployment completed successfully!');
    console.log('📊 Final counts:');
    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   📂 Categories: ${categoryCount.rows[0].count}`);
    console.log(`   📦 Products: ${productCount.rows[0].count}`);
    console.log(`   🛒 Customers: ${customerCount.rows[0].count}`);
    console.log(`   📋 Orders: ${orderCount.rows[0].count}`);
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Deploy clean failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the deployment
deployCleanDatabase();