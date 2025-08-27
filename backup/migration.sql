-- KIRILMAZLAR v1.0 - PostgreSQL Migration Script
-- Generated: 2025-08-27T12:40:05.453Z

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id VARCHAR(255) REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) REFERENCES customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
-- Users
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) VALUES ('1', 'admin@kirilmazlar.com', 'hashed_password_123', 'admin', 'Admin User', '2024-01-01T00:00:00.000Z', '2025-08-27T12:40:05.452Z', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at, is_active) VALUES ('2', 'user@kirilmazlar.com', 'hashed_password_456', 'user', 'Test User', '2024-01-02T00:00:00.000Z', '2025-08-27T12:40:05.452Z', true) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES ('1', 'Kategori 1', 'İlk kategori', true, '2024-01-01T00:00:00.000Z', '2025-08-27T12:40:05.452Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES ('2', 'Kategori 2', 'İkinci kategori', true, '2024-01-01T00:00:00.000Z', '2025-08-27T12:40:05.453Z') ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) VALUES ('1', 'Test Ürün 1', 'Test ürün açıklaması', 100.5, '1', 50, true, '2024-01-01T00:00:00.000Z', '2025-08-27T12:40:05.452Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, description, price, category_id, stock_quantity, is_active, created_at, updated_at) VALUES ('2', 'Test Ürün 2', 'İkinci test ürün', 250.75, '2', 25, true, '2024-01-02T00:00:00.000Z', '2025-08-27T12:40:05.452Z') ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES ('1', 'Müşteri 1', 'musteri1@example.com', '+90 555 123 4567', 'Test Adres 1', '2024-01-01T00:00:00.000Z', '2025-08-27T12:40:05.453Z') ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id, customer_id, total_amount, status, items, notes, created_at, updated_at) VALUES ('1', '1', 351.25, 'completed', '[{"productId":"1","quantity":2,"price":100.5},{"productId":"2","quantity":1,"price":250.75}]', 'Test sipariş', '2024-01-03T00:00:00.000Z', '2025-08-27T12:40:05.453Z') ON CONFLICT (id) DO NOTHING;