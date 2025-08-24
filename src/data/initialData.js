/**
 * KIRILMAZLAR - İlk Veri Yükleme Sistemi
 * Sistem ilk kez başlatıldığında yüklenecek gerçek veriler
 * 
 * NOT: Demo/test kullanıcıları kaldırıldı. Sadece temel admin kullanıcısı korundu.
 * Gerçek kullanıcılar uygulama içinden oluşturulacak.
 */

export const INITIAL_USERS = [
  {
    id: 'user-admin-default',
    username: 'admin',
    email: 'admin@example.com',
    password: 'CHANGE_ME_ON_FIRST_LOGIN', // Bu şifre ilk girişte değiştirilmelidir
    name: 'Sistem Yöneticisi',
    phone: '5XXXXXXXXX',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    registeredAt: new Date().toISOString()
  }
];

// Demo müşteriler kaldırıldı - gerçek müşteriler uygulama içinden oluşturulacak
export const INITIAL_CUSTOMERS = [];

// Demo customer users kaldırıldı
export const CUSTOMER_USERS = [];

// Sadece admin kullanıcısı
export const ALL_USERS = [...INITIAL_USERS];