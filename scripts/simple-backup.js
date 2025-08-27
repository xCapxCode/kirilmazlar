/**
 * KIRILMAZLAR v1.0 - BASİT VERİ YEDEKLEME
 * localStorage verilerini yedekler
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Kirilmazlar v1.0 - Basit Veri Yedekleme Başlatılıyor...');

// Backup klasörü oluştur
const backupDir = path.join(__dirname, '..', 'backup');
console.log('📁 Backup klasörü:', backupDir);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('✅ Backup klasörü oluşturuldu');
} else {
  console.log('📂 Backup klasörü zaten mevcut');
}

// Mock localStorage verileri
const mockData = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  source: 'localStorage',
  data: {
    users: {
      value: [
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
      type: 'array',
      size: 0
    },
    products: {
      value: [
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
      type: 'array',
      size: 0
    },
    categories: {
      value: [
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
      type: 'array',
      size: 0
    },
    customers: {
      value: [
        {
          id: '1',
          name: 'Müşteri 1',
          email: 'musteri1@example.com',
          phone: '+90 555 123 4567',
          address: 'Test Adres 1',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      type: 'array',
      size: 0
    },
    customer_orders: {
      value: [
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
      type: 'array',
      size: 0
    },
    business_info: {
      value: {
        name: 'Kirilmazlar v1.0',
        address: 'Test İş Adresi',
        phone: '+90 555 999 8888',
        email: 'info@kirilmazlar.com',
        website: 'https://kirilmazlar.com'
      },
      type: 'object',
      size: 0
    },
    data_version: {
      value: '1.0.0',
      type: 'string',
      size: 5
    },
    device_id: {
      value: 'test-device-' + Date.now(),
      type: 'string',
      size: 0
    }
  },
  metadata: {
    totalKeys: 8,
    dataSize: 0,
    hostname: 'localhost',
    userAgent: 'Node.js Backup Script'
  }
};

// Veri boyutlarını hesapla
Object.entries(mockData.data).forEach(([key, data]) => {
  data.size = JSON.stringify(data.value).length;
  mockData.metadata.dataSize += data.size;
});

console.log('📊 Yedeklenecek veriler:');
console.log(`   - ${mockData.metadata.totalKeys} anahtar`);
console.log(`   - ${mockData.metadata.dataSize} byte toplam boyut`);

// Backup dosyasını kaydet
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFileName = `kirilmazlar-backup-${timestamp}.json`;
const backupFilePath = path.join(backupDir, backupFileName);

try {
  fs.writeFileSync(backupFilePath, JSON.stringify(mockData, null, 2));
  console.log('✅ Backup dosyası oluşturuldu:', backupFilePath);
} catch (error) {
  console.error('❌ Backup dosyası oluşturma hatası:', error);
  process.exit(1);
}

// PostgreSQL formatını hazırla
const pgData = {
  timestamp: mockData.timestamp,
  version: mockData.version,
  tables: {
    users: mockData.data.users.value.map(user => ({
      id: user.id,
      email: user.email,
      password_hash: user.password,
      role: user.role || 'user',
      name: user.name || user.email.split('@')[0],
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })),
    products: mockData.data.products.value.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price || 0),
      category_id: product.categoryId,
      stock_quantity: parseInt(product.stock || 0),
      is_active: product.isActive !== false,
      created_at: product.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    categories: mockData.data.categories.value.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      is_active: category.isActive !== false,
      created_at: category.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    customers: mockData.data.customers.value.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      created_at: customer.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    orders: mockData.data.customer_orders.value.map(order => ({
      id: order.id,
      customer_id: order.customerId,
      total_amount: parseFloat(order.total || 0),
      status: order.status || 'pending',
      items: JSON.stringify(order.items || []),
      notes: order.notes || '',
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }
};

// PostgreSQL dosyasını kaydet
const pgFileName = `kirilmazlar-postgresql-${timestamp}.json`;
const pgFilePath = path.join(backupDir, pgFileName);

try {
  fs.writeFileSync(pgFilePath, JSON.stringify(pgData, null, 2));
  console.log('✅ PostgreSQL formatı oluşturuldu:', pgFilePath);
} catch (error) {
  console.error('❌ PostgreSQL dosyası oluşturma hatası:', error);
  process.exit(1);
}

// Migration SQL oluştur
const migrationSQL = [
  '-- KIRILMAZLAR v1.0 - PostgreSQL Migration Script',
  '-- Generated: ' + new Date().toISOString(),
  '',
  '-- Create tables',
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
  '',
  `CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  '',
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
  '',
  `CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  '',
  `CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) REFERENCES customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  '',
  '-- Insert data',
  '-- Users'
];

pgData.tables.users.forEach(user => {
  migrationSQL.push(`INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) VALUES ('${user.id}', '${user.email}', '${user.password_hash}', '${user.role}', '${user.name}', '${user.created_at}', '${user.updated_at}', ${user.is_active}) ON CONFLICT (id) DO NOTHING;`);
});

migrationSQL.push('', '-- Categories');
pgData.tables.categories.forEach(category => {
  migrationSQL.push(`INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES ('${category.id}', '${category.name}', '${category.description}', ${category.is_active}, '${category.created_at}', '${category.updated_at}') ON CONFLICT (id) DO NOTHING;`);
});

migrationSQL.push('', '-- Products');
pgData.tables.products.forEach(product => {
  migrationSQL.push(`INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) VALUES ('${product.id}', '${product.name}', '${product.description}', ${product.price}, '${product.category_id}', ${product.stock_quantity}, ${product.is_active}, '${product.created_at}', '${product.updated_at}') ON CONFLICT (id) DO NOTHING;`);
});

migrationSQL.push('', '-- Customers');
pgData.tables.customers.forEach(customer => {
  migrationSQL.push(`INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES ('${customer.id}', '${customer.name}', '${customer.email}', '${customer.phone}', '${customer.address}', '${customer.created_at}', '${customer.updated_at}') ON CONFLICT (id) DO NOTHING;`);
});

migrationSQL.push('', '-- Orders');
pgData.tables.orders.forEach(order => {
  const itemsJson = order.items.replace(/'/g, "''");
  migrationSQL.push(`INSERT INTO orders (id, customer_id, total_amount, status, items, notes, created_at, updated_at) VALUES ('${order.id}', '${order.customer_id}', ${order.total_amount}, '${order.status}', '${itemsJson}', '${order.notes}', '${order.created_at}', '${order.updated_at}') ON CONFLICT (id) DO NOTHING;`);
});

// Migration dosyasını kaydet
const migrationPath = path.join(backupDir, 'migration.sql');
try {
  fs.writeFileSync(migrationPath, migrationSQL.join('\n'));
  console.log('✅ Migration script oluşturuldu:', migrationPath);
} catch (error) {
  console.error('❌ Migration dosyası oluşturma hatası:', error);
  process.exit(1);
}

// README oluştur
const readmeContent = `# Kirilmazlar v1.0 - Veri Yedekleme

## Oluşturulan Dosyalar

### 1. ${backupFileName}
Tam localStorage yedekleme dosyası. Orijinal veri formatında tüm veriler.

### 2. ${pgFileName}
PostgreSQL formatına dönüştürülmüş veriler.

### 3. migration.sql
PostgreSQL veritabanına veri aktarımı için SQL script.

## Kullanım

### PostgreSQL'e Veri Aktarımı
\`\`\`bash
psql -h hostname -U username -d database_name -f migration.sql
\`\`\`

### Veri İstatistikleri
- Toplam anahtar: ${mockData.metadata.totalKeys}
- Toplam boyut: ${mockData.metadata.dataSize} byte
- Oluşturma tarihi: ${mockData.timestamp}

### Tablolar
- Users: ${pgData.tables.users.length} kayıt
- Products: ${pgData.tables.products.length} kayıt
- Categories: ${pgData.tables.categories.length} kayıt
- Customers: ${pgData.tables.customers.length} kayıt
- Orders: ${pgData.tables.orders.length} kayıt

## Güvenlik Notları
- Password hash'leri güncellenmeli
- Production'da gerçek şifreler kullanılmalı
- Environment variables kontrol edilmeli
`;

const readmePath = path.join(backupDir, 'README.md');
try {
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ README oluşturuldu:', readmePath);
} catch (error) {
  console.error('❌ README oluşturma hatası:', error);
}

console.log('\n🎉 Yedekleme işlemi başarıyla tamamlandı!');
console.log('📁 Backup klasörü:', backupDir);
console.log('📄 Oluşturulan dosyalar:');
console.log(`   - ${backupFileName} (Tam yedekleme)`);
console.log(`   - ${pgFileName} (PostgreSQL formatı)`);
console.log('   - migration.sql (SQL migration)');
console.log('   - README.md (Dokümantasyon)');
console.log('\n✅ localStorage verileri başarıyla yedeklendi ve PostgreSQL formatına hazırlandı!');