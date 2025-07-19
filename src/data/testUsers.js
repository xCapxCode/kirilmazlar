// Test kullanıcıları - Yerel geliştirme için
export const TEST_USERS = [
  {
    id: 'seller-1',
    email: 'satici@test.com',
    password: '1234',
    name: 'Test Satıcı',
    role: 'seller',
    businessId: 'business-1',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'customer-1', 
    email: 'musteri@test.com',
    password: '1234',
    name: 'Test Müşteri',
    role: 'customer',
    phone: '0555 123 4567',
    address: 'Test Adres, İstanbul',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

export const TEST_BUSINESS = {
  id: 'business-1',
  name: 'KIRILMAZLAR',
  description: 'Gıda Yönetim Sistemi',
  address: 'Test İşletme Adresi',
  phone: '0212 123 4567',
  email: 'info@kirilmazlar.com',
  logo: null,
  settings: {
    currency: 'TL',
    taxRate: 18,
    deliveryFee: 15,
    minOrderAmount: 50
  },
  createdAt: new Date().toISOString()
};