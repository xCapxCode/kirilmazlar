/**
 * Persistent Storage Manager
 * KirilmazlarStorage abstraction layer'ını kullanarak güvenli veri yönetimi
 */

import storage from '../core/storage/index.js';

// Veri versiyonu (schema değişikliklerini takip etmek için)
const DATA_VERSION = '1.0.0';

class PersistentStorage {
  constructor() {
    this.init();
  }

  init() {
    // İlk kez çalışıyorsa demo verilerini yükle
    const isInitialized = storage.get('demo_initialized', false);
    if (!isInitialized) {
      this.initializeDemoData();
      storage.set('demo_initialized', DATA_VERSION);
      storage.set('data_version', DATA_VERSION);
    }
  }

  initializeDemoData() {
    console.log('🔧 Demo verileri initialize ediliyor...');
    
    // Sadece boş olan verileri initialize et, mevcut verileri koru
    if (!storage.get('products', null)) {
      storage.set('products', []);
    }
    
    if (!storage.get('business_info', null)) {
      storage.set('business_info', {
        name: 'KIRILMAZLAR',
        slogan: 'Taze ve Kaliteli Ürünler',
        logo: null,
        address: 'Demo Adres',
        phone: '+90 XXX XXX XX XX',
        email: 'info@kirilmazlar.com'
      });
    }
  }

  // Products
  getProducts() {
    return storage.get('products', []);
  }

  setProducts(products) {
    try {
      storage.set('products', products);
      this.triggerUpdate('products');
      return true;
    } catch (error) {
      console.error('Products kaydedilirken hata:', error);
      return false;
    }
  }

  // Business Info
  getBusinessInfo() {
    return storage.get('business_info', {});
  }

  setBusinessInfo(businessInfo) {
    try {
      storage.set('business_info', businessInfo);
      this.triggerUpdate('businessInfo');
      return true;
    } catch (error) {
      console.error('Business info kaydedilirken hata:', error);
      return false;
    }
  }

  // Users
  getUsers() {
    return storage.get('users', []);
  }

  setUsers(users) {
    try {
      storage.set('users', users);
      this.triggerUpdate('users');
      return true;
    } catch (error) {
      console.error('Users kaydedilirken hata:', error);
      return false;
    }
  }

  // Orders
  getOrders() {
    return storage.get('orders', []);
  }

  setOrders(orders) {
    try {
      storage.set('orders', orders);
      this.triggerUpdate('orders');
      return true;
    } catch (error) {
      console.error('Orders kaydedilirken hata:', error);
      return false;
    }
  }

  // Update trigger - diğer component'leri bilgilendir
  triggerUpdate(dataType) {
    // Custom event dispatch et
    window.dispatchEvent(new CustomEvent('persistentStorageUpdate', { 
      detail: { dataType, timestamp: Date.now() } 
    }));

    // Belirli data type'lar için özel event'ler
    switch (dataType) {
      case 'products':
        window.dispatchEvent(new CustomEvent('productsUpdated'));
        break;
      case 'businessInfo':
        window.dispatchEvent(new CustomEvent('businessInfoUpdated'));
        break;
      case 'users':
        window.dispatchEvent(new CustomEvent('usersUpdated'));
        break;
      case 'orders':
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
        break;
    }

    // Storage event simülasyonu (same-tab communication için)
    if (window.localStorage) {
      const event = new StorageEvent('storage', {
        key: dataType,
        newValue: storage.get(dataType, null)
      });
      window.dispatchEvent(event);
    }
  }

  // Clear all demo data
  clearAll() {
    storage.clearAll();
    console.log('🗑️ Tüm demo verileri temizlendi');
  }

  // Export data (yedekleme için)
  exportData() {
    return storage.exportData();
  }

  // Import data (yedekten geri yükleme için)
  importData(data) {
    storage.importData(data);
    console.log('📥 Veriler import edildi');
  }

  // Veri migration kontrolü
  checkDataMigration() {
    const currentVersion = storage.get('data_version', '0.0.0');
    if (currentVersion !== DATA_VERSION) {
      console.log(`� Veri migration: ${currentVersion} → ${DATA_VERSION}`);
      // Migration logic burada olabilir
      storage.set('data_version', DATA_VERSION);
    }
  }
}

// Singleton instance
const persistentStorage = new PersistentStorage();

export default persistentStorage;
