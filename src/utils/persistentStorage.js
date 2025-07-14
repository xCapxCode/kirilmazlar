/**
 * Persistent Storage Manager
 * Demo modunda verilerin kalıcı olması için localStorage'ı optimize eder
 */

// localStorage anahtarları - TÜM UYGULAMA AYNI KEY'LERİ KULLANSIN
const STORAGE_KEYS = {
  PRODUCTS: 'kirilmazlar_products',
  USERS: 'kirilmazlar_users', 
  BUSINESS_INFO: 'kirilmazlar_business_info',
  ORDERS: 'kirilmazlar_orders',
  CATEGORIES: 'kirilmazlar_categories',
  SETTINGS: 'kirilmazlar_settings',
  DEMO_INITIALIZED: 'kirilmazlar_demo_initialized',
  DATA_VERSION: 'kirilmazlar_data_version'
};

// Veri versiyonu (schema değişikliklerini takip etmek için)
const DATA_VERSION = '1.0.0';

class PersistentStorage {
  constructor() {
    this.init();
  }

  init() {
    // İlk kez çalışıyorsa demo verilerini yükle
    const isInitialized = localStorage.getItem(STORAGE_KEYS.DEMO_INITIALIZED);
    if (!isInitialized) {
      this.initializeDemoData();
      localStorage.setItem(STORAGE_KEYS.DEMO_INITIALIZED, DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    }
  }

  initializeDemoData() {
    console.log('🔧 Demo verileri initialize ediliyor...');
    
    // Sadece boş olan verileri initialize et, mevcut verileri koru
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setProducts([]);
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_INFO)) {
      this.setBusinessInfo({
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
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    } catch (error) {
      console.error('Products yüklenirken hata:', error);
      return [];
    }
  }

  setProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.triggerUpdate('products');
      return true;
    } catch (error) {
      console.error('Products kaydedilirken hata:', error);
      return false;
    }
  }

  // Business Info
  getBusinessInfo() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS_INFO) || '{}');
    } catch (error) {
      console.error('Business info yüklenirken hata:', error);
      return {};
    }
  }

  setBusinessInfo(businessInfo) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(businessInfo));
      this.triggerUpdate('businessInfo');
      return true;
    } catch (error) {
      console.error('Business info kaydedilirken hata:', error);
      return false;
    }
  }

  // Users
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch (error) {
      console.error('Users yüklenirken hata:', error);
      return [];
    }
  }

  setUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.triggerUpdate('users');
      return true;
    } catch (error) {
      console.error('Users kaydedilirken hata:', error);
      return false;
    }
  }

  // Orders
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    } catch (error) {
      console.error('Orders yüklenirken hata:', error);
      return [];
    }
  }

  setOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
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
        newValue: localStorage.getItem(dataType)
      });
      window.dispatchEvent(event);
    }
  }

  // Clear all demo data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Tüm demo verileri temizlendi');
  }

  // Export data (yedekleme için)
  exportData() {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = localStorage.getItem(storageKey);
    });
    return data;
  }

  // Import data (yedekten geri yükleme için)
  importData(data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(STORAGE_KEYS[key], value);
      }
    });
    console.log('📥 Veriler import edildi');
  }
}

// Singleton instance
const persistentStorage = new PersistentStorage();

export default persistentStorage;
export { STORAGE_KEYS };
