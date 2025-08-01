// Test kullanıcıları kaldırıldı - Sadece admin kullanıcısı
export const TEST_USERS = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    name: 'Admin',
    createdAt: new Date().toISOString()
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
