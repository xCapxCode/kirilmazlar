// Database Migration Utility
// Automatically runs database schema on startup

import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import { fileURLToPath } from 'url';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
let pool = null;

function createPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL not found. Running in localStorage mode.');
      return null;
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('🔴 Database pool error:', err);
    });
  }

  return pool;
}

// Check if database is accessible
export async function checkDatabaseConnection() {
  const dbPool = createPool();

  if (!dbPool) {
    return { success: false, mode: 'localStorage' };
  }

  try {
    const client = await dbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return { success: true, mode: 'database' };
  } catch (error) {
    console.error('🔴 Database connection failed:', error.message);
    return { success: false, mode: 'localStorage', error: error.message };
  }
}

// Run database migrations
export async function runMigrations() {
  const dbPool = createPool();

  if (!dbPool) {
    console.log('📦 No database connection. Skipping migrations.');
    return { success: false, mode: 'localStorage' };
  }

  try {
    console.log('🔄 Running database migrations...');

    const client = await dbPool.connect();

    try {
      // First, drop existing triggers and functions to prevent conflicts
      console.log('🧹 Cleaning up existing triggers and functions...');

      // Drop triggers first
      await client.query(`
        DO $$
        BEGIN
          -- Drop all existing triggers
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
            DROP TRIGGER update_users_updated_at ON users;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
            DROP TRIGGER update_customers_updated_at ON customers;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
            DROP TRIGGER update_categories_updated_at ON categories;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
            DROP TRIGGER update_products_updated_at ON products;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
            DROP TRIGGER update_orders_updated_at ON orders;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
            DROP TRIGGER update_settings_updated_at ON settings;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_order_number_trigger') THEN
            DROP TRIGGER generate_order_number_trigger ON orders;
          END IF;
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customer_stats_trigger') THEN
            DROP TRIGGER update_customer_stats_trigger ON orders;
          END IF;
        END $$;
      `);

      // Drop functions if they exist
      await client.query(`
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
        DROP FUNCTION IF EXISTS update_customer_stats() CASCADE;
      `);

      // Read schema file
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');

      if (!fs.existsSync(schemaPath)) {
        console.warn('⚠️  Schema file not found:', schemaPath);
        return { success: false, error: 'Schema file not found' };
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Execute schema
      await client.query(schema);
      console.log('✅ Database migrations completed successfully');

      // Check if we have any data
      const result = await client.query('SELECT COUNT(*) FROM users');
      const userCount = parseInt(result.rows[0].count);

      if (userCount === 0) {
        console.log('🌱 Seeding initial data...');
        await seedInitialData(client);
      }

      return { success: true, mode: 'database' };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('🔴 Migration failed:', error.message);
    return { success: false, error: error.message, mode: 'localStorage' };
  }
}

// Seed initial data
async function seedInitialData(client) {
  try {
    // Create admin user
    await client.query(`
      INSERT INTO users (username, password, email, full_name, role, permissions)
      VALUES (
        'admin',
        '$2b$10$rQZ9QmjytWCAGVjk8fNdKOtFZQqYjKvXvXvXvXvXvXvXvXvXvXvXv',
        'admin@kirilmazlar.com',
        'System Administrator',
        'admin',
        ARRAY['all']
      )
      ON CONFLICT (username) DO NOTHING
    `);

    // Create sample categories
    await client.query(`
      INSERT INTO categories (name, slug, description)
      VALUES 
        ('Elektronik', 'elektronik', 'Elektronik ürünler'),
        ('Giyim', 'giyim', 'Giyim ve aksesuar'),
        ('Ev & Yaşam', 'ev-yasam', 'Ev ve yaşam ürünleri')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Create sample settings
    await client.query(`
      INSERT INTO settings (key, value, description, category, is_public)
      VALUES 
        ('site_name', '"Kırılmazlar Panel"', 'Site adı', 'general', true),
        ('currency', '"TRY"', 'Para birimi', 'general', true),
        ('tax_rate', '18', 'KDV oranı (%)', 'general', false)
      ON CONFLICT (key) DO NOTHING
    `);

    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('🔴 Seeding failed:', error.message);
  }
}

// Get database pool for other modules
export function getPool() {
  return createPool();
}

// Close database connections
export async function closeDatabaseConnections() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connections closed');
  }
}

// Initialize database on startup
export async function initializeDatabase() {
  console.log('🚀 Initializing database...');

  const connectionResult = await checkDatabaseConnection();

  if (connectionResult.success) {
    const migrationResult = await runMigrations();
    return migrationResult;
  }

  return connectionResult;
}