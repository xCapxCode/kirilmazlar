/**
 * KIRILMAZLAR STORAGE MANAGER
 * Single Source of Truth for all application data
 * Bu dosya TÜMEL uygulamanın tek veri kaynağıdır
 */

class KirilmazlarStorage {
  constructor() {
    this.prefix = 'kirilmazlar_';
    this.version = '1.0.0';
    this.init();
  }

  init() {
    // Versiyon kontrolü
    const currentVersion = this.getRaw('data_version');
    if (currentVersion !== this.version) {
      console.log('🔄 Storage version update:', currentVersion, '->', this.version);
      this.migrate();
      this.setRaw('data_version', this.version);
    }
  }

  // Raw localStorage operations
  getRaw(key) {
    return localStorage.getItem(this.prefix + key);
  }

  setRaw(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  removeRaw(key) {
    localStorage.removeItem(this.prefix + key);
  }

  // JSON operations with error handling
  get(key, defaultValue = null) {
    try {
      const raw = this.getRaw(key);
      if (raw === null || raw === 'undefined' || raw === 'null') {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      this.setRaw(key, JSON.stringify(value));
      this.triggerChangeEvent(key, value);
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  remove(key) {
    this.removeRaw(key);
    this.triggerChangeEvent(key, null);
  }

  // Cross-tab communication
  triggerChangeEvent(key, value) {
    window.dispatchEvent(new CustomEvent('kirilmazlar_storage_change', {
      detail: { key, value, timestamp: Date.now() }
    }));

    // Also trigger storage event for backward compatibility
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.prefix + key,
      newValue: JSON.stringify(value),
      storageArea: localStorage
    }));
  }

  // Event listener for storage changes
  onChange(callback) {
    window.addEventListener('kirilmazlar_storage_change', (event) => {
      callback(event.detail);
    });
  }

  // Migration from old keys
  migrate() {
    console.log('🔄 Migrating storage data...');
    
    const migrations = [
      { from: 'products', to: 'products' },
      { from: 'orders', to: 'orders' },
      { from: 'productCategories', to: 'categories' },
      { from: 'sellerOrders', to: 'seller_orders' },
      { from: 'customerOrders', to: 'customer_orders' },
      { from: 'users', to: 'users' },
      { from: 'businessInfo', to: 'business_info' }
    ];

    migrations.forEach(({ from, to }) => {
      const oldData = localStorage.getItem(from);
      if (oldData && !this.getRaw(to)) {
        console.log(`📦 Migrating ${from} -> ${to}`);
        this.setRaw(to, oldData);
        localStorage.removeItem(from);
      }
    });
  }

  // Clear all data
  clear() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${keys.length} storage keys`);
  }

  // Get all keys
  getAllKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  // Debug info
  debug() {
    const keys = this.getAllKeys();
    console.log('🔍 KIRILMAZLAR STORAGE DEBUG');
    console.log('============================');
    console.log('Version:', this.version);
    console.log('Keys:', keys.length);
    
    keys.forEach(key => {
      const value = this.get(key);
      if (Array.isArray(value)) {
        console.log(`  ${key}: Array[${value.length}]`);
      } else if (typeof value === 'object' && value !== null) {
        console.log(`  ${key}: Object[${Object.keys(value).length} keys]`);
      } else {
        console.log(`  ${key}:`, value);
      }
    });
  }
}

// Create singleton instance
const storage = new KirilmazlarStorage();

// Global access for debugging
window.KirilmazlarStorage = storage;

export default storage;
