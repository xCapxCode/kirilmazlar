/**
 * KIRILMAZLAR STORAGE MANAGER
 * Single Source of Truth for all application data
 * Bu dosya TÜMEL uygulamanın tek veri kaynağıdır
 */

class KirilmazlarStorage {
  constructor() {
    this.prefix = 'kirilmazlar_';
    this.version = '1.0.0';
    this.channel = null;
    this.init();
    this.setupCrossDeviceSync();
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

  // CROSS-DEVICE SYNC SETUp
  setupCrossDeviceSync() {
    try {
      // BroadcastChannel for same-origin communication
      this.channel = new BroadcastChannel('kirilmazlar_sync');
      
      this.channel.addEventListener('message', (event) => {
        console.log('📡 Cross-device sync received:', event.data);
        this.handleRemoteUpdate(event.data);
      });

      // Storage event for cross-tab sync
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(this.prefix)) {
          console.log('🔄 Storage event detected:', event.key);
          this.notifyStorageChange(event.key, event.newValue);
        }
      });

      console.log('✅ Cross-device sync enabled');
    } catch (error) {
      console.warn('⚠️ Cross-device sync not available:', error);
    }
  }

  // Handle remote updates from other devices
  handleRemoteUpdate(data) {
    const { key, value, timestamp, deviceId } = data;
    
    // Don't process our own updates
    const currentDeviceId = this.getDeviceId();
    if (deviceId === currentDeviceId) return;

    // Apply remote update locally
    try {
      if (value === null) {
        this.removeRaw(key);
      } else {
        this.setRaw(key, value);
      }
      
      // Notify local components
      window.dispatchEvent(new CustomEvent('storage_remote_update', {
        detail: { key: this.prefix + key, value, timestamp, deviceId }
      }));
      
      console.log('✅ Applied remote update:', key);
    } catch (error) {
      console.error('❌ Failed to apply remote update:', error);
    }
  }

  // Broadcast changes to other devices
  broadcastChange(key, value) {
    if (!this.channel) return;

    try {
      const message = {
        key,
        value,
        timestamp: Date.now(),
        deviceId: this.getDeviceId(),
        type: 'storage_update'
      };
      
      this.channel.postMessage(message);
      console.log('📡 Broadcasted change:', key);
    } catch (error) {
      console.error('❌ Broadcast failed:', error);
    }
  }

  // Get unique device identifier
  getDeviceId() {
    let deviceId = this.getRaw('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      this.setRaw('device_id', deviceId);
    }
    return deviceId;
  }

  // Notify about storage changes
  notifyStorageChange(fullKey, newValue) {
    window.dispatchEvent(new CustomEvent('kirilmazlar_storage_change', {
      detail: { 
        key: fullKey, 
        value: newValue,
        timestamp: Date.now()
      }
    }));
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
      const jsonValue = JSON.stringify(value);
      this.setRaw(key, jsonValue);
      
      // Broadcast to other devices
      this.broadcastChange(key, jsonValue);
      
      // Trigger local events
      this.triggerChangeEvent(key, value);
      
      console.log('💾 Stored with cross-device sync:', key);
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  remove(key) {
    this.removeRaw(key);
    
    // Broadcast removal to other devices  
    this.broadcastChange(key, null);
    
    // Trigger local events
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
