/**
 * KIRILMAZLAR - İlk Veri Yükleme Sistemi
 * Sistem ilk kez başlatıldığında yüklenecek gerçek veriler
 */

export const INITIAL_USERS = [
  {
    id: 'user-admin-unerbul',
    username: 'unerbul',
    email: 'unerbul@hotmail.com',
    password: '237711',
    name: 'Bülent ÜNER',
    phone: '53234181409',
    role: 'admin',
    isActive: true,
    createdAt: '2025-08-02T01:15:09.764Z',
    registeredAt: '2025-08-02T01:15:09.764Z'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 1754097174513,
    name: 'Bülent ÜNER',
    email: 'bulent@hotmail.com',
    phone: '53234181409',
    username: 'bulent',
    password: '237711',
    companyName: '',
    companyTitle: '',
    address: 'Fethiye mah .2 Barutluk Sk. No:1000',
    city: 'Bursa',
    district: 'Nilüfer',
    postalCode: '16100',
    accountType: 'personal',
    notes: '',
    status: 'active',
    registeredAt: '2025-08-02T01:12:54.513Z',
    lastLoginAt: '2025-08-02T01:12:54.513Z',
    avatar: null,
    createdAt: '2025-08-02T01:12:54.513Z',
    updatedAt: '2025-08-02T03:45:23.917Z',
    orderCount: 0,
    totalSpent: 0,
    lastOrderDate: null,
    lastOrderStatus: 'Henüz sipariş yok',
    lastOrderAmount: 0,
    averageOrderValue: 0
  },
  {
    id: 1754103943712,
    name: 'Neset AVVURAN',
    email: 'neset@hotmail.com',
    phone: '05323418109',
    username: 'neset',
    password: '237711',
    companyName: '',
    companyTitle: '',
    address: 'Gazi Caddesi no:23',
    city: 'Elazığ',
    district: 'Merkez',
    postalCode: '23100',
    accountType: 'personal',
    notes: '',
    status: 'active',
    registeredAt: '2025-08-02T03:05:43.712Z',
    lastLoginAt: '2025-08-02T03:05:43.712Z',
    avatar: null,
    createdAt: '2025-08-02T03:05:43.712Z',
    updatedAt: '2025-08-02T03:05:43.712Z'
  }
];

// Customer'lar için otomatik user hesapları oluştur
export const CUSTOMER_USERS = INITIAL_CUSTOMERS.map(customer => ({
  id: `user-customer-${customer.id}`,
  username: customer.username,
  email: customer.email,
  password: customer.password,
  name: customer.name,
  phone: customer.phone,
  role: 'customer',
  customerId: customer.id,
  createdAt: customer.createdAt,
  isActive: true,
  address: customer.address,
  city: customer.city,
  district: customer.district,
  postalCode: customer.postalCode,
  companyName: customer.companyName,
  companyTitle: customer.companyTitle,
  accountType: customer.accountType,
  registeredAt: customer.registeredAt
}));

// Tüm kullanıcıları birleştir
export const ALL_USERS = [...INITIAL_USERS, ...CUSTOMER_USERS];