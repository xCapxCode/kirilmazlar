// Database Migration Utility
// Automatically runs database schema on startup

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  Schema file not found:', schemaPath);
      return { success: false, error: 'Schema file not found' };
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Running database migrations...');
    
    const client = await dbPool.connect();
    
    try {
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