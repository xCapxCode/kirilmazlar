// Test kullanıcıları - Yerel geliştirme için
export const TEST_USERS = [
  // Test kullanıcıları silindi - gerçek kullanıcılar panel üzerinden oluşturulacak
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