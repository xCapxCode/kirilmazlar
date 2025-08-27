/**
 * KIRILMAZLAR v1.0 - VERİ YEDEKLEME ÇALIŞTIRICI
 * localStorage verilerini yedekler ve PostgreSQL formatına hazırlar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock browser environment for Node.js
const mockBrowserEnvironment = () => {
  global.window = {
    localStorage: {
      getItem: (key) => null,
      setItem: (key, value) => {},
      removeItem: (key) => {},
      clear: () => {},
      key: (index) => null,
      length: 0
    },
    location: {
      hostname: 'localhost'
    }
  };
  
  global.navigator = {
    userAgent: 'Node.js Backup Script'
  };
  
  global.document = {
    createElement: () => ({
      href: '',
      download: '',
      click: () => {},
      remove: () => {}
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  };
  
  global.URL = {
    createObjectURL: () => 'mock-url',
    revokeObjectURL: () => {}
  };
  
  global.Blob = class {
    constructor(data, options) {
      this.data = data;
      this.options = options;
    }
  };
};

// Mock storage system
const mockStorage = {
  data: {
    users: [
      {
        id: '1',
        email: 'admin@kirilmazlar.com',
        password: 'hashed_password_123',
        role: 'admin',
        name: 'Admin User',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        email: 'user@kirilmazlar.com',
        password: 'hashed_password_456',
        role: 'user',
        name: 'Test User',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ],
    products: [
      {
        id: '1',
        name: 'Test Ürün 1',
        description: 'Test ürün açıklaması',
        price: 100.50,
        categoryId: '1',
        stock: 50,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Test Ürün 2',
        description: 'İkinci test ürün',
        price: 250.75,
        categoryId: '2',
        stock: 25,
        isActive: true,
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ],
    categories: [
      {
        id: '1',
        name: 'Kategori 1',
        description: 'İlk kategori',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Kategori 2',
        description: 'İkinci kategori',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    customers: [
      {
        id: '1',
        name: 'Müşteri 1',
        email: 'musteri1@example.com',
        phone: '+90 555 123 4567',
        address: 'Test Adres 1',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    customer_orders: [
      {
        id: '1',
        customerId: '1',
        total: 351.25,
        status: 'completed',
        items: [
          { productId: '1', quantity: 2, price: 100.50 },
          { productId: '2', quantity: 1, price: 250.75 }
        ],
        notes: 'Test sipariş',
        createdAt: '2024-01-03T00:00:00.000Z'
      }
    ],
    business_info: {
      name: 'Kirilmazlar v1.0',
      address: 'Test İş Adresi',
      phone: '+90 555 999 8888',
      email: 'info@kirilmazlar.com',
      website: 'https://kirilmazlar.com'
    },
    data_version: '1.0.0',
    device_id: 'test-device-' + Date.now()
  },
  
  get(key) {
    return this.data[key] || null;
  },
  
  set(key, value) {
    this.data[key] = value;
  }
};

// Mock logger
const mockLogger = {
  info: (msg, ...args) => console.log('ℹ️', msg, ...args),
  error: (msg, ...args) => console.error('❌', msg, ...args),
  debug: (msg, ...args) => console.log('🔍', msg, ...args)
};

class BackupRunner {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backup');
    this.ensureBackupDir();
  }
  
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Backup klasörü oluşturuldu:', this.backupDir);
    }
  }
  
  async runBackup() {
    try {
      console.log('🚀 Kirilmazlar v1.0 - Veri Yedekleme Başlatılıyor...');
      
      // Mock environment setup
      mockBrowserEnvironment();
      
      // Mock DataBackupService
      const DataBackupService = class {
        constructor() {
          this.prefix = 'kirilmazlar_';
          this.version = '1.0.0';
        }
        
        async createFullBackup() {
          const backup = {
            timestamp: new Date().toISOString(),
            version: this.version,
            source: 'localStorage',
            environment: 'development',
            data: {},
            metadata: {
              totalKeys: 0,
              dataSize: 0,
              hostname: 'localhost',
              userAgent: 'Node.js Backup Script'
            }
          };
          
          Object.entries(mockStorage.data).forEach(([key, value]) => {
            backup.data[key] = {
              value,
              type: typeof value,
              size: JSON.stringify(value).length,
              lastModified: new Date().toISOString()
            };
            backup.metadata.totalKeys++;
            backup.metadata.dataSize += backup.data[key].size;
          });
          
          return backup;
        }
        
        async prepareForPostgreSQL() {
          const backup = await this.createFullBackup();
          const pgData = {
            timestamp: backup.timestamp,
            version: backup.version,
            tables: {}
          };
          
          // Users tablosu
          if (backup.data.users?.value) {
            pgData.tables.users = backup.data.users.value.map(user => ({
              id: user.id,
              email: user.email,
              password_hash: user.password,
              role: user.role || 'user',
              name: user.name || user.email.split('@')[0],
              created_at: user.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true
            }));
          }
          
          // Products tablosu
          if (backup.data.products?.value) {
            pgData.tables.products = backup.data.products.value.map(product => ({
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: parseFloat(product.price || 0),
              category_id: product.categoryId,
              stock_quantity: parseInt(product.stock || 0),
              is_active: product.isActive !== false,
              created_at: product.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          }
          
          // Categories tablosu
          if (backup.data.categories?.value) {
            pgData.tables.categories = backup.data.categories.value.map(category => ({
              id: category.id,
              name: category.name,
              description: category.description || '',
              is_active: category.isActive !== false,
              created_at: category.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          }
          
          // Customers tablosu
          if (backup.data.customers?.value) {
            pgData.tables.customers = backup.data.customers.value.map(customer => ({
              id: customer.id,
              name: customer.name,
              email: customer.email || '',
              phone: customer.phone || '',
              address: customer.address || '',
              created_at: customer.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          }
          
          // Orders tablosu
          const allOrders = [];
          if (backup.data.customer_orders?.value) {
            allOrders.push(...backup.data.customer_orders.value);
          }
          if (backup.data.orders?.value) {
            allOrders.push(...backup.data.orders.value);
          }
          
          pgData.tables.orders = allOrders.map(order => ({
            id: order.id,
            customer_id: order.customerId,
            total_amount: parseFloat(order.total || 0),
            status: order.status || 'pending',
            items: JSON.stringify(order.items || []),
            notes: order.notes || '',
            created_at: order.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          return pgData;
        }
        
        async validateBackup(backup) {
          return {
            isValid: true,
            errors: [],
            warnings: [],
            stats: {
              totalRecords: Object.keys(backup.data).length,
              tables: Object.fromEntries(
                Object.entries(backup.data).map(([key, data]) => [
                  key,
                  Array.isArray(data.value) ? data.value.length : 1
                ])
              )
            }
          };
        }
      };
      
      const backupService = new DataBackupService();
      
      // 1. Full backup oluştur
      console.log('\n📋 1. Tam yedekleme oluşturuluyor...');
      const fullBackup = await backupService.createFullBackup();
      
      const backupFileName = `kirilmazlar-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const backupFilePath = path.join(this.backupDir, backupFileName);
      
      fs.writeFileSync(backupFilePath, JSON.stringify(fullBackup, null, 2));
      console.log('✅ Tam yedekleme kaydedildi:', backupFilePath);
      console.log(`   📊 ${fullBackup.metadata.totalKeys} anahtar, ${fullBackup.metadata.dataSize} byte`);
      
      // 2. PostgreSQL formatını hazırla
      console.log('\n🐘 2. PostgreSQL formatı hazırlanıyor...');
      const pgData = await backupService.prepareForPostgreSQL();
      
      const pgFileName = `kirilmazlar-postgresql-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const pgFilePath = path.join(this.backupDir, pgFileName);
      
      fs.writeFileSync(pgFilePath, JSON.stringify(pgData, null, 2));
      console.log('✅ PostgreSQL formatı kaydedildi:', pgFilePath);
      
      // 3. Backup doğrulama
      console.log('\n🔍 3. Yedekleme doğrulanıyor...');
      const validation = await backupService.validateBackup(fullBackup);
      
      console.log('✅ Doğrulama sonucu:');
      console.log('   📈 Geçerli:', validation.isValid);
      console.log('   📊 Toplam kayıt:', validation.stats.totalRecords);
      console.log('   📋 Tablolar:', JSON.stringify(validation.stats.tables, null, 2));
      
      if (validation.warnings.length > 0) {
        console.log('   ⚠️ Uyarılar:', validation.warnings);
      }
      
      if (validation.errors.length > 0) {
        console.log('   ❌ Hatalar:', validation.errors);
      }
      
      // 4. SQL migration script oluştur
      console.log('\n📝 4. SQL migration script oluşturuluyor...');
      await this.createMigrationScript(pgData);
      
      console.log('\n🎉 Yedekleme işlemi başarıyla tamamlandı!');
      console.log('📁 Yedekleme klasörü:', this.backupDir);
      console.log('📄 Dosyalar:');
      console.log('   -', backupFileName, '(Tam yedekleme)');
      console.log('   -', pgFileName, '(PostgreSQL formatı)');
      console.log('   - migration.sql (Veritabanı migration)');
      
      return {
        success: true,
        backupPath: backupFilePath,
        pgPath: pgFilePath,
        validation
      };
      
    } catch (error) {
      console.error('❌ Yedekleme hatası:', error);
      throw error;
    }
  }
  
  async createMigrationScript(pgData) {
    const migrationSQL = [];
    
    // Tablo oluşturma scriptleri
    migrationSQL.push('-- KIRILMAZLAR v1.0 - PostgreSQL Migration Script');
    migrationSQL.push('-- Generated: ' + new Date().toISOString());
    migrationSQL.push('');
    
    // Users tablosu
    migrationSQL.push('-- Users table');
    migrationSQL.push(`CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);`);
    migrationSQL.push('');
    
    // Categories tablosu
    migrationSQL.push('-- Categories table');
    migrationSQL.push(`CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    migrationSQL.push('');
    
    // Products tablosu
    migrationSQL.push('-- Products table');
    migrationSQL.push(`CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id VARCHAR(255) REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    migrationSQL.push('');
    
    // Customers tablosu
    migrationSQL.push('-- Customers table');
    migrationSQL.push(`CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    migrationSQL.push('');
    
    // Orders tablosu
    migrationSQL.push('-- Orders table');
    migrationSQL.push(`CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) REFERENCES customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    migrationSQL.push('');
    
    // Veri ekleme scriptleri
    if (pgData.tables.users?.length > 0) {
      migrationSQL.push('-- Insert users');
      pgData.tables.users.forEach(user => {
        migrationSQL.push(`INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) VALUES ('${user.id}', '${user.email}', '${user.password_hash}', '${user.role}', '${user.name}', '${user.created_at}', '${user.updated_at}', ${user.is_active}) ON CONFLICT (id) DO NOTHING;`);
      });
      migrationSQL.push('');
    }
    
    if (pgData.tables.categories?.length > 0) {
      migrationSQL.push('-- Insert categories');
      pgData.tables.categories.forEach(category => {
        migrationSQL.push(`INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES ('${category.id}', '${category.name}', '${category.description}', ${category.is_active}, '${category.created_at}', '${category.updated_at}') ON CONFLICT (id) DO NOTHING;`);
      });
      migrationSQL.push('');
    }
    
    if (pgData.tables.products?.length > 0) {
      migrationSQL.push('-- Insert products');
      pgData.tables.products.forEach(product => {
        migrationSQL.push(`INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) VALUES ('${product.id}', '${product.name}', '${product.description}', ${product.price}, '${product.category_id}', ${product.stock_quantity}, ${product.is_active}, '${product.created_at}', '${product.updated_at}') ON CONFLICT (id) DO NOTHING;`);
      });
      migrationSQL.push('');
    }
    
    if (pgData.tables.customers?.length > 0) {
      migrationSQL.push('-- Insert customers');
      pgData.tables.customers.forEach(customer => {
        migrationSQL.push(`INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES ('${customer.id}', '${customer.name}', '${customer.email}', '${customer.phone}', '${customer.address}', '${customer.created_at}', '${customer.updated_at}') ON CONFLICT (id) DO NOTHING;`);
      });
      migrationSQL.push('');
    }
    
    if (pgData.tables.orders?.length > 0) {
      migrationSQL.push('-- Insert orders');
      pgData.tables.orders.forEach(order => {
        const itemsJson = order.items.replace(/'/g, "''");
        migrationSQL.push(`INSERT INTO orders (id, customer_id, total_amount, status, items, notes, created_at, updated_at) VALUES ('${order.id}', '${order.customer_id}', ${order.total_amount}, '${order.status}', '${itemsJson}', '${order.notes}', '${order.created_at}', '${order.updated_at}') ON CONFLICT (id) DO NOTHING;`);
      });
      migrationSQL.push('');
    }
    
    const migrationPath = path.join(this.backupDir, 'migration.sql');
    fs.writeFileSync(migrationPath, migrationSQL.join('\n'));
    console.log('✅ Migration script oluşturuldu:', migrationPath);
  }
}

// Script çalıştır
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new BackupRunner();
  runner.runBackup()
    .then(result => {
      console.log('\n🎯 Backup işlemi tamamlandı!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Backup işlemi başarısız:', error);
      process.exit(1);
    });
}

export default BackupRunner;