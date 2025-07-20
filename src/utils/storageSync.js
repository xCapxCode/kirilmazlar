// Storage Senkronizasyon Utility
import storage from '@core/storage';
import logger from './logger.js';

class StorageSync {
  constructor() {
    this.isDebugMode = import.meta.env.DEV;
    this.setupStorageListener();
  }

  // Storage değişikliklerini dinle
  setupStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (this.isDebugMode) {
          logger.log('🔄 Storage değişikliği tespit edildi:', {
            key: e.key,
            oldValue: e.oldValue ? JSON.parse(e.oldValue) : null,
            newValue: e.newValue ? JSON.parse(e.newValue) : null
          });
        }
      });
    }
  }

  // Mevcut storage durumunu raporla
  getStorageReport() {
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      storage: {}
    };

    // Tüm storage anahtarlarını topla
    const keys = [
      'dataVersion', 'users', 'business', 'categories', 
      'products', 'orders', 'cart', 'currentUser', 'isAuthenticated'
    ];

    keys.forEach(key => {
      const value = storage.get(key);
      report.storage[key] = {
        exists: value !== null,
        type: Array.isArray(value) ? 'array' : typeof value,
        length: Array.isArray(value) ? value.length : null,
        size: JSON.stringify(value || {}).length
      };
    });

    return report;
  }

  // Storage'ı temizle ve yeniden başlat
  resetStorage() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Sayfayı yenile
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      
      logger.log('🧹 Storage temizlendi ve sayfa yenilendi');
      return true;
    } catch (error) {
      logger.error('❌ Storage temizleme hatası:', error);
      return false;
    }
  }

  // Development için debug bilgileri
  debugStorage() {
    if (!this.isDebugMode) return;

    console.group('🔍 STORAGE DEBUG RAPORU');
    console.log('📊 Storage Raporu:', this.getStorageReport());
    
    // Kritik verileri kontrol et
    const users = storage.get('users', []);
    const products = storage.get('products', []);
    const currentUser = storage.get('currentUser');
    
    console.log('👥 Kullanıcılar:', users.length, 'adet');
    console.log('📦 Ürünler:', products.length, 'adet');
    console.log('🔐 Aktif Kullanıcı:', currentUser?.email || 'Yok');
    console.log('🔑 Kimlik Doğrulama:', storage.get('isAuthenticated', false));
    
    console.groupEnd();
  }

  // Veri export (tarayıcılar arası paylaşım için)
  exportForSharing() {
    const data = {
      version: storage.get('dataVersion'),
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent.split(' ')[0], // Sadece tarayıcı adı
      data: {
        users: storage.get('users', []),
        business: storage.get('business'),
        categories: storage.get('categories', []),
        products: storage.get('products', []),
        orders: storage.get('orders', [])
      }
    };

    const jsonString = JSON.stringify(data, null, 2);
    
    // Clipboard'a kopyala (mümkünse)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString).then(() => {
        logger.log('📋 Veri clipboard\'a kopyalandı');
      });
    }

    return jsonString;
  }
}

// Global erişim için window'a ekle (sadece development'da)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.storageSync = new StorageSync();
  window.debugStorage = () => window.storageSync.debugStorage();
  window.resetStorage = () => window.storageSync.resetStorage();
  window.exportStorage = () => window.storageSync.exportForSharing();
}

export default new StorageSync();