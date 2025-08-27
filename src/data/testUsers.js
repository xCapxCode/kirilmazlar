// Test kullanıcıları - Development için
export const TEST_USERS = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@kirilmazlar.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', // password: admin123
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 'user-2',
    username: 'test',
    email: 'test@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', // password: admin123
    name: 'Test User',
    role: 'customer',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
];

export const TEST_BUSINESS = {
  id: 'business-1',
  name: 'KIRILMAZLAR',
  description: 'Gıda Yönetim Sistemi',
  address: 'Test İşletme Adresi',
  phone: '0212 123 4567',
  email: 'info@example.com',
  logo: null,
  settings: {
    currency: 'TL',
    taxRate: 18,
    deliveryFee: 15,
    minOrderAmount: 50
  },
  createdAt: new Date().toISOString()
};
