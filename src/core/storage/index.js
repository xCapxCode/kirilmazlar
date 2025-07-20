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
    
    // Development mode - use localStorage but with enhanced sync
    this.isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
    
    console.log('🔧 Storage Mode:', this.isDevelopment ? 'LOCALSTORAGE (Development with Enhanced Sync)' : 'LOCALSTORAGE (Production)');
    
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
    const { key, value, timestamp, deviceId, source } = data;
    
    // Don't process our own updates
    const currentDeviceId = this.getDeviceId();
    if (deviceId === currentDeviceId) return;

    // Apply remote update locally
    try {
      // Always use localStorage
      if (value === null) {
        localStorage.removeItem(this.prefix + key);
      } else {
        localStorage.setItem(this.prefix + key, value);
      }
      console.log('✅ Applied localStorage update from remote:', key, 'source:', source || 'unknown');
      
      // Notify local components
      window.dispatchEvent(new CustomEvent('storage_remote_update', {
        detail: { key: this.prefix + key, value, timestamp, deviceId, source }
      }));
      
    } catch (error) {
      console.error('❌ Failed to apply remote update:', error);
    }
  }

  // Broadcast changes to other devices
  // Broadcast changes to other devices
  broadcastChange(key, value) {
    if (!this.channel) return;

    try {
      const message = {
        key,
        value,
        timestamp: Date.now(),
        deviceId: this.getDeviceId(),
        type: 'storage_update',
        source: 'localStorage'
      };
      
      this.channel.postMessage(message);
      
      if (this.isDevelopment) {
        console.log('📡 Broadcasting localStorage change:', key);
      }
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

  // Raw storage operations - always use localStorage
  getRaw(key) {
    return localStorage.getItem(this.prefix + key);
  }

  setRaw(key, value) {
    localStorage.setItem(this.prefix + key, value);
    // Enhanced sync in development
    if (this.isDevelopment) {
      this.broadcastChange(key, value);
    }
  }

  removeRaw(key) {
    localStorage.removeItem(this.prefix + key);
    if (this.isDevelopment) {
      this.broadcastChange(key, null);
    }
  }

  // JSON operations with error handling
  get(key, defaultValue = null) {
    try {
      const raw = this.getRaw(key);
      if (raw === null || raw === 'undefined' || raw === 'null') {
        return defaultValue;
      }
      
      // Raw string değerler için (data_version, device_id vb.)
      if (key === 'data_version' || key === 'device_id') {
        return raw;
      }
      
      // JSON olarak parse et
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      // Parse hatası durumunda raw değeri döndür
      const raw = this.getRaw(key);
      if (raw && typeof raw === 'string') {
        return raw;
      }
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      let finalValue;
      
      // Raw string değerler için (data_version, device_id vb.)
      if (key === 'data_version' || key === 'device_id') {
        finalValue = value.toString();
      } else {
        finalValue = JSON.stringify(value);
      }
      
      this.setRaw(key, finalValue);
      
      // Broadcast to other devices
      this.broadcastChange(key, finalValue);
      
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
      detail: { 
        key, 
        fullKey: this.prefix + key,
        value, 
        timestamp: Date.now() 
      }
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
    // Always clear localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${keys.length} localStorage keys`);
    
    // Broadcast clear to other windows
    if (this.isDevelopment) {
      this.broadcastChange('storage_cleared', { timestamp: Date.now() });
    }
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
    console.log('Mode:', this.isDevelopment ? 'LOCALSTORAGE (Enhanced Dev Sync)' : 'LOCALSTORAGE (Production)');
    console.log('Version:', this.version);
    console.log('Keys:', keys.length);
    
    keys.forEach(key => {
      const rawValue = this.getRaw(key);
      
      // Raw string değerler için
      if (key === 'data_version' || key === 'device_id') {
        console.log(`  ${key}:`, rawValue);
        return;
      }
      
      // JSON değerler için parse etmeye çalış
      try {
        const value = JSON.parse(rawValue);
        if (Array.isArray(value)) {
          console.log(`  ${key}: Array[${value.length}]`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`  ${key}: Object[${Object.keys(value).length} keys]`);
        } else {
          console.log(`  ${key}:`, value);
        }
      } catch (error) {
        console.log(`  ${key}: Raw[${rawValue?.length || 0} chars]`);
      }
    });
  }

  // Subscribe to storage changes for a specific key
  subscribe(key, callback) {
    const handler = (event) => {
      if (event.detail && (event.detail.key === key || event.detail.key === this.prefix + key)) {
        const data = this.get(key);
        callback(data);
      }
    };
    
    window.addEventListener('kirilmazlar_storage_change', handler);
    
    return () => {
      window.removeEventListener('kirilmazlar_storage_change', handler);
    };
  }

  // Singleton pattern - getInstance static method
  static getInstance() {
    if (!KirilmazlarStorage.instance) {
      KirilmazlarStorage.instance = new KirilmazlarStorage();
    }
    return KirilmazlarStorage.instance;
  }
}

// TRUE SINGLETON - Only one instance allowed across all imports
let globalStorageInstance = null;

function getStorageInstance() {
  if (!globalStorageInstance) {
    globalStorageInstance = new KirilmazlarStorage();
    console.log('🔧 Created SINGLETON storage instance');
  }
  return globalStorageInstance;
}

// Export the singleton instance
const storageInstance = getStorageInstance();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.KirilmazlarStorage = KirilmazlarStorage;
  window.storage = storageInstance;
  window.getStorageInstance = getStorageInstance;
}

export default storageInstance;
